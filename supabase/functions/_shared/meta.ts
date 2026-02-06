const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID');
const META_CAPI_ACCESS_TOKEN = Deno.env.get('META_CAPI_ACCESS_TOKEN');
const META_API_VERSION = 'v19.0';

interface UserData {
  em?: string; // email
  ph?: string; // phone
  client_ip_address?: string;
  client_user_agent?: string;
}

interface PurchaseEvent {
  event_name: 'Purchase';
  event_time: number;
  event_id: string;
  user_data: UserData;
  custom_data: {
    value: number;
    currency: string;
  };
  action_source: 'website';
}

export async function sendMetaPurchaseEvent(
  value: number,
  currency: string,
  eventId: string,
  userData: UserData,
  clientIp: string | null,
  userAgent: string | null
) {
  console.log(`[sendMetaPurchaseEvent] Preparing to send Purchase event with event_id: ${eventId}`);
  if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
    console.error('[sendMetaPurchaseEvent] Meta Pixel ID ou Access Token não está configurado. Aborting.');
    return;
  }

  const eventTime = Math.floor(Date.now() / 1000);
  
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;

  const payload: PurchaseEvent = {
    event_name: 'Purchase',
    event_time: eventTime,
    event_id: eventId,
    user_data: userData,
    custom_data: {
      value,
      currency,
    },
    action_source: 'website',
  };

  const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;

  console.log('[sendMetaPurchaseEvent] Sending payload to Meta:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [payload],
        access_token: META_CAPI_ACCESS_TOKEN,
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('[sendMetaPurchaseEvent] Erro ao enviar evento para a Meta. Status:', response.status, 'Response:', responseData);
    } else {
      console.log('[sendMetaPurchaseEvent] Evento de Purchase enviado com sucesso para a Meta. Response:', responseData);
    }
  } catch (error) {
    console.error('[sendMetaPurchaseEvent] Exceção ao enviar evento para a Meta:', error);
  }
}