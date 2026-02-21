import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { getFusionPayAuthHeader } from '../_shared/fusionpay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FUSIONPAY_COMPANY_URL = 'https://api.fusionpay.com.br/v1/company';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = getFusionPayAuthHeader();

    const response = await fetch(FUSIONPAY_COMPANY_URL, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[get-company-data] Falha ao buscar dados da empresa:', response.status, data);
      return new Response(JSON.stringify({ error: data.message || 'Falha na comunicação com o provedor de pagamento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }
    
    console.log('[get-company-data] Dados da empresa buscados com sucesso.');
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[get-company-data] Erro inesperado:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})