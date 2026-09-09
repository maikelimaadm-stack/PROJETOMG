# Contrato de escopo — Slice 48

## Artefatos próprios declarados

Os três canônicos:

```
src/runtime/__tests__/typecheck-environment-hygiene-governance.test.js
scripts/gates/g423-typecheck-environment-hygiene-governance.mjs
docs/evidence/post-foundation-c-typecheck-environment-hygiene-governance/
```

Mais os dez que a P1-02A de fato produz e que vivem fora do território governado
(classificam como `unknown_scope` e, sem declaração, fariam o núcleo falhar fechado sobre a
própria branch que os cria):

```
jsconfig.typecheck.json
scripts/run-typecheck-governance.mjs
scripts/run-governance-cycles.mjs
scripts/tests/typecheck-scope-governance.test.mjs
AGENTS.md
docs/ai/skills/dev-workflow.md
docs/engineering/CURRENT-STATE.md
docs/engineering/TECH-DEBT.md
docs/engineering/ENGINEERING-JOURNAL.md
docs/engineering/P1-02A-TYPECHECK-ENVIRONMENT-HYGIENE-REPORT.md
```

**Isto não é cross-authorization.** Cross é para artefatos de OUTRA fatia; esta não toca
nenhum. São artefatos próprios, um padrão ancorado `^...$` por arquivo, sem curinga de
diretório, nenhum deles caminho de produto, backend ou Prisma.

## Fail-closed preservado

| diff | veredito |
|---|---|
| desta branch | `safe=true`, zero unknown, zero forbidden, zero chronological |
| + `src/studio/unregistered-future.js` | `safe=false` |
| + `backend/src/server.js` | `safe=false` — forbidden |
| + `src/App.jsx` | `safe=false` — forbidden |
| + `prisma/schema.prisma` | `safe=false` — forbidden |
| diff vazio | `empty_branch_diff` |
| núcleo | continua fail-closed nos mesmos caminhos |
