import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Standardized Response Interface ---
interface CpfData {
  name: string;
  birthDate: string;
  gender: string;
}

interface StandardizedResponse {
  success: boolean;
  data?: CpfData;
  message?: string;
}

// --- API Provider Handlers ---

/**
 * Handler for the CPFHub.io API.
 */
async function handleCpfHub(cpf: string, apiKey: string): Promise<StandardizedResponse> {
  const url = `https://api.cpfhub.io/cpf/${cpf}`;
  const response = await fetch(url, {
    headers: { 'x-api-key': apiKey }
  });
  const data = await response.json();

  if (response.ok && data.success) {
    return {
      success: true,
      data: {
        name: data.data.name,
        birthDate: data.data.birthDate,
        gender: data.data.gender,
      }
    };
  } else {
    throw new Error(data.message || `CPFHub failed with status ${response.status}`);
  }
}

/**
 * Handler for the HubDoDesenvolvedor API.
 */
async function handleHubDev(cpf: string, apiKey: string): Promise<StandardizedResponse> {
  const url = `https://ws.hubdodesenvolvedor.com.br/v2/cadastropf/?cpf=${cpf}&token=${apiKey}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();

  if (response.ok && data.status === true && data.return === "OK") {
    // Transform the response to the standardized format
    const gender = data.result.genero?.toUpperCase().startsWith('F') ? 'F' : 'M';
    return {
      success: true,
      data: {
        name: data.result.nomeCompleto,
        birthDate: data.result.dataDeNascimento,
        gender: gender,
      }
    };
  } else {
    throw new Error(data.result || `HubDev failed with status ${response.status}`);
  }
}


// --- API Provider Configuration ---
const apiProviders = [
  { name: 'CPF_API_KEY', key: Deno.env.get('CPF_API_KEY'), handler: handleCpfHub },
  { name: 'CPF_API_KEY_2', key: Deno.env.get('CPF_API_KEY_2'), handler: handleCpfHub },
  { name: 'CPF_API_KEY_3', key: Deno.env.get('CPF_API_KEY_3'), handler: handleHubDev },
];


// --- Main Server Logic ---
serve(async (req) => {
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
    
    const configuredProviders = apiProviders.filter(p => p.key);

    if (configuredProviders.length === 0) {
        console.error('[validate-cpf] No CPF API keys are set in environment variables.');
        return new Response(JSON.stringify({ error: 'O serviço de validação de CPF não está configurado.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    for (const provider of configuredProviders) {
      console.log(`[validate-cpf] Attempting validation with provider: ${provider.name}`);
      try {
        // Call the specific handler for the provider
        const result = await provider.handler(unformattedCpf, provider.key!);
        
        if (result.success) {
          console.log(`[validate-cpf] CPF validation successful with ${provider.name} for CPF: ${cpf}`);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      } catch (error) {
        console.warn(`[validate-cpf] Provider ${provider.name} failed:`, error.message);
      }
    }

    console.error('[validate-cpf] All CPF validation providers failed.');
    return new Response(JSON.stringify({ success: false, message: 'Não foi possível validar o CPF no momento. Tente novamente mais tarde.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
    });

  } catch (error) {
    console.error('[validate-cpf] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})