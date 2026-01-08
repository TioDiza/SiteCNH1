import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { getPixUpToken } from "../_shared/pixup.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PIXUP_PAYMENT_URL = 'https://api.pixupbr.com/v2/pix/payment';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, description, external_id, creditParty } = await req.json();

    if (!amount || !creditParty || !creditParty.key || !creditParty.taxId || !creditParty.name) {
      console.error('[create-cashout] Faltam informações obrigatórias.');
      return new Response(JSON.stringify({ error: 'Faltam informações obrigatórias para o pagamento (amount, creditParty.{key, taxId, name}).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const accessToken = await getPixUpToken();

    const payload = {
      amount,
      description: description || "Pagamento via CNH do Brasil",
      external_id: external_id || crypto.randomUUID(),
      creditParty: {
        key: creditParty.key,
        taxId: creditParty.taxId,
        name: creditParty.name,
        ...(creditParty.bank && { bank: creditParty.bank }),
        ...(creditParty.branch && { branch: creditParty.branch }),
        ...(creditParty.account && { account: creditParty.account }),
      }
    };

    const response = await fetch(PIXUP_PAYMENT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('[create-cashout] Erro da API PixUp:', data);
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });
    }

    console.log('[create-cashout] Pagamento realizado com sucesso:', data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[create-cashout] Erro inesperado:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})