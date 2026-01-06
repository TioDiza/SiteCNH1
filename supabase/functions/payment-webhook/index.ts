import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`[payment-webhook] Received request: ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('[payment-webhook] Handling OPTIONS request.');
    return new Response(null, { headers: corsHeaders });
  }

  const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET_TOKEN');
  if (!WEBHOOK_SECRET) {
    console.error('[payment-webhook] Critical Error: WEBHOOK_SECRET_TOKEN is not set in Supabase secrets.');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (token !== WEBHOOK_SECRET) {
    console.warn(`[payment-webhook] Unauthorized access attempt with invalid token: ${token}`);
    return new Response('Unauthorized', { status: 401 });
  }
  console.log('[payment-webhook] Token validation successful.');

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let payload;
  try {
    const bodyText = await req.text();
    if (!bodyText) {
      console.warn('[payment-webhook] Received empty request body.');
      return new Response(JSON.stringify(200), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
    }
    payload = JSON.parse(bodyText);
    console.log('[payment-webhook] Webhook payload parsed successfully:', payload);
  } catch (e) {
    console.error('[payment-webhook] Error parsing JSON payload:', e);
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
      return new Response(JSON.stringify(200), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
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
      return new Response(JSON.stringify(200), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
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

  return new Response(JSON.stringify(200), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
};

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