import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROYAL_BANKING_API_URL = 'https://api.royalbanking.com.br/v1/gateway/';
const ROYAL_BANKING_API_KEY = Deno.env.get('ROYAL_BANKING_API_KEY'); 

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Create Supabase client with service_role key
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  if (!ROYAL_BANKING_API_KEY) {
    console.error('ROYAL_BANKING_API_KEY secret is not set.');
    return new Response(JSON.stringify({ error: 'A chave da API para o gateway de pagamento não está configurada.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { client, amount, lead_id } = await req.json();

    if (!client || !client.name || !client.document || !client.telefone || !client.email || !amount || !lead_id) {
      return new Response(JSON.stringify({ error: 'Faltam informações obrigatórias para o pagamento.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- PASSO IMPORTANTE PARA TESTE LOCAL ---
    // Cole sua URL do ngrok aqui, adicionando o nome da função no final.
    // Exemplo: "https://seu-codigo-aleatorio.ngrok.io/payment-webhook"
    const callbackUrl = 'https://unindulging-alise-punishingly.ngrok-free.dev/payment-webhook';
    
    // A URL de produção original está comentada abaixo para você restaurar depois.
    // const callbackUrl = 'https://lubhskftgevcgfkzxozx.supabase.co/functions/v1/payment-webhook';

    const payload = {
      'api-key': ROYAL_BANKING_API_KEY,
      amount: amount,
      client: {
        name: client.name,
        document: client.document,
        telefone: client.telefone,
        email: client.email,
      },
      callbackUrl: callbackUrl
    };

    const response = await fetch(ROYAL_BANKING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
        console.error('Gateway Error:', data);
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });
    }

    // Save transaction to the database
    const { error: dbError } = await supabaseAdmin
      .from('transactions')
      .insert({
        lead_id: lead_id,
        gateway_transaction_id: data.idTransaction,
        amount: amount,
        status: 'pending',
        provider: 'royal_banking',
        raw_gateway_response: data,
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      return new Response(JSON.stringify({ error: 'Falha ao salvar a transação no banco de dados.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})