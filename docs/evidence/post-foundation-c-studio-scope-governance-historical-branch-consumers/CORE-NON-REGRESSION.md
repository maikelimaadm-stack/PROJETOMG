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
