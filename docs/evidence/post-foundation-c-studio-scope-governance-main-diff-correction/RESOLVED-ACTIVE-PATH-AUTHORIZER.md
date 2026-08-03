# Resolved-active-slice path authorizer

`createResolvedActiveStudioSlicePathAuthorizer(changedPaths)` é a **única** fonte de isenção para
os regexes históricos de substring. Ela substitui as três variantes que existiam:

| variante removida | problema |
|---|---|
| `migrationExempt` local em 17 testes | reimplementação por arquivo; quarta variante inevitável |
| `startsWith('studio-scope-governance-')` em 10 gates | prefixo casa 3 fatias, 2 delas anteriores; sem checagem de path |
| `isKnownLaterStudioHeadlessArtifact` / `classifyStudioScopePath` em 2 gates | chronology-free: nunca vê o conjunto de arquivos |

## Contrato

```
kind               = 'resolved-active-studio-slice-path-authorizer'
ok                 = true somente com exatamente UMA fatia ativa resolvida
activeSliceId      = id exato ou null
activeSliceOrdinal = ordinal exato ou null
reason             = null | invalid_changed_paths | empty_branch_diff
                   | no_active_slice_resolved | ambiguous_active_slice
isAuthorized(path) = ok && isPathAuthorizedForStudioSlice(path, activeSliceId)
```

Autoriza **nada** quando: input inválido, diff vazio, active não resolvida, active ambígua.

## Propriedades provadas

- sem nome de branch, sem prefixo de sliceId, sem fatia hardcoded;
- sem `expected slice` injetável que pudesse alargar;
- caminho parecido mas não catalogado → `false`;
- caminho de outra fatia → `false`;
- caminho proibido não declarado pela active → `false`;
- cross authorization de outra fatia não é herdada.

Esta API **não certifica branch**. Certificação pertence a `evaluateStudioBranchDiffScope`.
