// --- FuriaPay API Configuration ---
const FURIAPAY_API_URL = 'https://api.furiapaybr.app/v1';
const FURIAPAY_PUBLIC_KEY = Deno.env.get('FURIAPAY_PUBLIC_KEY');
const FURIAPAY_SECRET_KEY = Deno.env.get('FURIAPAY_SECRET_KEY');

/**
 * Gera o header de autenticação Basic para a FuriaPay.
 */
export function getFuriaPayAuthHeader(): string {
  if (!FURIAPAY_PUBLIC_KEY || !FURIAPAY_SECRET_KEY) {
    console.error('[getFuriaPayAuthHeader] As chaves da FuriaPay não estão configuradas.');
    throw new Error('Configuração do provedor de pagamento incompleta.');
  }
  
  const credentials = `${FURIAPAY_PUBLIC_KEY}:${FURIAPAY_SECRET_KEY}`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Cria uma nova transação de pagamento usando a API da FuriaPay.
 * @param payload - Os dados da transação.
 * @returns Os dados da transação criada.
 */
export async function createFuriaPayTransaction(payload: object) {
  const authHeader = getFuriaPayAuthHeader();
  const url = `${FURIAPAY_API_URL}/payment-transactions/create`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('[createFuriaPayTransaction] Falha na API da FuriaPay. Status:', response.status);
    console.error('[createFuriaPayTransaction] Resposta recebida:', responseText);
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
    console.error('[createFuriaPayTransaction] Falha ao analisar a resposta JSON de sucesso da FuriaPay. Status:', response.status, 'Texto da Resposta:', responseText);
    throw new Error('Resposta inválida do provedor de pagamento.');
  }
}

/**
 * Busca os dados da empresa na FuriaPay.
 * @returns Os dados da empresa.
 */
export async function getFuriaPayCompanyData() {
    const authHeader = getFuriaPayAuthHeader();
    // ASSUMPTION: Assumindo que o endpoint para dados da empresa é /company
    const url = `${FURIAPAY_API_URL}/company`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('[getFuriaPayCompanyData] Falha ao buscar dados da empresa:', response.status, data);
        throw new Error(data.message || 'Falha na comunicação com o provedor de pagamento para buscar dados da empresa.');
    }

    return data;
}