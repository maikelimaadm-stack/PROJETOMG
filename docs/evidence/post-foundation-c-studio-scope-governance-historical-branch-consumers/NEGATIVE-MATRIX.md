# Matriz negativa — o que continua reprovando

A pergunta que esta fatia responde é "este consumidor se aplica a esta branch?". A pergunta que
ela **não** responde é "esta branch é boa?". Tudo o que reprovava antes continua reprovando,
inclusive — e sobretudo — quando o consumidor é posterior à fatia ativa.

## 1. Núcleo intacto

| chamada | resultado |
|---|---|
| `resolveActiveStudioSlice([])` | `ok: false`, `no_active_slice_resolved` |
| `evaluateStudioBranchScope([], { caller: 44 })` | `safe: false` |
| `evaluateStudioBranchDiffScope(FIXTURE_41, { caller: 42 })` | `safe: false`, `active_slice_before_caller` |
| `evaluateStudioBranchDiffScope(FIXTURE_41, { caller: 43 })` | `safe: false`, `active_slice_before_caller` |
| `evaluateStudioBranchDiffScope(FIXTURE_41, { caller: 44 })` | `safe: false`, `active_slice_before_caller` |
| `evaluateStudioBranchScope(FIXTURE_41, { caller: 42/43/44 })` | `active_slice_before_caller` |

Tokens ausentes do guard, verificados por varredura: `allowHistorical`, `ignoreChronology`,
`skipChronology`, `permissive`, `bypassChronology`. Também ausentes as maquinarias de emenda
removidas na fatia 43: `electedBy`, `amendedBy`, `amendsSliceIds`,
`activeMarkerAmendmentPatterns`, `amendedCandidates`.

## 2. Entrada inválida nunca vira "vazio"

`null`, `undefined`, `'x'`, `{}`, `[1]`, `['']`, `['a', 2]`, `[[]]` →
`safe: false`, `notApplicable: false`, `reason: 'invalid_changed_paths'`.

## 3. Caller desconhecido nunca vira inaplicável

`{ callerSliceId: 'nope' }`, com diff vazio ou real → `safe: false`, `reason: 'unknown_caller_slice'`.
Caller ausente (`{}`) → `safe: false`.
`null` + caller desconhecido → `blockers: ['invalid_changed_paths', 'unknown_caller_slice']`.

## 4. Fatia ativa irresolvível nunca vira inaplicável

| diff | `reason` |
|---|---|
| `['package.json']` | `no_active_slice_resolved` |
| `['package.json', 'package-lock.json']` | `no_active_slice_resolved` |
| dois marcadores (41 + 44, 24 + 44, 41 + 43, 42 + 44, 43 + 44, 24 + 41) | `ambiguous_active_slice` |

Em nenhum caso `notApplicable` é `true`; em nenhum caso o maior ordinal, o `status` ou uma
autorização cruzada desempata.

## 5. Passageiro não mascara nada

Fixture 41 + caminho ruim, caller 43 (posterior):

| acréscimo | `reason` | `safe` | lista |
|---|---|---|---|
| `src/App.jsx` | `active_slice_scope_invalid` | `false` | `forbidden` |
| `backend/server.js` | `active_slice_scope_invalid` | `false` | `forbidden` |
| `src/modules/x.js` | `active_slice_scope_invalid` | `false` | `forbidden` |
| `scripts/gates/lib/productionUiGuard.mjs` | `active_slice_scope_invalid` | `false` | `forbidden` |
| `prisma/schema.prisma` | `active_slice_scope_invalid` | `false` | `forbidden` |
| `src/pages/x.jsx` | `active_slice_scope_invalid` | `false` | `forbidden` |
| `docs/nobody/x.md` | `active_slice_scope_invalid` | `false` | `unknown` |
| `studio-module-preview-sandbox-contract.test.js` | `active_slice_scope_invalid` | `false` | `chronologicalViolation` |
| marcador da fatia 24 | `ambiguous_active_slice` | `false` | `activeCandidates: 2` |

Sempre com `certifiedAgainstActiveSlice: true` (a recertificação **rodou** e foi ela que reprovou)
e `notApplicable: false`.

## 6. Os oito sósias continuam sem dono

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

Nenhuma das 44 fatias os autoriza; o autorizador ativo os recusa; acrescentá-los torna insegura
tanto a branch própria quanto a branch passageira.

## 7. Artefatos reais de migração de banco continuam proibidos

`migrations/001.sql`, `nested/migrations/001.sql`, `prisma/migrations/20240101_init/migration.sql`,
`backend/prisma/migrations/x/migration.sql`, `anything.sql`, `scripts/migrateUsers.js` →
`forbidden_scope`, e entram em `forbidden` mesmo numa branch passageira.

## 8. Autorização cruzada e forbidden explícito

- Autorização cruzada não é herdada: caller 24 com um caminho da fatia 41 →
  `chronologicalViolation`.
- `explicitlyAuthorizedForbidden` não é injetável por opção do chamador.
- `explicitlyAuthorizedForbidden` não é herdado por outra fatia.
- Um caminho explicitamente autorizado nunca elege fatia ativa.

## 9. Gates pré-Studio permanecem fora

Os 21 gates de `LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED` não chamam nenhuma das três
fronteiras, não têm dono no catálogo e não estão no escopo desta fatia. Não migrados,
não PASS, não mascarados.
