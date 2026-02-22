import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('[upsert-starlink-customer] Handling OPTIONS request.');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const customerData = await req.json();

    if (!customerData || !customerData.cpf) {
        console.error('[upsert-starlink-customer] Missing customer data or CPF.');
        return new Response(JSON.stringify({ error: 'Dados do cliente, incluindo CPF, são obrigatórios.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Manual Upsert: Check if customer exists first
    const { data: existingCustomer, error: selectError } = await supabaseAdmin
      .from('starlink_customers')
      .select('id')
      .eq('cpf', customerData.cpf)
      .single();

    // Ignore 'PGRST116' error, which means no rows were found (the customer is new)
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[upsert-starlink-customer] Error checking for existing customer:', selectError);
      throw selectError;
    }

    let finalData;

    if (existingCustomer) {
      // Customer exists, so update them
      console.log(`[upsert-starlink-customer] Updating existing customer with CPF: ${customerData.cpf}`);
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('starlink_customers')
        .update(customerData)
        .eq('id', existingCustomer.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('[upsert-starlink-customer] Error updating customer:', updateError);
        throw updateError;
      }
      finalData = updatedData;
    } else {
      // Customer does not exist, so insert them
      console.log(`[upsert-starlink-customer] Inserting new customer with CPF: ${customerData.cpf}`);
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('starlink_customers')
        .insert(customerData)
        .select()
        .single();

      if (insertError) {
        console.error('[upsert-starlink-customer] Error inserting customer:', insertError);
        throw insertError;
      }
      finalData = insertedData;
    }

    console.log('[upsert-starlink-customer] Upsert successful for customer ID:', finalData.id);
    return new Response(JSON.stringify(finalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[upsert-starlink-customer] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})