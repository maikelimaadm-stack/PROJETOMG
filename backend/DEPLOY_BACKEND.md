# Deploy backend (Railway ou Render)

## URL backend producao

Defina apos o primeiro deploy:

- `BACKEND_PRODUCTION_URL=<preencher-url-publica>`

Use essa URL no frontend (`VITE_API_URL`).

---

## Variaveis obrigatorias

- `NODE_ENV=production`
- `BACKEND_HOST=0.0.0.0`
- `BACKEND_PORT=3001`
- `FRONTEND_ORIGINS=https://SEU_APP.vercel.app,https://SEU_DOMINIO_CUSTOM`
- `DATABASE_URL=postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL=postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`
- `SUPABASE_URL=https://PROJECT_REF.supabase.co`
- `SUPABASE_ANON_KEY=<jwt anon>`
- `SUPABASE_SERVICE_ROLE_KEY=<service role>`
- `SUPABASE_STORAGE_BUCKET=erp-anexos`

---

## Deploy via Render

1. Crie um novo Web Service no Render apontando para o repo.
2. Use `render.yaml` (raiz do repo) ou `backend/render.yaml`.
3. Defina todas as variaveis obrigatorias.
4. Deploy.
5. Execute no terminal remoto (ou local apontando para producao):

```bash
npx prisma db push
npm run check:prod
```

---

## Deploy via Railway

1. Crie um novo projeto no Railway conectado ao repo.
2. Railway usa `railway.json` (raiz) + `Dockerfile.railway`.
3. Com isso, **não é necessário configurar rootDirectory para `backend`**.
3. Defina todas as variaveis obrigatorias.
4. Deploy.
5. Execute:

```bash
npx prisma db push
npm run check:prod
```

---

## Validacao operacional pos-deploy

```bash
curl -sS "$BACKEND_PRODUCTION_URL/api/health"
curl -sS "$BACKEND_PRODUCTION_URL/api/auth/session"
npm run smoke:empresas
```

Para `smoke:empresas` contra producao:

```bash
SMOKE_BASE_URL="$BACKEND_PRODUCTION_URL" npm run smoke:empresas
```

