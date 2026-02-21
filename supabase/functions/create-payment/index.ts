import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { createFusionPayPix } from "../_shared/fusionpay.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { client, amount, lead_id, starlink_customer_id, event_id } = await req.json();

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

    const webhookUrl = 'https://lubhskftgevcgfkzxozx.supabase.co/functions/v1/payment-webhook';
    
    const isStarlink = !!starlink_customer_id;
    const description = isStarlink
      ? "Pagamento referente à compra da antena Starlink"
      : "Pagamento referente ao Programa CNH do Brasil";
    const tangible = isStarlink;

    const customerPayload: {
        name: string;
        document: { type: string; number: string; };
        email?: string;
        phone?: string;
    } = {
        name: client.name,
        document: {
          type: "cpf",
          number: client.document,
        }
    };

    if (client.email) {
        customerPayload.email = client.email;
    }
    if (client.phone) {
        const unformattedPhone = client.phone.replace(/\D/g, '');
        customerPayload.phone = unformattedPhone;
    }

    const payload = {
      amount: Math.round(amount * 100),
      payment_method: "pix",
      postback_url: webhookUrl,
      customer: customerPayload,
      items: [
        {
          title: description,
          unit_price: Math.round(amount * 100),
          quantity: 1,
          tangible: tangible
        }
      ],
      metadata: {
        "provider_name": "GovBR CNH/Starlink"
      }
    };

    const fusionPayResponse = await createFusionPayPix(payload);

    const transactionId = fusionPayResponse.transaction?.id;
    const pixCode = fusionPayResponse.transaction?.emv;

    if (!transactionId || !pixCode) {
        console.error('[create-payment] Resposta da FusionPay não contém ID da transação ou código PIX.', fusionPayResponse);
        throw new Error('Resposta inválida do provedor de pagamento.');
    }

    const transactionPayload = {
        gateway_transaction_id: transactionId,
        amount: amount,
        status: 'pending',
        provider: 'fusionpay',
        raw_gateway_response: fusionPayResponse,
        lead_id: lead_id || null,
        starlink_customer_id: starlink_customer_id || null,
        event_id: event_id || null,
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
      pixCode: pixCode,
      transactionId: transactionId,
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