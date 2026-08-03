# Main baseline BEFORE this correction

Medido no worktree real, na `main` em `01e1b701c972869dd705fe90596cf2497a0fa19d`, antes de criar
esta branch. Nenhum arquivo foi alterado na `main` para produzir estes números.

| alvo | exit | resultado |
|---|---|---|
| `npm run test:runtime` | 1 | **20405 / 20425 — 20 fail** |
| `npm run gate:g423` (oficial) | 0 | 7 / 7 |
| `npm run lint` | 0 | limpo |
| `npm run build` | 0 | ok |
| `test:runtime:studio-scope-governance-chronological-migration` | 1 | 775 / 786 — 11 fail |
| `gate:g423-studio-scope-governance-chronological-migration` | 1 | 698 / 708 — 10 fail |
| `test:runtime:studio-scope-governance-maintenance` | 0 | 74 / 74 |
| `gate:g423-studio-scope-governance-maintenance` | 0 | 34 / 34 |
| sweep `gate:g423*` | — | 107 gates, 84 verdes, **22 vermelhos** |

## Os 20 cenários vermelhos do `test:runtime`

Nove agregados, um cenário cada, todos `no prior gate/test altered`:

```
studio-authoring-runtime-to-preview-bridge-contract              626 pass / 1 fail
studio-authoring-runtime-to-preview-bridge-implementation-plan   664 / 1
studio-authoring-runtime-to-preview-bridge                       826 / 1
studio-dev-preview-app-integration-contract                      411 / 1
studio-dev-preview-app-integration-implementation-plan           432 / 1
studio-dev-preview-app-integration                               481 / 1
studio-module-blueprint-authoring-foundation-contract            556 / 1
studio-module-blueprint-authoring-implementation-plan            517 / 1
studio-module-blueprint-authoring-runtime                        683 / 1
```

Mensagem de erro, idêntica nos nove: `active null precedes <caller>`.

Mais onze da seção "THIS BRANCH" do teste da migration: `T001`, `T002` e os nove `T003`.

## Os 22 gates vermelhos do sweep

21 dos 22 gates Studio migrados (`g423-studio-foundation-audit` era o único verde) e o próprio
`g423-studio-scope-governance-chronological-migration`. Todos com
`blocked: no_active_slice_resolved`; nove deles com cascata `unit tests PASS — 0 scenarios`,
porque o gate roda o próprio teste, que também estava vermelho.

**Nenhum dos 12 gates pré-Studio estava vermelho na `main`** — eles voltaram ao verde assim que
o diretório de evidências da fatia 42 passou a fazer parte da `main`. A "limitação conhecida"
declarada na PR #496 se dissolveu, e 22 gates Studio entraram no vermelho no lugar.
