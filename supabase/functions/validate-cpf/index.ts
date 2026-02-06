import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define a lista de provedores de API
const apiProviders = [
  { name: 'CPF_API_KEY', key: Deno.env.get('CPF_API_KEY') },
  { name: 'CPF_API_KEY_2', key: Deno.env.get('CPF_API_KEY_2') },
  { name: 'CPF_API_KEY_3', key: Deno.env.get('CPF_API_KEY_3') },
];

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

    const unformattedCpf = cpf.replace(/\D/g, '');
    const url = `https://api.cpfhub.io/cpf/${unformattedCpf}`;

    // Filtra apenas os provedores que têm uma chave configurada
    const configuredProviders = apiProviders.filter(p => p.key);

    if (configuredProviders.length === 0) {
        console.error('[validate-cpf] No CPF API keys are set in environment variables.');
        return new Response(JSON.stringify({ error: 'O serviço de validação de CPF não está configurado.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    // Tenta cada provedor em sequência
    for (const provider of configuredProviders) {
      console.log(`[validate-cpf] Attempting validation with provider: ${provider.name}`);
      try {
        const response = await fetch(url, {
          headers: { 'x-api-key': provider.key }
        });

        const data = await response.json();

        // Se a resposta for bem-sucedida (HTTP 200) E a API confirmar o sucesso, retorna os dados
        if (response.ok && data.success) {
          console.log(`[validate-cpf] CPF validation successful with ${provider.name} for CPF: ${cpf}`);
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        } else {
          // Se falhar, loga o erro e continua para o próximo provedor
          console.warn(`[validate-cpf] Provider ${provider.name} failed. Status: ${response.status}`, data);
        }
      } catch (error) {
        // Se houver um erro de rede, loga e continua
        console.error(`[validate-cpf] Network or parsing error with provider ${provider.name}:`, error);
      }
    }

    // Se todos os provedores falharem
    console.error('[validate-cpf] All CPF validation providers failed.');
    return new Response(JSON.stringify({ error: 'Não foi possível validar o CPF no momento. Tente novamente mais tarde.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503, // Service Unavailable
    });

  } catch (error) {
    console.error('[validate-cpf] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})