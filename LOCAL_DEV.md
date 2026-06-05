# Desenvolvimento local (frontend + login)

O frontend (`npm run dev`, porta **5173**) envia `/api/*` via proxy do Vite.

Por padrão, com `.env.local.example`:

- **Login automático** (`VITE_DEV_AUTO_LOGIN=true`) — entra direto no ERP
- **API de produção** via `VITE_API_PROXY_TARGET` — mesmos dados/configs do makgestao.com
- **Sem cache local de layout** — não use `VITE_LOCAL_PERSONALIZACOES=true` salvo para testes de personalização

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Abra **http://localhost:5173**.

## Layout antigo no navegador

Se o formulário ou colunas parecerem desatualizados, limpe preferências legadas no console (F12):

```js
window.__empPersonalizacoes.resetStoredLayouts()
```

## Erros comuns

| Erro | Solução |
|------|---------|
| `Origin não permitida` | Confirme que está na branch `main` recente (inclui fix do proxy). Reinicie `npm run dev`. |
| `Falha em POST /api/auth/login` | Backend local não está na 3001. Use `VITE_API_PROXY_TARGET` ou suba o backend. |
| UX diferente da produção | Atualize o repo: `git pull origin main` (precisa do commit `f061811` ou posterior — PR #76). |

Verifique a API:

```bash
npm run check:api
```

---

## Backend local (opcional)

```bash
cd backend
cp .env.example .env
```

Preencha no `backend/.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

```bash
npm install
npm run prisma:generate
npm run dev
```

Remova `VITE_API_PROXY_TARGET` do `.env.local` para o proxy apontar para `http://127.0.0.1:3001`.

Teste:

```bash
curl -sS -X POST http://127.0.0.1:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cliente":"maike","usuario":"maike","senha":"123"}'
```

## Frontend sem proxy (produção-like)

Se usar `VITE_API_URL=http://localhost:3001` em `.env.local`, o browser chama a API direto (CORS precisa de `FRONTEND_ORIGINS=http://localhost:5173` no backend).

Em desenvolvimento normal, deixe o proxy do Vite (não defina `VITE_API_URL`).
