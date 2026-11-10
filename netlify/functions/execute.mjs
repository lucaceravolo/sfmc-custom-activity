import { authorize } from '../lib/auth.mjs';

export default async function handler(request) {
  const result = await authorize(request);
  if (result.error) return result.error;

  const payload = result.payload;
  const inArguments = payload?.inArguments || payload?.request?.inArguments || [];
  const input = Object.assign({}, ...inArguments.filter(x => x && typeof x === 'object'));

  // Demo: NON registrare valori di ContactKey, email o altri dati personali.
  console.log(JSON.stringify({
    event: 'execute', at: new Date().toISOString(),
    hasContactKey: Boolean(input.contactKey), hasMessage: Boolean(input.message)
  }));
  // Aggiungi qui un'eventuale chiamata fetch verso un'API esterna,
  // con timeout, validazione, gestione degli errori e idempotenza.
  return Response.json({ status: 'ok' });
}
