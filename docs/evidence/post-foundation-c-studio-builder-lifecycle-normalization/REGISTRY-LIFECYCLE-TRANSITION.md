# Transição de ciclo de vida no catálogo

Três campos movem. Nada mais.

| entrada | campo | de | para |
|---|---|---|---|
| `bridge-decision-core-envelope-builder` (41) | `status` | `open_pull_request_495` | `merged` |
| `bridge-decision-core-envelope-builder` (41) | `historicalBranchConsumerCompatibility` | `true` | `false` |
| `studio-scope-governance-historical-branch-consumers` (44) | `status` | `active_slice` | `merged` |

E uma entrada nova, já em repouso:

```
studio-builder-lifecycle-normalization · ordinal 45
  status                                = merged
  historicalBranchConsumerCompatibility = false
  primaryArtifactPatterns               = 3
  branchMarkerPatterns                  = 1  (só o diretório de evidência)
  crossSliceAuthorizedPatterns          = 6  (exatos)
  sharedGovernancePatterns              = 3
  explicitlyAuthorizedForbiddenPatterns = []
```

## O que NÃO muda na entrada do Builder

```
sliceOrdinal                          41
primaryArtifactPatterns                4
crossSliceAuthorizedPatterns           8   (2 lifecycle + 6 governance integration)
explicitlyAuthorizedForbiddenPatterns  []
```

Os 8 padrões cross são o **escopo histórico real** da PR #495 mergeada: os dois artefatos do
implementation plan que a fatia corrigiu de forma lifecycle-safe, e os seis consumidores de
governança cujas autoasserções ela teve de proteger ao integrar a `main`. Removê-los agora
falsificaria o histórico de uma PR já mergeada. Eles permanecem.

## Estado final do catálogo — repouso

```
45 entradas · ordinais contíguos 1..45 · dez chaves em todas
status da família merged           → 45
  44 `merged`
   1 `merged_without_dedicated_artifacts`  (fatia 39, pré-existente, não alterada)
active_slice                       → 0
open_pull_request_*                → 0
fatias com compatibility true      → 0
```

A fatia 45 nasce `merged` de propósito: marcá-la `active_slice` deixaria um resíduo no instante
do merge. `status` é metadado histórico e nunca elegeu fatia — a branch continua resolvida como
45 por `branchMarkerPatterns`.

Zero é o estado natural do campo: ele só sai de zero enquanto existe uma branch histórica aberta
que precise carregar consumidores posteriores.
