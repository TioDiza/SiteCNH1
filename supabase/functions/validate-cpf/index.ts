import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // [validate-cpf] Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { cpf } = await req.json();
    if (!cpf) {
      console.error('[validate-cpf] CPF is missing in the request body.');
      return new Response(JSON.stringify({ error: 'CPF is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const apiKey = Deno.env.get('CPF_API_KEY');
    if (!apiKey) {
        console.error('[validate-cpf] CPF_API_KEY is not set in environment variables.');
        return new Response(JSON.stringify({ error: 'O serviço de validação de CPF não está configurado.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    const url = `https://api.cpfhub.io/cpf/${cpf.replace(/\D/g, '')}`;
    
    console.log(`[validate-cpf] Calling CPF Hub API for CPF: ${cpf}`);

    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(`[validate-cpf] CPF Hub API returned an error. Status: ${response.status}`, data);
        return new Response(JSON.stringify({ error: `Erro do serviço de validação: ${data.message || 'Internal Server Error'}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });
    }
    
    console.log(`[validate-cpf] CPF validation successful for CPF: ${cpf}`);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[validate-cpf] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})