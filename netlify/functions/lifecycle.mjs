import { authorize } from '../lib/auth.mjs';

const events = new Set(['save', 'validate', 'publish', 'stop', 'unpublish']);
export default async function handler(request) {
  const result = await authorize(request);
  if (result.error) return result.error;
  const event = new URL(request.url).searchParams.get('event') || 'unknown';
  if (!events.has(event)) return Response.json({ error: 'invalid_event' }, { status: 400 });
  // Demo: callback del ciclo di vita senza altre operazioni.
  console.log(JSON.stringify({ event, at: new Date().toISOString() }));
  return Response.json({ status: 'ok' });
}
