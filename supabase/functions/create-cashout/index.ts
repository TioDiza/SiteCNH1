import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.error('[create-cashout] This function is disabled pending migration to the new payment provider (FusionPay). Missing cash-out API documentation.');
  
  return new Response(JSON.stringify({ 
    error: 'A funcionalidade de cash-out está temporariamente indisponível. É necessário atualizar para a nova API de pagamento.' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 503, // Service Unavailable
  });
})