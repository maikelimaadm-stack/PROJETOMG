# Deploy do ERP na Vercel

Este projeto publica o frontend (Vite/React) na Vercel.  
O backend Fastify continua como servico separado (URL propria), consumido via `VITE_API_URL`.

## 1) Frontend (Vercel)

1. Crie/importe o projeto na Vercel apontando para este repositorio.
2. Em **Project Settings > Environment Variables**, configure:
   - `VITE_API_URL=https://SEU_BACKEND_URL`
   - `VITE_SUPABASE_URL=https://vjvayvvusubfwfofhnqy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<sua publishable key>`
3. Faça deploy da branch principal desejada.

Observacao:
- O arquivo `vercel.json` ja esta configurado para SPA routing (React Router).

## 2) Backend (servico separado)

Configure os envs no provedor do backend:

- `DATABASE_URL=postgresql://postgres.vjvayvvusubfwfofhnqy:<senha>@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL=postgresql://postgres.vjvayvvusubfwfofhnqy:<senha>@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`
- `SUPABASE_URL=https://vjvayvvusubfwfofhnqy.supabase.co`
- `SUPABASE_ANON_KEY=<jwt anon>`
- `SUPABASE_SERVICE_ROLE_KEY=<service key>`
- `SUPABASE_STORAGE_BUCKET=erp-anexos`
- `FRONTEND_ORIGINS=https://SEU_APP.vercel.app,https://SEU_DOMINIO_CUSTOM`

URL backend producao (apos deploy):

- `BACKEND_PRODUCTION_URL=<preencher-url-publica>`
- `VITE_API_URL=$BACKEND_PRODUCTION_URL`

## 3) Checklist de validacao

No backend:

```bash
npm run prisma:validate
npm run prisma:generate
npx prisma db push
npm run validate:connections
npm run smoke:empresas
```

No frontend:

```bash
npm run lint
npm run build
```

Validacao rapida em producao:

```bash
curl -sS "$BACKEND_PRODUCTION_URL/api/health"
```

