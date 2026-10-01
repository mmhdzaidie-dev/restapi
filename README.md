# ZEIA REST API — Vercel

ZEIA packaged as a Vercel-ready REST API. The original API handlers are kept in `api/`; the browser player UI is removed from the deployment and the only web UI is API documentation at `/` and `/docs`.

## Deploy from GitHub

1. Upload/push this folder as a GitHub repository.
2. In Vercel, import that repository as a new project.
3. Keep the default framework detection. No build command is required.
4. After deployment, open the Vercel URL to see the docs.

Vercel automatically exposes files in the root `api/` directory as Functions.

## Local

```bash
npm install
npm run dev
```

The project uses `npx vercel dev`, so the local routing matches the Vercel `/api/*` layout.

## Endpoints

- `GET /api/search?query=...&type=all`
- `GET /api/suggest?q=...`
- `GET /api/artist?id=...`
- `GET /api/album?id=...`
- `GET /api/lyrics?id=...&title=...&artist=...`
- `GET /api/lyrics1?id=...&title=...&artist=...`
- `GET /api/lyrics2?id=...`
- `POST /api/ytplay` with `{ "query": "..." }` or `{ "url": "..." }`
- `GET|POST /api/transcribe` with `url` or `id`
- `GET|POST /api/translate` with `text`/`q` or `lines`, plus `tl`/`targetLang`
- `GET /api/proxy-audio?url=...`
- `GET /api/proxy-image?url=...`

OpenAPI is available at `/openapi.json`.

## Notes

The endpoint implementations under `api/` retain the behavior of the supplied project. The two proxy handlers are implemented as Vercel Node.js Functions and stream the upstream body so audio seeking can continue to use HTTP Range requests.

Some endpoints depend on third-party services and can fail or change independently of Vercel.
