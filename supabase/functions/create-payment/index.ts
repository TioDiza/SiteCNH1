import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { createFusionPayTransaction } from '../_shared/fusionpay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WEBHOOK_URL = `https://lubhskftgevcgfkzxozx.supabase.co/functions/v1/payment-webhook`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, customer, items, metadata } = await req.json();

    if (!amount || !customer || !items || !metadata || (!metadata.lead_id && !metadata.starlink_customer_id)) {
      console.error('[create-payment] Missing required fields in request body.');
      return new Response(JSON.stringify({ error: 'Dados insuficientes para criar a transação.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const fusionPayload = {
      amount: amount / 100, // Convertendo de centavos para Reais
      payment_method: 'pix',
      postback_url: WEBHOOK_URL,
      customer,
      items: items.map((item: any) => ({
        ...item,
        unit_price: item.unit_price / 100, // Convertendo também o preço do item
      })),
      pix: {
        expires_in_days: 1,
      },
      metadata,
    };

    console.log('[create-payment] Sending payload to FusionPay:', JSON.stringify(fusionPayload, null, 2));
    const fusionResponse = await createFusionPayTransaction(fusionPayload);
    console.log('[create-payment] Received response from FusionPay:', JSON.stringify(fusionResponse, null, 2));

    const transactionData = fusionResponse.data || fusionResponse;

    if (!transactionData || !transactionData.id || !transactionData.pix || !transactionData.pix.qrcode_text) {
      console.error('[create-payment] Invalid response structure from FusionPay:', fusionResponse);
      return new Response(JSON.stringify({ error: 'Resposta inválida do provedor de pagamento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

    console.log('[create-payment] Response from FusionPay is valid. Proceeding to save transaction.');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const transactionToInsert = {
      lead_id: metadata.lead_id || null,
      starlink_customer_id: metadata.starlink_customer_id || null,
      gateway_transaction_id: transactionData.id,
      amount: transactionData.amount,
      status: 'pending',
      provider: 'fusion_pay',
    };

    console.log('[create-payment] Attempting to insert transaction into database with data:', JSON.stringify(transactionToInsert));
    const { data: insertedTransaction, error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert(transactionToInsert)
      .select('id')
      .single();

    if (dbError || !insertedTransaction) {
      console.error('[create-payment] Error saving transaction to DB:', dbError);
      console.error('[create-payment] Data that failed to insert:', JSON.stringify(transactionToInsert));
      throw new Error('Falha ao registrar a transação. Por favor, tente novamente.');
    } else {
        console.log(`[create-payment] Transaction saved to DB successfully. Internal ID: ${insertedTransaction.id}`);
    }

    const responseForFrontend = {
        Id: transactionData.id,
        Amount: transactionData.amount,
        Pix: {
            QrCodeText: transactionData.pix.qrcode_text,
        },
    };
    
    console.log('[create-payment] Formatting response for frontend and sending.');
    return new Response(JSON.stringify(responseForFrontend), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[create-payment] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})