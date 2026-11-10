import jwt from 'jsonwebtoken';

function json(data, status) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

// SFMC può inviare un JWT puro o un payload form-urlencoded/JSON contenente JWT.
function extractJwt(body, contentType) {
  const raw = body.trim();
  if (!raw) return null;
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return params.get('JWT') || params.get('jwt') || params.get('token');
  }
  if (raw.startsWith('{') || raw.startsWith('"')) {
    try {
      const data = JSON.parse(raw);
      if (typeof data === 'string') return data;
      return data?.JWT || data?.jwt || data?.token || null;
    } catch { return null; }
  }
  return raw;
}

export async function authorize(request) {
  if (request.method !== 'POST') return { error: json({ error: 'method_not_allowed' }, 405) };
  const secret = process.env.SFMC_JWT_SECRET;
  if (!secret) return { error: json({ error: 'secret_not_configured' }, 503) };
  if (Number(request.headers.get('content-length') || 0) > 262144) {
    return { error: json({ error: 'payload_too_large' }, 413) };
  }
  let body;
  try { body = await request.text(); }
  catch { return { error: json({ error: 'body_invalid' }, 400) }; }
  if (body.length > 262144) return { error: json({ error: 'payload_too_large' }, 413) };
  const token = extractJwt(body, request.headers.get('content-type') || '');
  if (!token) return { error: json({ error: 'jwt_missing' }, 401) };
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return { payload };
  } catch {
    return { error: json({ error: 'jwt_invalid' }, 401) };
  }
}
