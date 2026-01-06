import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Lida com a requisição CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { leadId, phone } = await req.json();

    if (!leadId || !phone) {
      console.error('[update-lead-phone] leadId ou phone ausente.');
      return new Response(JSON.stringify({ error: 'ID do lead e número de telefone são obrigatórios.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Cria um cliente Supabase com a chave de serviço para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Atualiza o número de telefone do lead
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ phone: phone })
      .eq('id', leadId);

    if (error) {
      console.error(`[update-lead-phone] Erro ao atualizar o telefone para o lead ${leadId}:`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`[update-lead-phone] Telefone atualizado com sucesso para o lead ${leadId}.`);
    return new Response(JSON.stringify({ message: 'Número de telefone atualizado com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[update-lead-phone] Erro inesperado:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})