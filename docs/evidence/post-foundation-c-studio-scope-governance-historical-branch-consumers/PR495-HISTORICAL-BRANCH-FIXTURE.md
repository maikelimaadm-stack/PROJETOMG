# Fixture histórica da PR #495 — branch Builder, ordinal 41

## Por que uma fixture

A PR #495 **não pode ser tocada** nesta execução: sem checkout, sem merge, sem rebase, sem
alteração de body. A prova de que a nova fronteira desbloqueia aquela branch tem, portanto, de
ser feita sobre um **conjunto representativo determinístico de caminhos**, avaliado em memória
pelas mesmas APIs que os consumidores usam. Nada é lido do disco daquela branch; nenhum
worktree sintético é criado; nenhum arquivo é gerado.

## Os caminhos

```
src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js
docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md
src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js
scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs
package.json
```

Correspondência com o catálogo, fatia `bridge-decision-core-envelope-builder` (ordinal 41):

| caminho | classificação |
|---|---|
| `src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js` | primary (subtree própria) |
| `docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md` | primary **e** branch marker |
| `src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js` | primary |
| `scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs` | primary |
| `package.json` | shared governance |

Exatamente **um** branch marker → `resolveActiveStudioSlice` devolve `ok: true`,
`sliceId: bridge-decision-core-envelope-builder`, `sliceOrdinal: 41`, `candidates.length: 1`.

## O que a fixture prova

| caller | ordinal | `evaluateStudioBranchDiffScope` (certificação) | `evaluateStudioBranchConsumerScope` (aplicabilidade) |
|---|---|---|---|
| `bridge-decision-core-envelope-builder` | 41 | `safe: true` | aplicável, `safe: true`, 5/5 allowed |
| `studio-scope-governance-maintenance` | 9 | `safe: true` | aplicável, `safe: true` |
| `studio-scope-governance-chronological-migration` | 42 | **`safe: false`**, `active_slice_before_caller` | inaplicável, `safe: true`, certificado contra 41 |
| `studio-scope-governance-main-diff-correction` | 43 | **`safe: false`**, `active_slice_before_caller` | inaplicável, `safe: true`, certificado contra 41 |
| `studio-scope-governance-historical-branch-consumers` | 44 | **`safe: false`**, `active_slice_before_caller` | inaplicável, `safe: true`, certificado contra 41 |

A coluna do meio é o **core intacto**: continua reprovando. É isso que garante que a fronteira
nova não enfraqueceu nada — ela apenas responde a outra pergunta.

## O que a fixture prova que continua reprovando

Acrescentando um caminho ruim ao conjunto, para qualquer caller posterior:

| acréscimo | `reason` | `safe` |
|---|---|---|
| `src/App.jsx` | `active_slice_scope_invalid` | `false` |
| `backend/server.js` | `active_slice_scope_invalid` | `false` |
| `src/modules/x.js` | `active_slice_scope_invalid` | `false` |
| `scripts/gates/lib/productionUiGuard.mjs` | `active_slice_scope_invalid` | `false` |
| `prisma/schema.prisma` | `active_slice_scope_invalid` | `false` |
| `docs/nobody/x.md` | `active_slice_scope_invalid` | `false` |
| `src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js` | `active_slice_scope_invalid` | `false` |
| `docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md` | `ambiguous_active_slice` | `false` |

Em todos os casos `notApplicable` é `false`: a inaplicabilidade nunca é usada como saída de
emergência para um diff que o dono da branch não certificaria.

## Limite honesto

Esta fixture é o **conjunto representativo** da branch da #495, não o diff real medido naquela
branch. O diff real só pode ser medido quando a #495 for atualizada com a `main` — o que esta
fatia não faz e não autoriza. Ver `POST-MERGE-REVALIDATION-PLAN.md`.
