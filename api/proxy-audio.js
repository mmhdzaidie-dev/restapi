const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Range',
  'Access-Control-Expose-Headers': '*'
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
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

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36'
  };
  const range = req.headers?.range;
  if (range) headers.Range = range;

  try {
    const upstream = await fetch(parsed.href, { headers, redirect: 'follow' });

    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    for (const name of ['content-type', 'content-length', 'accept-ranges', 'content-range', 'etag', 'last-modified']) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    if (!upstream.headers.get('accept-ranges')) res.setHeader('Accept-Ranges', 'bytes');

    res.status(upstream.status);
    if (req.method === 'HEAD' || !upstream.body) return res.end();

    const { Readable } = require('stream');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    if (!res.headersSent) return res.status(502).send('Proxy error: ' + err.message);
  }
};
