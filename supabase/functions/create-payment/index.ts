import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROYAL_BANKING_API_URL = 'https://api.royalbanking.com.br/v1/gateway/';
// IMPORTANT: Set this in the Supabase Dashboard: Project -> Edge Functions -> create-payment -> Manage Secrets
const ROYAL_BANKING_API_KEY = Deno.env.get('ROYAL_BANKING_API_KEY'); 

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!ROYAL_BANKING_API_KEY) {
    console.error('ROYAL_BANKING_API_KEY secret is not set.');
    return new Response(JSON.stringify({ error: 'A chave da API para o gateway de pagamento não está configurada.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { client, amount } = await req.json();

    if (!client || !client.name || !client.document || !client.telefone || !client.email || !amount) {
      return new Response(JSON.stringify({ error: 'Faltam informações obrigatórias para o pagamento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const payload = {
      'api-key': ROYAL_BANKING_API_KEY,
      amount: amount,
      client: {
        name: client.name,
        document: client.document,
        telefone: client.telefone,
        email: client.email,
      },
      callbackUrl: "https://exemplo.com/royalbanking/callback" // Placeholder
    };

    const response = await fetch(ROYAL_BANKING_API_URL, {
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
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})