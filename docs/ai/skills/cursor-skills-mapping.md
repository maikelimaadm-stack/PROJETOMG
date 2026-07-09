# Mapeamento — Cursor Skills → Claude Code (PROJETOMG)

**Purpose:** Quando você usava Cursor com Skills automáticas, use este índice no Claude Code.

> Skills do Cursor ficam em `/home/cursor/.cursor/plugins/...` — **fora do repo**.  
> Este arquivo é o substituto documentado **dentro do repo**.

---

## Como usar no Claude Code

```
Para tarefa X, siga docs/ai/skills/<arquivo>.md
```

Ou inclua o conteúdo da skill no prompt.

---

## Skills do projeto (criadas neste repo)

| Tarefa | Arquivo portável |
|--------|------------------|
| Foundation C / Runtime | `docs/ai/skills/foundation-c-runtime.md` |
| Prisma / DB / backend | `docs/ai/skills/prisma-backend.md` |
| Dev, env, rotas, BOS | `docs/ai/skills/dev-workflow.md` |
| Gates, PR, governança | `docs/ai/skills/governance-gates.md` |

---

## Prisma (Cursor plugin → CLI)

| Cursor Skill | Claude Code |
|--------------|-------------|
| prisma-cli-init | Já inicializado — ver `backend/prisma/` |
| prisma-cli-generate | `cd backend && npm run prisma:generate` |
| prisma-cli-validate | `npm run prisma:validate` |
| prisma-cli-migrate-dev | `npx prisma migrate dev` — só com autorização |
| prisma-cli-migrate-deploy | `npx prisma migrate deploy` |
| prisma-cli-migrate-status | `npx prisma migrate status` |
| prisma-cli-db-seed | `npm run seed` |
| prisma-cli-db-push | Evitar em prod — preferir migrate |
| prisma-cli-studio | `npx prisma studio` |
| prisma-client-api-* | Ler `backend/src/database/prismaClient.js` |

**Doc:** `docs/ai/skills/prisma-backend.md`

---

## Vercel / Deploy (Cursor plugin)

| Cursor Skill | Claude Code |
|--------------|-------------|
| vercel-cli | `vercel` CLI manual — não doc no repo |
| deployments-cicd | `.github/workflows/`, Railway para API |
| env-vars | `.env.local`, `backend/.env`, Vercel dashboard |
| performance-optimizer | Lighthouse manual; bundle `npm run build` |

---

## React / Frontend (Cursor plugin)

| Cursor Skill | Este projeto |
|--------------|--------------|
| react-best-practices | React 18 — `src/shared/`, hooks em modules |
| shadcn | `src/shared/ui/` — componentes já instalados |
| nextjs | **Não usa Next** — usa **Vite** (`vite.config.js`) |
| routing-middleware | React Router em `src/App.jsx` |

**Doc:** `docs/ai/skills/dev-workflow.md`

---

## Supabase (Cursor plugin)

| Cursor Skill | Este projeto |
|--------------|--------------|
| supabase | Auth + Storage via `backend/src/integrations/supabase/` |
| supabase-postgres-best-practices | PostgreSQL via Prisma `DATABASE_URL` |

Configure credenciais em `backend/.env`.

---

## Figma (Cursor plugin)

| Cursor Skill | Claude Code |
|--------------|-------------|
| figma-use, figma-implement | MCP Figma — configure no Claude Code separadamente |
| figma-code-connect | Não usado neste repo atualmente |

**Nota:** Foundation C runtime não depende de Figma.

---

## AI SDK / Gateway (Cursor plugin)

| Cursor Skill | Este projeto |
|--------------|--------------|
| ai-sdk, ai-gateway | Não implementado — visão Foundation J |
| auth | JWT em `backend/src/modules/auth/` |

---

## Tasks / explore (Cursor plugin)

| Cursor Skill | Claude Code |
|--------------|-------------|
| explore agent | Use subagentes Claude Code ou leia handoff |
| tasks-plan | `docs/runtime-implementation/10-DELIVERY-PLANNING.md` |
| spec-to-implementation | `docs/runtime-implementation/08-DONE-CRITERIA.md` |

---

## Contexto que Cursor injeta automaticamente

| Cursor automático | Equivalente Claude Code |
|-------------------|-------------------------|
| AGENTS.md cloud instructions | Ler `AGENTS.md` + `CLAUDE.md` |
| README_AI pre-flight | Ler `README_AI.md` explicitamente |
| Foundation C handoff | `docs/evidence/PROJECT-COMPLETE-HANDOFF.md` |
| Git branch rules | `docs/ai/CLAUDE-CODE-GUIDE.md` §11 |
| MCP tools | Configurar manualmente |

---

## Prompt template com skill

```
Tarefa: implementar Foundation C.5 (M20 + M09).

Siga obrigatoriamente:
- docs/ai/skills/foundation-c-runtime.md
- docs/ai/skills/governance-gates.md
- docs/evidence/PROJECT-COMPLETE-HANDOFF.md § C.5

Não alterar SSOT. 1 PR. Regressão gates 01-08.
```

---

## Manutenção

Quando novas Skills forem relevantes ao projeto, adicione linha neste arquivo + opcionalmente novo `docs/ai/skills/<nome>.md`.

*Última atualização: 2026-07-09 — Foundation C.4 em main, C.5 próximo.*
