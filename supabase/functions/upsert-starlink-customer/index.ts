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

    if (!customerData || !customerData.cpf || !customerData.email) {
        console.error('[upsert-starlink-customer] Missing customer data, CPF, or email.');
        return new Response(JSON.stringify({ error: 'Dados do cliente, incluindo CPF e email, são obrigatórios.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // Separa o email dos dados que serão salvos no banco
    const { email, ...dbData } = customerData;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upsert manual: Verifica se o cliente já existe
    const { data: existingCustomer, error: selectError } = await supabaseAdmin
      .from('starlink_customers')
      .select('id')
      .eq('cpf', dbData.cpf)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[upsert-starlink-customer] Error checking for existing customer:', selectError);
      throw selectError;
    }

    let dbResult;

    if (existingCustomer) {
      // Cliente existe, então atualiza
      console.log(`[upsert-starlink-customer] Updating existing customer with CPF: ${dbData.cpf}`);
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('starlink_customers')
        .update(dbData) // Usa os dados sem o email
        .eq('id', existingCustomer.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('[upsert-starlink-customer] Error updating customer:', updateError);
        throw updateError;
      }
      dbResult = updatedData;
    } else {
      // Cliente não existe, então insere
      console.log(`[upsert-starlink-customer] Inserting new customer with CPF: ${dbData.cpf}`);
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('starlink_customers')
        .insert(dbData) // Usa os dados sem o email
        .select()
        .single();

      if (insertError) {
        console.error('[upsert-starlink-customer] Error inserting customer:', insertError);
        throw insertError;
      }
      dbResult = insertedData;
    }

    // Adiciona o email de volta ao objeto de resposta para o frontend
    const finalData = { ...dbResult, email };

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