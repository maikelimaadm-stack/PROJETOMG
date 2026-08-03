# Negative matrix

Tudo abaixo continua bloqueado. Cada linha é um cenário do teste e uma checagem do gate.

## Os oito lookalikes obrigatórios

```
docs/random-migration-plan.md
tools/custom-migration-helper.js
config/menu.json
tools/navigation-generator.js
scripts/gates/g423-unregistered-route-menu.mjs
src/runtime/__tests__/unlisted-empresas-change.test.js
scripts/gates/g423-unlisted-empresas-change.mjs
docs/evidence/unregistered-empresas-change/file.md
```

Para cada um, duas provas independentes:

- `isPathAuthorizedForStudioSlice(p, s.sliceId) === false` para **todas as 43 fatias**;
- adicionar `p` ao diff desta fatia torna a branch `safe = false`, com `p` em `unknown`,
  `forbidden` ou `chronologicalViolation`.

## Estados do authorizer que não autorizam nada

| estado | `ok` | `reason` | `isAuthorized(qualquer)` |
|---|---|---|---|
| diff vazio | false | `empty_branch_diff` | false |
| active não resolvida | false | `no_active_slice_resolved` | false |
| active ambígua | false | `ambiguous_active_slice` | false |
| input inválido | false | `invalid_changed_paths` | false |

## Caminhos que a fatia ativa não possui

- path de OUTRA fatia → false (`module-preview-sandbox`, subtree do Builder);
- path proibido não declarado pela ativa → false (`src/App.jsx`, `productionUiGuard.mjs`,
  `src/modules/x.js`);
- cross authorization de outra fatia → não herdada (o par de lifecycle do Builder sob
  App Integration ativa);
- path que ninguém possui → false.

## DB migration continua proibida

```
migrations/001.sql
nested/migrations/001.sql
prisma/migrations/20240101_init/migration.sql
backend/prisma/migrations/x/migration.sql
anything.sql
scripts/migrateUsers.js
```

Cada um é `forbidden_scope` em `classifyStudioScopePath` E torna a branch unsafe quando
adicionado ao diff.

## Core fail-closed preservado

```
resolveActiveStudioSlice([])                 → ok=false, no_active_slice_resolved
evaluateStudioBranchScope([], {caller})      → safe=false, ['no_active_slice_resolved']
evaluateStudioBranchDiffScope([], {caller})  → notApplicable=true, safe=true
evaluateStudioBranchDiffScope([], {desconhecido}) → safe=false, ['unknown_caller_slice']
```
