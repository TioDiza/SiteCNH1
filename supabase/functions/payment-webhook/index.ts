import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { sendMetaPurchaseEvent } from '../_shared/meta.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Main server logic
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const webhookData = await req.json();
    console.log('[payment-webhook] Received webhook data:', JSON.stringify(webhookData, null, 2));

    // We are only interested in transaction updates for now.
    if (!webhookData.PaymentMethod) {
        console.log('[payment-webhook] Webhook is not a transaction update. Ignoring.');
        return new Response(JSON.stringify({ message: 'Webhook ignored: Not a transaction update.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    const { Id: gatewayTransactionId, Status: newStatus, Amount: amount } = webhookData;

    if (!gatewayTransactionId || !newStatus) {
        console.error('[payment-webhook] Missing Id or Status in webhook payload.');
        return new Response(JSON.stringify({ error: 'Missing required fields in webhook payload.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // Create Supabase client with service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find and update the transaction in our database
    const { data: updatedTransaction, error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({
        status: newStatus.toLowerCase(),
        raw_gateway_response: webhookData,
      })
      .eq('gateway_transaction_id', gatewayTransactionId)
      .select('*, leads(email, phone), starlink_customers(id)') // Select related data for Meta event
      .single();

    if (updateError) {
      console.error(`[payment-webhook] Error updating transaction ${gatewayTransactionId}:`, updateError);
      if (updateError.code === 'PGRST116') { 
          console.warn(`[payment-webhook] Transaction with gateway_id ${gatewayTransactionId} not found in our database.`);
          return new Response(JSON.stringify({ message: 'Transaction not found.' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
          });
      }
      return new Response(JSON.stringify({ error: updateError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`[payment-webhook] Successfully updated transaction ${updatedTransaction.id} to status '${newStatus}'.`);

    if (newStatus.toUpperCase() === 'PAID' && !updatedTransaction.meta_event_sent) {
      console.log(`[payment-webhook] Processing PAID event for transaction ${updatedTransaction.id}.`);
      
      const userDataForMeta: { em?: string; ph?: string } = {};
      
      if (updatedTransaction.leads) {
        userDataForMeta.em = updatedTransaction.leads.email?.toLowerCase();
        userDataForMeta.ph = updatedTransaction.leads.phone?.replace(/\D/g, '');
      }

      const eventId = updatedTransaction.id;

      await sendMetaPurchaseEvent(
        amount,
        'BRL',
        eventId,
        userDataForMeta,
        req.headers.get('x-forwarded-for'),
        req.headers.get('user-agent')
      );

      const { error: metaFlagError } = await supabaseAdmin
        .from('transactions')
        .update({ meta_event_sent: true, event_id: eventId })
        .eq('id', updatedTransaction.id);

      if (metaFlagError) {
        console.error(`[payment-webhook] Failed to set meta_event_sent flag for transaction ${updatedTransaction.id}:`, metaFlagError);
      } else {
        console.log(`[payment-webhook] Successfully set meta_event_sent flag for transaction ${updatedTransaction.id}.`);
      }
    }

    return new Response(JSON.stringify({ message: 'Webhook received and processed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[payment-webhook] Unexpected error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})