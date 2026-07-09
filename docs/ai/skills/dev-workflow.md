# Skill — Dev workflow (portável)

**Substitui no Cursor:** bootstrap, env-vars, vercel-cli (adaptado), react patterns  
**Use quando:** rodar app, debug, env, rotas, navegação BOS/ERP

---

## Stack

| Camada | Tech |
|--------|------|
| Frontend | React 18 + Vite 6 + TanStack Query + Tailwind/shadcn |
| Backend | Fastify 5 + Prisma 6 + PostgreSQL |
| Deploy FE | Vercel (típico) |
| Deploy BE | Railway (`VITE_API_PROXY_TARGET` em dev) |

## Dev padrão (sem secrets)

```bash
cp .env.local.example .env.local
npm install
npm run dev
# http://127.0.0.1:5173
```

`.env.local.example` já tem:
- `VITE_DEV_AUTO_LOGIN=true` (maike/maike/123)
- Proxy API → Railway

## Abrir direto no ERP (sem BOS)

```bash
# em .env.local
VITE_DEFAULT_HOME_ROUTE=/CadastroEmpresas
```

## Navegação UI

| Superfície | Rota | Shell |
|------------|------|-------|
| BOS home | `/` | BosShell — use **Cadastros ERP** no header |
| Empresas | `/CadastroEmpresas` | ErpShell + MgChrome (menu ☰ fixo) |
| Campos Pers. | `/CadastroCamposPersonalizados` | ErpShell + sidebar |
| Studio | `/studio` | StudioProductionPage |

## Rotas (`src/App.jsx`)

- BOS: `/`, `/bos/*`
- ERP: `/CadastroEmpresas`, módulos em `generatedModules.json`
- Catch-all `*` → redireciona `/` (BOS)

## Estrutura frontend relevante

```
src/
  runtime/          # Foundation C NOVO
  modules/          # empresas, cadcps
  framework/mak/    # frozen — legado
  makBootstrap/     # boot + runtime bridge 1E (UI prod)
  bos/              # Business Operating Shell
  studio/           # MAK Studio
  shared/           # ErpShell, auth, shadcn ui
```

## Debug comum

| Problema | Solução |
|----------|---------|
| Login falha | Verificar proxy `VITE_API_PROXY_TARGET` ou subir backend :3001 |
| Tela BOS sem menus ERP | Header → **Cadastros ERP** ou `/CadastroEmpresas` |
| Layout antigo | Console: `window.__empPersonalizacoes.resetStoredLayouts()` |
| E2E blank com auto-login | Desligar `VITE_DEV_AUTO_LOGIN` para Playwright mock |
| Typecheck noise | `src/shared/ui/*` — CI usa `typecheck:governance` |

## E2E

```bash
npx playwright install chromium   # primeira vez
npm run test:e2e:empresas-novo    # mock only
npm run test:e2e                  # full stack
```

## Build produção

```bash
npm run build
npm run preview
```

## Equivalente Cursor Skills

| Cursor | Este projeto |
|--------|--------------|
| bootstrap (Next) | Vite — `npm run dev`, ver `vite.config.js` |
| env-vars | `.env.local`, `backend/.env` |
| vercel-cli | deploy Vercel manual; não documentado no repo |
| react-best-practices | React 18 patterns em `src/shared/`, `framework/mak/` |
| shadcn | componentes em `src/shared/ui/` |

## API health

```bash
npm run check:api
```
