# AGENTS.md

> **AI agents:** Read [`README_AI.md`](./README_AI.md) first — mandatory pre-flight before any implementation.  
> **Governance:** [`docs/constitution/`](./docs/constitution/00-MAK-CONSTITUTION.md) · [`docs/engineering/CURRENT-STATE.md`](./docs/engineering/CURRENT-STATE.md)

## Cursor Cloud specific instructions

### Product overview

MAK Gestão ERP — React/Vite frontend (`/workspace`) + optional Fastify backend (`/workspace/backend`). Default local dev uses the **production API** via Vite proxy (see `LOCAL_DEV.md`).

### Default dev workflow (no Supabase secrets required)

```bash
cp .env.local.example .env.local   # if missing
npm run dev                        # http://127.0.0.1:5173
```

`.env.local.example` enables auto-login (`VITE_DEV_AUTO_LOGIN=true`) and proxies `/api` to Railway (`VITE_API_PROXY_TARGET`).

### Full local stack (requires Supabase/DB secrets)

1. Copy `backend/.env.example` → `backend/.env` and fill `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_*`, `JWT_SECRET`.
2. Remove `VITE_API_PROXY_TARGET` from `.env.local` so the Vite proxy targets `http://127.0.0.1:3001`.
3. `cd backend && npm run seed && npm run dev` (port **3001**).

### Common commands

| Task | Command |
|------|---------|
| Frontend dev | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` (known JSX/shadcn typing noise in `src/shared/ui/*`) |
| Production build | `npm run build` |
| Foundation governance | `npm run verify:governance` |
| Full CI mirror (PR) | `npm run verify:ci` |
| Capability gates only | `npm run gate:capabilities` |
| Governance 5 cycles | `npm run verify:governance:cycles` |
| Generate cadastro module | `npm run generate:module` |
| API health (local backend) | `npm run check:api` |
| Mock E2E (frontend only) | `npm run test:e2e:empresas-novo` |
| Full E2E | `npm run test:e2e` (auto-starts backend + frontend; needs `backend/.env`) |

### Gotchas

- **Detached HEAD**: Cloud VMs may checkout a specific commit; use `git checkout main` if you need the latest branch.
- **E2E credential mismatch**: `e2e/erp.spec.js` logs in as cliente `kaiman`, but `seedBootstrap.js` defaults to `maike`. Set `SEED_CLIENTE_CODIGO=kaiman` in `backend/.env` for fresh DB seeds, or align test credentials.
- **Mock E2E + auto-login**: `test:e2e:empresas-novo` can show a blank page when `VITE_DEV_AUTO_LOGIN=true` conflicts with Playwright mocks; disable auto-login in `.env.local` when debugging that test.
- **Playwright browsers**: First E2E run needs `npx playwright install chromium`.
- **Backend hot reload**: `npm run dev` in `backend/` uses `node --watch`; Prisma client changes require re-running `npm run prisma:generate`.
