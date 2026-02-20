// --- FusionPay API Configuration ---
const FUSIONPAY_API_URL = 'https://api.fusionpay.com.br/v1/payment-transactions/create';
const FUSIONPAY_PUBLIC_KEY = Deno.env.get('FUSIONPAY_PUBLIC_KEY');
const FUSIONPAY_SECRET_KEY = Deno.env.get('FUSIONPAY_SECRET_KEY');

/**
 * Gera o header de autenticação Basic para a FusionPay.
 */
function getFusionPayAuthHeader(): string {
  if (!FUSIONPAY_PUBLIC_KEY || !FUSIONPAY_SECRET_KEY) {
    console.error('[getFusionPayAuthHeader] As credenciais da FusionPay não estão configuradas.');
    throw new Error('Configuração do provedor de pagamento incompleta.');
  }
  const credentials = `${FUSIONPAY_PUBLIC_KEY}:${FUSIONPAY_SECRET_KEY}`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Cria uma nova transação de pagamento PIX usando a API da FusionPay.
 * @param payload - Os dados da transação.
 * @returns Os dados da transação criada.
 */
export async function createFusionPayPix(payload: object) {
  const authHeader = getFusionPayAuthHeader();

  const response = await fetch(FUSIONPAY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[createFusionPayPix] Falha ao criar transação na FusionPay:', response.status, data);
    throw new Error(data.message || 'Falha na comunicação com o provedor de pagamento.');
  }

  return data;
}