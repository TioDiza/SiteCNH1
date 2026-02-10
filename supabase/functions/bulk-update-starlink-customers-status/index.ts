import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { customerIds, status } = await req.json();

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0 || !status) {
      console.error('[bulk-update-starlink-customers-status] Missing or invalid parameters.');
      return new Response(JSON.stringify({ error: 'An array of customer IDs and a status are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin
      .from('starlink_customers')
      .update({ contact_status: status })
      .in('id', customerIds);

    if (error) {
      console.error(`[bulk-update-starlink-customers-status] Error updating customers:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`[bulk-update-starlink-customers-status] Successfully updated ${customerIds.length} customers to status '${status}'.`);
    return new Response(JSON.stringify({ message: 'Customers updated successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[bulk-update-starlink-customers-status] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})