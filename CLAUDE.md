# CLAUDE.md — MAK Gestão ERP (PROJETOMG)

> **Claude Code:** leia este arquivo primeiro. Guia completo em [`docs/ai/CLAUDE-CODE-GUIDE.md`](./docs/ai/CLAUDE-CODE-GUIDE.md).

## Projeto

**MAK Gestão** — React/Vite frontend + Fastify/Prisma backend. Programa ativo: **Foundation C — Runtime Bridge** (`src/runtime/`).

## Leitura obrigatória (ordem)

1. [`docs/ai/CLAUDE-CODE-GUIDE.md`](./docs/ai/CLAUDE-CODE-GUIDE.md) — onboarding Claude Code + prompt inicial
2. [`docs/evidence/PROJECT-COMPLETE-HANDOFF.md`](./docs/evidence/PROJECT-COMPLETE-HANDOFF.md) — estado completo do projeto
3. [`README_AI.md`](./README_AI.md) — regras e certificação
4. [`AGENTS.md`](./AGENTS.md) — comandos dev

## Estado atual (código)

- Foundation C.1–C.4 mergeados · 66 testes runtime PASS
- **Próximo slice:** C.5 — M20 Service Locator + M09 Permission
- Gates runtime: `gate:g423-01` … `gate:g423-08`

## Dev rápido

```bash
cp .env.local.example .env.local
npm install
npm run dev   # http://127.0.0.1:5173
```

## Regras invioláveis

- 1 slice Foundation C = 1 PR
- Não alterar SSOT em `docs/runtime-implementation/` sem autorização
- Memória = repositório, não chat
- Rodar `npm run test:runtime` + gates do slice antes de PR

## Skills portáveis

Pasta [`docs/ai/skills/`](./docs/ai/skills/) — equivalentes às Skills do Cursor para este repo.
