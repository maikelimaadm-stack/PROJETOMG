# Desenvolvimento local (frontend + login)

O frontend (`npm run dev`, porta **5173**) envia `/api/*` para o backend em **http://127.0.0.1:3001** (proxy do Vite).

Se aparecer **"Falha em POST /api/auth/login"**, o backend **não está na porta 3001** (ou o banco falhou). Rode na raiz:

```bash
npm run check:api
```

## Atalho: entrar sem backend (só tela / layout)

```bash
cp .env.local.example .env.local
# deixe VITE_DEV_AUTH_MOCK=true
npm run dev
```

Qualquer login/senha na tela de login funciona. **Cadastro de empresas e APIs** ainda exigem backend + Postgres.

---

## Backend real (recomendado)

## 1. Backend

```bash
cd backend
cp .env.example .env
```

Preencha no `backend/.env` (Supabase/Postgres do projeto):

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (qualquer string longa em dev)

```bash
npm install
npm run prisma:generate
npm run dev
```

Deve subir em **http://127.0.0.1:3001**. Teste:

```bash
curl -sS -X POST http://127.0.0.1:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cliente":"kaiman","usuario":"maike","senha":"123"}'
```

Credenciais padrão do seed (se já rodou `npm run seed` no backend): ver `SEED_*` no `.env.example`.

## 2. Frontend

Em outro terminal, na raiz do repositório:

```bash
npm install
npm run dev
```

Abra **http://localhost:5173**.

Opcional: na raiz, `npm run dev:backend` sobe só a API.

## 3. Frontend sem proxy (produção-like)

Se usar `VITE_API_URL=http://localhost:3001` em `.env.local`, o browser chama a API direto (CORS precisa de `FRONTEND_ORIGINS=http://localhost:5173` no backend).

Em desenvolvimento, deixe o proxy do Vite (não defina `VITE_API_URL` ou use URL vazia no `AuthApi` em DEV).
