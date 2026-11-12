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
  const endpoint = 'https://hooksterr.com/hook/MrSpq1fmn7Jsma-5W35n7ygyT0n386zG2ny0RCDpNrU/';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactKey: input.contactKey, message: input.message })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Error calling external API:', error);
    return Response.json({ status: 'error', message: error.message });
  }
  return Response.json({ status: 'ok' });
}
