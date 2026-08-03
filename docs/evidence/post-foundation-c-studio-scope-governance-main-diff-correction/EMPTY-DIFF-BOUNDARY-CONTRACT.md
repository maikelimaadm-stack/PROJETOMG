# Empty-diff boundary contract

Três semânticas coexistem e são provadas separadamente.

| API | pergunta | `[]` |
|---|---|---|
| `resolveActiveStudioSlice([])` | qual fatia este conjunto constrói? | `ok:false`, `no_active_slice_resolved` |
| `evaluateStudioBranchScope([], {caller})` | este CONJUNTO de caminhos é seguro? | `safe:false`, blockers `["no_active_slice_resolved"]` |
| `evaluateStudioBranchDiffScope([], {caller})` | este DIFF DE BRANCH viola meu escopo? | `notApplicable:true`, `safe:true` |

`evaluateStudioBranchDiffScope` **não** relaxa o core. Ele o chama integralmente sempre que o diff
é não vazio, e só decide sozinho nos três casos de borda abaixo.

## Contrato completo

### Input inválido — fail-closed

Não-array, item não-string, item string vazia:

```
applicable    = false
notApplicable = false
reason        = 'invalid_changed_paths'
safe          = false
blockers      inclui 'invalid_changed_paths'
```

Input inválido **nunca** é convertido em diff vazio.

### Diff vazio + caller catalogado — notApplicable

```
kind                        = 'studio-branch-diff-scope-evaluation'
applicable                  = false
notApplicable               = true
reason                      = 'empty_branch_diff'
total                       = 0
callerSliceId               = o caller exato
callerSliceOrdinal          = o ordinal do caller
activeSliceId               = null
activeCandidates            = []
allowed                     = []
forbidden                   = []
unknown                     = []
chronologicalViolation      = []
crossAuthorized             = []
explicitForbiddenAuthorized = []
blockers                    = []
safe                        = true
```

`allowed` fica vazio: um diff vazio **não autoriza nada**, apenas não julga nada.

### Diff vazio + caller desconhecido — fail-closed

```
notApplicable = false
reason        = 'unknown_caller_slice'
blockers      = ['unknown_caller_slice']
safe          = false
```

`notApplicable` nunca mascara identidade de chamador inválida.

### Diff não vazio — delegação integral

```
applicable    = true
notApplicable = false
reason        = null
```

Todo o resto vem de `evaluateStudioBranchScope`, preservando same/later/earlier, forbidden
fail-closed, unknown fail-closed, ambiguous fail-closed, cross não herdada e explicit-forbidden
catalog-bound.

## Pureza

Sem `execSync`, `child_process`, `fetch(`, `process.env`, `Date.now`, filesystem, rede ou mutação.
O relatório é congelado (`Object.isFrozen`).
