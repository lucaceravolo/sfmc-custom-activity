import { template } from '../lib/base-config.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  const origin = new URL(request.url).origin;
  const baseUrl = (process.env.APP_URL || origin).replace(/\/+$/, '');
  const extensionKey = process.env.JB_ACTIVITY_KEY || 'SET_UNIQUE_KEY';
  const config = structuredClone(template);
  const json = JSON.stringify(config)
    .replaceAll('__BASE_URL__', baseUrl)
    .replaceAll('__ACTIVITY_KEY__', extensionKey);
  return new Response(json, {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8',
               'Cache-Control': 'no-store, max-age=0' }
  });
}
