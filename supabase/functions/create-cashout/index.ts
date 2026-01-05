import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROYAL_BANKING_CASHOUT_API_URL = 'https://api.royalbanking.com.br/c1/cashout/';
// IMPORTANT: Set this in the Supabase Dashboard: Project -> Edge Functions -> create-cashout -> Manage Secrets
const ROYAL_BANKING_CASHOUT_API_KEY = Deno.env.get('ROYAL_BANKING_CASHOUT_API_KEY'); 

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!ROYAL_BANKING_CASHOUT_API_KEY) {
    console.error('ROYAL_BANKING_CASHOUT_API_KEY secret is not set.');
    return new Response(JSON.stringify({ error: 'A chave da API para o gateway de pagamento (cash-out) não está configurada.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { amount, keypix, pixType, name, cpf, postbackUrl } = await req.json();

    if (!amount || !keypix || !pixType || !name || !cpf || !postbackUrl) {
      return new Response(JSON.stringify({ error: 'Faltam informações obrigatórias para o saque.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 422, // As per docs
      });
    }

    const payload = {
      'api-key': ROYAL_BANKING_CASHOUT_API_KEY,
      amount,
      keypix,
      pixType,
      name,
      cpf,
      postbackUrl
    };

    const response = await fetch(ROYAL_BANKING_CASHOUT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-cashout function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})