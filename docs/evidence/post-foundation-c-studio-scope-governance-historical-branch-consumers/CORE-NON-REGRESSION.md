# Core non-regression

As quatro APIs anteriores permanecem **inalteradas**. Nenhum modo permissivo foi adicionado a
nenhuma delas.

| API | comportamento preservado |
|---|---|
| `resolveActiveStudioSlice` | zero / um / múltiplos estrito; cross, shared, explicit-forbidden, ordinal e status não participam da eleição |
| `evaluateStudioBranchScope` | conjunto vazio continua fail-closed |
| `evaluateStudioBranchDiffScope` | diff vazio = `notApplicable`; **active anterior ao caller continua FAIL com `active_slice_before_caller`** |
| `createResolvedActiveStudioSlicePathAuthorizer` | exato, ligado à fatia ativa, não injetável, não chronology-free |

## A prova que não pode regredir

```
evaluateStudioBranchDiffScope(diff do Builder 41, caller 42) → safe = false, active_slice_before_caller
evaluateStudioBranchDiffScope(diff do Builder 41, caller 43) → safe = false, active_slice_before_caller
evaluateStudioBranchDiffScope(diff do Builder 41, caller 44) → safe = false, active_slice_before_caller
```

Somente `evaluateStudioBranchConsumerScope` pode declarar esses consumidores **não aplicáveis**, e
só depois de certificar a branch contra a própria fatia ativa 41.

## O que continua proibido

- `allowHistorical`, `ignoreChronology` ou qualquer opção equivalente;
- usar `status` para decidir cronologia;
- prefixo de `sliceId`;
- nome de branch, relógio, env, rede ou GitHub dentro do guard;
- remover `active_slice_before_caller`.

## Assinaturas inalteradas

```js
resolveActiveStudioSlice(changedPaths)
evaluateStudioBranchScope(changedPaths, { callerSliceId })
evaluateStudioBranchDiffScope(changedPaths, { callerSliceId })
createResolvedActiveStudioSlicePathAuthorizer(changedPaths)
```

Nenhuma ganhou parâmetro novo.


---

# Emenda pós-auditoria — o core também governa o caso não autorizado

Quando a fatia ativa é anterior ao consumidor e **não** carrega
`historicalBranchConsumerCompatibility: true`, o wrapper não inventa veredito: devolve o do core.

```
evaluateStudioBranchDiffScope(FIXTURE_24, { caller: 42/43/44 }) → safe=false, active_slice_before_caller
evaluateStudioBranchConsumerScope(FIXTURE_24, { caller: 42/43/44 }) → safe=false, blockers ['active_slice_before_caller']

evaluateStudioBranchDiffScope(FIXTURE_42, { caller: 43/44 })    → safe=false, active_slice_before_caller
evaluateStudioBranchConsumerScope(FIXTURE_42, { caller: 43/44 })    → safe=false, blockers ['active_slice_before_caller']

evaluateStudioBranchDiffScope(FIXTURE_43, { caller: 44 })       → safe=false, active_slice_before_caller
evaluateStudioBranchConsumerScope(FIXTURE_43, { caller: 44 })       → safe=false, blockers ['active_slice_before_caller']
```

O wrapper e o core concordam, caso a caso. A superfície de exceção é exatamente uma fatia.

Tokens que continuam ausentes do guard, agora também verificados como identidade:

```
allowHistorical · ignoreChronology · skipChronology · permissive · bypassChronology
bridge-decision-core-envelope-builder · open_pull_request · 495
sliceOrdinal === 41 · sliceOrdinal == 41
```

`resolveActiveStudioSlice`, `evaluateStudioBranchScope`, `evaluateStudioBranchDiffScope` e
`createResolvedActiveStudioSlicePathAuthorizer` não foram modificados.
