// --- FusionPay API Configuration ---
const FUSIONPAY_API_URL = 'https://api.fusionpay.com.br/v1/payment-transaction/create';
const FUSIONPAY_PUBLIC_KEY = Deno.env.get('FUSIONPAY_PUBLIC_KEY');
const FUSIONPAY_SECRET_KEY = Deno.env.get('FUSIONPAY_SECRET_KEY');

/**
 * Gera o header de autenticação Basic para a FusionPay.
 * A autenticação é Basic Base64(PUBLIC_KEY:SECRET_KEY).
 */
export function getFusionPayAuthHeader(): string {
  if (!FUSIONPAY_PUBLIC_KEY || !FUSIONPAY_SECRET_KEY) {
    console.error('[getFusionPayAuthHeader] As chaves da FusionPay não estão configuradas.');
    throw new Error('Configuração do provedor de pagamento incompleta.');
  }
  
  const credentials = `${FUSIONPAY_PUBLIC_KEY}:${FUSIONPAY_SECRET_KEY}`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Cria uma nova transação de pagamento usando a API da FusionPay.
 * @param payload - Os dados da transação.
 * @returns Os dados da transação criada.
 */
export async function createFusionPayTransaction(payload: object) {
  const authHeader = getFusionPayAuthHeader();

  const response = await fetch(FUSIONPAY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('[createFusionPayTransaction] Falha na API da FusionPay. Status:', response.status);
    console.error('[createFusionPayTransaction] Resposta recebida:', responseText);
    try {
      const errorData = JSON.parse(responseText);
      const errorMessage = errorData.message || (errorData.errors && JSON.stringify(errorData.errors)) || 'Falha na comunicação com o provedor de pagamento.';
      throw new Error(errorMessage);
    } catch (e) {
      throw new Error('Falha na comunicação com o provedor de pagamento.');
    }
  }

  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (e) {
    console.error('[createFusionPayTransaction] Falha ao analisar a resposta JSON de sucesso da FusionPay. Status:', response.status, 'Texto da Resposta:', responseText);
    throw new Error('Resposta inválida do provedor de pagamento.');
  }
}

/**
 * Busca informações de uma transação na FusionPay.
 * @param transactionId - O ID da transação.
 * @returns Os dados da transação.
 */
export async function getFusionPayTransaction(transactionId: string) {
  const authHeader = getFusionPayAuthHeader();
  const url = `https://api.fusionpay.com.br/v1/payment-transaction/info/${transactionId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`[getFusionPayTransaction] Falha ao buscar transação ${transactionId} na FusionPay:`, response.status, data);
    throw new Error(data.message || 'Falha na comunicação com o provedor de pagamento.');
  }

  return data;
}