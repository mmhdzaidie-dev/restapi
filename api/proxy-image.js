const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Expose-Headers': '*'
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const targetUrl = req.query?.url;
  if (!targetUrl) return res.status(400).send('Missing url parameter');

  let parsed;
  try {
    parsed = new URL(String(targetUrl));
  } catch {
    return res.status(400).send('Invalid url parameter');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).send('Invalid url protocol');
  }

  try {
    const upstream = await fetch(parsed.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send('Upstream error');
    }

    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    const contentType = upstream.headers.get('content-type');
    res.setHeader('Content-Type', contentType && contentType.startsWith('image/') ? contentType : 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (!upstream.body) return res.status(502).send('Empty upstream body');

    const { Readable } = require('stream');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    if (!res.headersSent) return res.status(502).send('Proxy error: ' + err.message);
  }
};
