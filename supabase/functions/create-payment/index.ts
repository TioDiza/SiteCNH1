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
      amount,
      payment_method: 'pix',
      postback_url: WEBHOOK_URL,
      customer,
      items,
      pix: {
        expires_in_days: 1,
      },
      metadata,
    };

    console.log('[create-payment] Sending payload to FusionPay:', JSON.stringify(fusionPayload, null, 2));
    const fusionResponse = await createFusionPayTransaction(fusionPayload);
    console.log('[create-payment] Received response from FusionPay:', JSON.stringify(fusionResponse, null, 2));

    // The actual transaction data can be nested inside a 'data' object or be at the root.
    const transactionData = fusionResponse.data || fusionResponse;

    if (!transactionData || !transactionData.id || !transactionData.pix || !transactionData.pix.qrcode_text) {
      console.error('[create-payment] Invalid response structure from FusionPay:', fusionResponse);
      return new Response(JSON.stringify({ error: 'Resposta inválida do provedor de pagamento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

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
      raw_gateway_response: transactionData,
    };

    const { error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert(transactionToInsert);

    if (dbError) {
      console.error('[create-payment] Error saving transaction to DB:', dbError);
      // Log the error but continue, so the user can pay.
    } else {
        console.log('[create-payment] Transaction saved to DB successfully.');
    }

    // Transform the response to match the format expected by the frontend (PascalCase)
    const responseForFrontend = {
        Id: transactionData.id,
        Amount: transactionData.amount,
        Pix: {
            QrCodeText: transactionData.pix.qrcode_text,
        },
    };

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