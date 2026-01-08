// --- PixUp API Configuration ---
const PIXUP_AUTH_URL = 'https://api.pixupbr.com/v2/oauth/token';
const PIXUP_CLIENT_ID = Deno.env.get('PIXUP_CLIENT_ID');
const PIXUP_CLIENT_SECRET = Deno.env.get('PIXUP_CLIENT_SECRET');

/**
 * Obtém um token de acesso da API da PixUp.
 */
export async function getPixUpToken(): Promise<string> {
  if (!PIXUP_CLIENT_ID || !PIXUP_CLIENT_SECRET) {
    console.error('[getPixUpToken] As credenciais da PixUp não estão configuradas.');
    throw new Error('Configuração do provedor de pagamento incompleta.');
  }
  const credentials = `${PIXUP_CLIENT_ID}:${PIXUP_CLIENT_SECRET}`;
  const base64Credentials = btoa(credentials);

  const response = await fetch(PIXUP_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[getPixUpToken] Falha ao obter token da PixUp:', response.status, errorBody);
    throw new Error('Falha na autenticação com o provedor de pagamento.');
  }

  const data = await response.json();
  return data.access_token;
}