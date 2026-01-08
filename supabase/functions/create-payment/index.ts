import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getPixUpToken } from "../_shared/pixup.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PIXUP_QRCODE_URL = 'https://api.pixupbr.com/v2/pix/qrcode';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { client, amount, lead_id, starlink_customer_id } = await req.json();

    if (!client || !client.name || !client.document || !amount) {
      return new Response(JSON.stringify({ error: 'Faltam informações obrigatórias para o pagamento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!lead_id && !starlink_customer_id) {
        return new Response(JSON.stringify({ error: 'É necessário um ID de lead ou de cliente Starlink.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const accessToken = await getPixUpToken();

    const webhookUrl = 'https://lubhskftgevcgfkzxozx.supabase.co/functions/v1/payment-webhook';
    const externalId = lead_id || starlink_customer_id;

    const payload = {
      amount: amount,
      external_id: externalId,
      postbackUrl: webhookUrl,
      payerQuestion: "Pagamento referente ao Programa CNH do Brasil",
      payer: {
        name: client.name,
        document: client.document,
      }
    };

    const qrResponse = await fetch(PIXUP_QRCODE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const qrData = await qrResponse.json();

    if (!qrResponse.ok) {
        console.error('[create-payment] Erro da API PixUp:', qrData);
        const errorMessage = qrData.message || 'Falha ao gerar a cobrança PIX.';
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: qrResponse.status,
        });
    }

    const transactionPayload = {
        gateway_transaction_id: qrData.transactionId,
        amount: amount,
        status: 'pending',
        provider: 'pixup',
        raw_gateway_response: qrData,
        lead_id: lead_id || null,
        starlink_customer_id: starlink_customer_id || null,
    };

    const { error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert(transactionPayload);

    if (dbError) {
      console.error('[create-payment] Erro ao salvar no banco de dados:', dbError);
      return new Response(JSON.stringify({ error: 'Falha ao registrar a transação.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      status: 'success',
      pixCode: qrData.qrcode,
      transactionId: qrData.transactionId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[create-payment] Erro inesperado:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})