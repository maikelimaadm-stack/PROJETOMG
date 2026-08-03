# Matriz negativa — fatia 45

A normalização **remove** uma exceção. Nada é afrouxado; a superfície de exceção do catálogo passa
de uma fatia para zero.

## 1. Nenhuma fatia autorizada, nenhuma exceção

```
fatias com historicalBranchConsumerCompatibility === true : 0
fatias merged com autorização                             : 0
```

Consequência direta: **toda** fatia ativa anterior ao consumidor é fail-closed.

| branch (fatia ativa) | ordinal | caller | `reason` | `safe` |
|---|---|---|---|---|
| `bridge-decision-core-envelope-builder` | 41 | 42 / 43 / 44 / 45 | `historical_branch_consumer_compatibility_not_authorized` | **false** |
| `dev-preview-app-integration` | 24 | 42 / 43 / 44 / 45 | idem | **false** |
| `studio-scope-governance-chronological-migration` | 42 | 43 / 44 / 45 | idem | **false** |
| `studio-scope-governance-main-diff-correction` | 43 | 44 / 45 | idem | **false** |
| `studio-scope-governance-historical-branch-consumers` | 44 | 45 | idem | **false** |

Em todos: `notApplicable = false`, `certifiedAgainstActiveSlice = false`,
`evaluatedAsSliceId = null`, `blockers = ['active_slice_before_caller']`, `allowed` vazio.

Cada uma dessas branches continua **sã para a própria fatia** — o bloqueio é de autorização, não
de qualidade.

## 2. O core não mudou

```
resolveActiveStudioSlice([])                          → ok false, no_active_slice_resolved
evaluateStudioBranchScope([], caller)                 → safe false
evaluateStudioBranchDiffScope([], caller)             → notApplicable, safe true
evaluateStudioBranchDiffScope(FIXTURE_41, caller 42+) → safe false, active_slice_before_caller
```

Ausentes do guard: `allowHistorical`, `ignoreChronology`, `skipChronology`, `permissive`,
`bypassChronology`, e o id/ordinal/status do Builder.

## 3. Status e ordinal continuam não decidindo

- há exatamente uma fatia não-`merged` (a 45) e ela **não** é autorizada;
- 44 fatias têm ordinal menor que 45 e nenhuma é autorizada;
- o guard não contém `status`, `open_pull_request`, `495` nem `sliceOrdinal === 41`.

## 4. Autorização não é injetável

`{ historicalBranchConsumerCompatibility: true }`, `{ allowHistorical: true }`,
`{ ignoreChronology: true }`, `{ expectedActiveSlice: … }` como opção do chamador continuam sem
efeito: `safe = false`, razão inalterada.

## 5. Entrada inválida, caller desconhecido, ativa irresolvível

```
null · undefined · 'x' · {} · [1] · [''] · ['a',2] · [[]]   → invalid_changed_paths, safe false
caller 'nope'                                               → unknown_caller_slice, safe false
['package.json']                                            → no_active_slice_resolved, safe false
dois marcadores                                             → ambiguous_active_slice, safe false
```

`notApplicable` nunca é `true` em nenhum desses estados.

## 6. Classificação intacta

```
src/App.jsx · backend/server.js · src/modules/x.js · src/pages/x.jsx ·
prisma/schema.prisma · productionUiGuard.mjs      → forbidden_scope
docs/nobody/x.md                                  → unknown_scope
```

## 7. Escopo da própria fatia 45

- evidência histórica das fatias 41–44 **não** é cross-authorized;
- `studioScopeGovernanceGuard.mjs` **não** é cross-authorized;
- um sétimo consumidor de governança não listado (`…-maintenance`) é recusado;
- um vizinho com sufixo diferente é recusado;
- um caminho cross nunca elege fatia ativa;
- os 21 gates pré-Studio não migrados continuam fora do escopo desta fatia.
