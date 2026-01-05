import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // The preflight request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    console.log('Webhook received:', payload);

    const transactionId = payload.idTransaction || payload.externalReference;
    const status = payload.status;

    // Logic to handle different webhook statuses
    switch (status) {
      case 'paid':
        console.log(`Handling successful cash-in for transaction: ${transactionId}`);
        // TODO: Update transaction status to 'paid' in the database.
        break;
      
      case 'SaquePago':
        console.log(`Handling successful cash-out for transaction: ${transactionId}`);
        // TODO: Update transaction status to 'paid' in the database.
        break;

      case 'SaqueFalhou':
        console.log(`Handling failed cash-out for transaction: ${transactionId}`);
        // TODO: Update transaction status to 'failed' in the database.
        break;

      case 'refund_approved':
        console.log(`Handling refund (MED Pix) for transaction: ${transactionId}`);
        // TODO: Update transaction status to 'refunded' in the database.
        break;
      
      case 'canceled':
         console.log(`Handling canceled Pix for transaction: ${transactionId}`);
         // TODO: Update transaction status to 'canceled' in the database.
         break;

      default:
        console.warn(`Received unknown webhook status: ${status}`);
    }

    // IMPORTANT: Respond immediately with 200 OK as per Royal Banking docs
    return new Response(JSON.stringify({ status: "received" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})