import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { sendMetaPurchaseEvent } from '../_shared/meta.ts'

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

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let payload;
  try {
    const bodyText = await req.text();
    if (!bodyText) {
      console.warn('[payment-webhook] Received empty request body.');
      return new Response(JSON.stringify({ status: 'ok' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
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

  const transactionId = payload.Id;
  const status = payload.Status;
  let dbStatus = '';

  if (!transactionId || !status) {
      console.warn('[payment-webhook] Webhook received without Id or Status. Payload:', payload);
      return new Response(JSON.stringify({ status: 'ok' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }

  switch (status.toUpperCase()) {
    case 'PAID':
      dbStatus = 'paid';
      break;
    case 'REFUNDED':
      dbStatus = 'refunded';
      break;
    case 'REFUSED':
    case 'EXPIRED':
    case 'ERROR':
       dbStatus = 'canceled';
       break;
    default:
      console.warn(`[payment-webhook] Received unhandled webhook status: '${status}' for transaction ${transactionId}`);
      return new Response(JSON.stringify({ status: 'ok' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  }

  console.log(`[payment-webhook] Processing transaction ${transactionId} with status ${dbStatus}`);

  const { data: updatedTransaction, error } = await supabaseAdmin
    .from('transactions')
    .update({ status: dbStatus, raw_gateway_response: payload })
    .eq('gateway_transaction_id', transactionId)
    .select('*, leads(email, phone), starlink_customers(phone)')
    .single();

  if (error) {
    console.error(`[payment-webhook] DB Error: Failed to update transaction ${transactionId} to status ${dbStatus}:`, error);
  } else {
    console.log(`[payment-webhook] DB Success: Successfully updated transaction ${transactionId} to status ${dbStatus}`);
    
    if (dbStatus === 'paid' && updatedTransaction && !updatedTransaction.meta_event_sent) {
      console.log(`[payment-webhook] Transaction ${transactionId} is paid and Meta event not sent yet. Preparing to send.`);
      const userData = {
        em: updatedTransaction.leads?.email,
        ph: updatedTransaction.leads?.phone || updatedTransaction.starlink_customers?.phone,
      };

      if (updatedTransaction.event_id && (userData.em || userData.ph)) {
        console.log(`[payment-webhook] Triggering Meta Purchase event for transaction ${transactionId} with event_id ${updatedTransaction.event_id}`);
        await sendMetaPurchaseEvent(updatedTransaction.amount, 'BRL', updatedTransaction.event_id, userData, null, null);
        
        console.log(`[payment-webhook] Marking meta_event_sent as true for transaction ${updatedTransaction.id}`);
        const { error: updateMetaError } = await supabaseAdmin
          .from('transactions')
          .update({ meta_event_sent: true })
          .eq('id', updatedTransaction.id);

        if (updateMetaError) {
          console.error(`[payment-webhook] DB Error: Failed to set meta_event_sent for transaction ${updatedTransaction.id}`, updateMetaError);
        } else {
          console.log(`[payment-webhook] DB Success: meta_event_sent marked as true for transaction ${updatedTransaction.id}`);
        }
      } else {
        console.warn(`[payment-webhook] Could not send Meta event for transaction ${transactionId}. Missing event_id or user data. Event ID: ${updatedTransaction.event_id}, User Data:`, userData);
      }
    }
  }

  return new Response(JSON.stringify({ status: 'ok' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
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