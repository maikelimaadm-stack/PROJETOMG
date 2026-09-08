# Matriz negativa — o que continua falhando fechado

Com o workflow presente no diff, cada combinação abaixo permanece `safe=false`
e o `reason` **nunca** é `non_studio_branch`:

| # | diff | blockers |
|---|------|----------|
| 1 | workflow + `src/studio/unregistered-future-artifact.js` | no_active_slice_resolved, unknown_scope |
| 2 | workflow + `src/runtime/__tests__/unregistered-future.test.js` | no_active_slice_resolved, unknown_scope |
| 3 | workflow + `scripts/gates/unregistered-future-gate.mjs` | no_active_slice_resolved, unknown_scope |
| 4 | workflow + `backend/src/server.js` | forbidden_scope, no_active_slice_resolved, unknown_scope |
| 5 | workflow + `src/App.jsx` | forbidden_scope, no_active_slice_resolved, unknown_scope |
| 6 | workflow + `prisma/schema.prisma` | forbidden_scope, no_active_slice_resolved, unknown_scope |

Além disso:

- diff vazio continua `empty_branch_diff` — nunca `non_studio_branch`;
- `evaluateStudioBranchScope(['.github/workflows/foundation-governance.yml'])`
  continua `safe=false` com `no_active_slice_resolved` e `unknown_scope`;
- slice ativa ambígua continua falhando;
- slice ativa anterior ao caller continua falhando;
- caminho de fatia estranha não autorizado continua falhando;
- caminho proibido sem autorização explícita da slice ativa continua falhando.

Medição: **0 vazamentos**.
