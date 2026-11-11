import { entryTemplate } from '../lib/entry-config.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Evita di far acquisire a Salesforce una configurazione con chiave fittizia.
  // Configura JB_ENTRY_KEY dalla Unique Key del nuovo componente prima del test.
  const key = (process.env.JB_ENTRY_KEY || '').trim();
  if (!key) {
    return Response.json(
      { error: 'JB_ENTRY_KEY not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const origin = new URL(request.url).origin;
  const baseUrl = (process.env.APP_URL || process.env.URL || origin)
    .replace(/\/+$/, '');
  const config = structuredClone(entryTemplate);
  config.key = key;
  config.configurationArguments.applicationExtensionKey = key;
  config.metaData.icon = `${baseUrl}/entry-source-v1/images/icon.svg`;
  config.userInterfaces.configModal.url = `${baseUrl}/entry-source-v1/index.html`;

  return Response.json(config, {
    status: 200,
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  });
}
