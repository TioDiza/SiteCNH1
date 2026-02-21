import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { getFusionPayTransaction } from '../_shared/fusionpay.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("[get-transaction-status] Function invoked.");

  if (req.method === 'OPTIONS') {
    console.log("[get-transaction-status] Handling OPTIONS request.");
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      console.error("[get-transaction-status] transactionId is missing.");
      return new Response(JSON.stringify({ error: 'Transaction ID is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log(`[get-transaction-status] Checking status for transactionId: ${transactionId}`);

    // Chamar a API da FusionPay para obter o status real
    const fusionPayData = await getFusionPayTransaction(transactionId);
    const fusionPayStatus = fusionPayData?.Status;

    if (!fusionPayStatus) {
        console.error(`[get-transaction-status] Invalid response from FusionPay for ${transactionId}:`, fusionPayData);
        throw new Error('Resposta inválida do provedor de pagamento.');
    }

    // Mapear o status da FusionPay para o status do nosso banco de dados
    let dbStatus = 'pending';
    switch (fusionPayStatus.toUpperCase()) {
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
    }

    // Atualizar nosso banco de dados se o status mudou (resiliência a falhas de webhook)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: currentTransaction } = await supabaseAdmin
        .from('transactions')
        .select('status')
        .eq('gateway_transaction_id', transactionId)
        .single();

    if (currentTransaction && currentTransaction.status !== dbStatus) {
        console.log(`[get-transaction-status] Status mismatch for ${transactionId}. DB: ${currentTransaction.status}, FusionPay: ${dbStatus}. Updating DB.`);
        await supabaseAdmin
            .from('transactions')
            .update({ status: dbStatus })
            .eq('gateway_transaction_id', transactionId);
    }

    console.log(`[get-transaction-status] Found status for ${transactionId}: ${dbStatus}`);
    return new Response(JSON.stringify({ status: dbStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[get-transaction-status] Unexpected error:', error);
    // Retorna um status 'pending' em caso de erro para não quebrar o polling do cliente
    return new Response(JSON.stringify({ status: 'pending', error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Retorna 200 para o cliente continuar tentando
    });
  }
})