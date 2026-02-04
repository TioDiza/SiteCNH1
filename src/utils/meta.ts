import { v4 as uuidv4 } from 'uuid';

// Declara a função fbq no escopo global para o TypeScript
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

// Gera um ID de evento único para o CAPI da Meta
export const generateEventId = (): string => {
  return uuidv4();
};

// Dispara o evento 'InitiateCheckout' do Pixel da Meta
export const trackInitiateCheckout = (value: number, currency: string, eventId: string) => {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', 
      {
        value: value,
        currency: currency,
      },
      {
        eventID: eventId
      }
    );
    console.log(`Meta Pixel: InitiateCheckout tracked with eventID: ${eventId}`);
  } else {
    console.warn('Meta Pixel (fbq) não foi encontrado. Certifique-se de que ele está carregado na sua página.');
  }
};