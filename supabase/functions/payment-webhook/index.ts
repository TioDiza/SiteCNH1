import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função principal que lida com a requisição
const handler = async (req: Request): Promise<Response> => {
  console.log(`[payment-webhook] Received request: ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('[payment-webhook] Handling OPTIONS request.');
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let payload;
  try {
    // Lê o corpo como texto primeiro para depuração, o que é mais seguro
    const bodyText = await req.text();
    console.log('[payment-webhook] Raw request body:', bodyText);
    
    // Se o corpo estiver vazio, não tente fazer o parse do JSON
    if (!bodyText) {
      console.warn('[payment-webhook] Received empty request body.');
      return new Response('OK (empty body)', { headers: corsHeaders, status: 200 });
    }
    
    payload = JSON.parse(bodyText);
    console.log('[payment-webhook] Webhook payload parsed successfully:', payload);
  } catch (e) {
    console.error('[payment-webhook] Error parsing JSON payload:', e);
    // Retorna um erro claro se o JSON for inválido
    return new Response('Invalid JSON payload', {
      headers: corsHeaders,
      status: 400,
    });
  }

  const transactionId = payload.idTransaction || payload.externalReference;
  const status = payload.status;
  let dbStatus = '';

  if (!transactionId || !status) {
      console.warn('[payment-webhook] Webhook received without transactionId or status. Payload:', payload);
      return new Response('OK (missing data)', { headers: corsHeaders, status: 200 });
  }

  switch (status) {
    case 'paid':
      dbStatus = 'paid';
      break;
    case 'SaquePago':
      dbStatus = 'paid';
      break;
    case 'SaqueFalhou':
      dbStatus = 'failed';
      break;
    case 'refund_approved':
      dbStatus = 'refunded';
      break;
    case 'canceled':
       dbStatus = 'canceled';
       break;
    default:
      console.warn(`[payment-webhook] Received unhandled webhook status: '${status}'`);
      return new Response('OK (unhandled status)', { headers: corsHeaders, status: 200 });
  }

  const { error } = await supabaseAdmin
    .from('transactions')
    .update({ status: dbStatus, raw_gateway_response: payload })
    .eq('gateway_transaction_id', transactionId);

  if (error) {
    console.error(`[payment-webhook] DB Error: Failed to update transaction ${transactionId} to status ${dbStatus}:`, error);
  } else {
    console.log(`[payment-webhook] DB Success: Successfully updated transaction ${transactionId} to status ${dbStatus}`);
  }

  // Sempre responda 200 OK para o gateway saber que recebemos a notificação
  return new Response('OK', { headers: corsHeaders, status: 200 });
};

// Inicia o servidor e envolve o handler em um try-catch de nível superior
serve(async (req) => {
  try {
    return await handler(req);
  } catch (error) {
    console.error('[payment-webhook] Critical error caught by server:', error);
    return new Response('Internal Server Error', {
      headers: corsHeaders,
      status: 500,
    });
  }
});