import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getFuriaPayTransaction } from '../_shared/furiapay.ts'
import { sendMetaPurchaseEvent } from '../_shared/meta.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { gatewayTransactionId } = await req.json();

    if (!gatewayTransactionId) {
      console.error('[get-payment-status] gatewayTransactionId is missing.');
      return new Response(JSON.stringify({ error: 'Gateway Transaction ID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const furiaTransaction = await getFuriaPayTransaction(gatewayTransactionId);
    
    if (!furiaTransaction || !furiaTransaction.data || !furiaTransaction.data.status) {
        console.error('[get-payment-status] Invalid response from FuriaPay:', furiaTransaction);
        throw new Error('Resposta inválida do provedor de pagamento.');
    }
    
    const newStatus = furiaTransaction.data.status.toLowerCase();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: ourTransaction, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*, leads(email, phone), starlink_customers(phone)')
      .eq('gateway_transaction_id', gatewayTransactionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`[get-payment-status] Error fetching our transaction ${gatewayTransactionId}:`, fetchError);
      throw fetchError;
    }

    if (ourTransaction && newStatus === 'paid' && ourTransaction.status !== 'paid') {
      console.log(`[get-payment-status] Status is PAID and our DB is outdated. Updating transaction ${ourTransaction.id}.`);
      
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'paid', raw_gateway_response: furiaTransaction })
        .eq('id', ourTransaction.id);

      if (!ourTransaction.meta_event_sent) {
        console.log(`[get-payment-status] Processing Meta event for transaction ${ourTransaction.id}.`);
        const userDataForMeta: { em?: string; ph?: string } = {};
        
        if (ourTransaction.leads) {
          userDataForMeta.em = ourTransaction.leads.email?.toLowerCase();
          userDataForMeta.ph = ourTransaction.leads.phone?.replace(/\D/g, '');
        } else if (ourTransaction.starlink_customers) {
          // Starlink customers don't have an email in the DB, so we only send the phone
          userDataForMeta.ph = ourTransaction.starlink_customers.phone?.replace(/\D/g, '');
        }
        
        const eventId = ourTransaction.id;
        const amountInReais = furiaTransaction.data.amount / 100;

        await sendMetaPurchaseEvent(
          amountInReais,
          'BRL',
          eventId,
          userDataForMeta,
          req.headers.get('x-forwarded-for'),
          req.headers.get('user-agent')
        );

        await supabaseAdmin
          .from('transactions')
          .update({ meta_event_sent: true, event_id: eventId })
          .eq('id', ourTransaction.id);
        console.log(`[get-payment-status] Successfully set meta_event_sent flag for transaction ${ourTransaction.id}.`);
      }
    }

    console.log(`[get-payment-status] Returning status '${newStatus}' for transaction ${gatewayTransactionId}.`);
    return new Response(JSON.stringify({ status: newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[get-payment-status] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})