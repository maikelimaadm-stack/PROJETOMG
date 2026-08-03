# Certification Report — Studio Builder Lifecycle Normalization (fatia 45)

## Objetivo

Levar o catálogo ao estado **final e correto** depois do merge da PR #495. Nenhuma
funcionalidade nova; três campos movem e as asserções que descreviam o estado transitório passam
a descrever o estado final.

## Contexto

```
PR #498  mergeada em 377ca48f  (governança: fatias 42, 43, 44)
PR #495  mergeada em 5bfecd60  (Builder, ordinal 41)
```

Imediatamente após esse merge a `main` ficou, transitoriamente, com o Builder ainda marcado como
`open_pull_request_495` e ainda **autorizado** a carregar consumidores históricos, e com a fatia
44 ainda `active_slice`. Ver [`ROOT-CAUSE.md`](./ROOT-CAUSE.md).

## As três transições

| entrada | campo | de | para |
|---|---|---|---|
| Builder (41) | `status` | `open_pull_request_495` | `merged` |
| Builder (41) | `historicalBranchConsumerCompatibility` | `true` | `false` |
| Fatia 44 | `status` | `active_slice` | `merged` |

Mais a entrada nova da fatia 45 como única `active_slice`, com `compatibility: false`.

Detalhes em [`REGISTRY-LIFECYCLE-TRANSITION.md`](./REGISTRY-LIFECYCLE-TRANSITION.md) e
[`BUILDER-COMPATIBILITY-RESET.md`](./BUILDER-COMPATIBILITY-RESET.md).

## O que a normalização faz na prática

Com **zero** fatias autorizadas, toda fatia ativa anterior ao consumidor é fail-closed. O Builder
deixa de ser um caso especial e passa a ser tratado exatamente como qualquer fatia mergeada:

```
fixture 41 → callers 42/43/44/45  → historical_branch_consumer_compatibility_not_authorized
fixture 24 → callers 42/43/44/45  → idem
fixture 42 → callers 43/44/45     → idem
fixture 43 → callers 44/45        → idem
fixture 44 → caller 45            → idem
```

Sempre com `notApplicable = false`, `certifiedAgainstActiveSlice = false`,
`evaluatedAsSliceId = null`, `blockers = ['active_slice_before_caller']`, `allowed` vazio — e cada
uma dessas branches continua **sã para a própria fatia**.

## O que NÃO muda

- `scripts/gates/lib/studioScopeGovernanceGuard.mjs` **não** está no diff;
- `resolveActiveStudioSlice`, `evaluateStudioBranchScope`, `evaluateStudioBranchDiffScope`,
  `evaluateStudioBranchConsumerScope` e `createResolvedActiveStudioSlicePathAuthorizer` são
  idênticos ao que a `main` já tinha;
- o Builder funcional (`src/studio/blueprint-engine/**`) não é tocado — zero arquivos;
- os 8 padrões cross do Builder permanecem: são o escopo histórico real da PR mergeada;
- a evidência histórica das fatias 41 a 44 não é reescrita;
- nenhuma dependência nova; `package-lock.json` intocado.

## Escopo

Ver [`SCOPE-INVENTORY.md`](./SCOPE-INVENTORY.md). Resumo: registry, `package.json`, teste e gate
próprios, esta pasta de evidência, e exatamente os **seis** consumidores de governança que
afirmavam o ciclo de vida alterado. O teste e o gate do próprio Builder não carregam asserção viva
de status ou compatibilidade — por isso não são modificados nem autorizados.

## Resultados medidos

| item | resultado |
|---|---|
| `test:runtime:studio-builder-lifecycle-normalization` | **247/247 PASS**, 0 fail |
| `gate:g423-studio-builder-lifecycle-normalization` | **288/288 PASS**, exit 0 |
| `test:runtime:studio-bridge-decision-core-envelope-builder` | 1842/1842 PASS |
| `gate:g423-studio-bridge-decision-core-envelope-builder` | 1049/1049 PASS |
| `studio-scope-governance-historical-branch-consumers` | teste 349/349 · gate 510/510 |
| `studio-scope-governance-main-diff-correction` | teste 473/473 · gate 456/456 |
| `studio-scope-governance-chronological-migration` | teste 809/809 · gate 725/725 |
| `studio-scope-governance-maintenance` | teste 74/74 · gate 34/34 |
| `npm run gate:g423` | 7/7 PASS |
| `npm run test:runtime` | zero fail |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |
| `dist/` | 0 hits |

Matriz negativa completa em [`NEGATIVE-MATRIX.md`](./NEGATIVE-MATRIX.md).

## Limites declarados

- a `main` **não** foi verificada: ela ainda não contém esta fatia. `mainVerifiedGreen: false`;
- `postMergeRevalidationRequired: true` — procedimento em
  [`POST-MERGE-REVALIDATION-PLAN.md`](./POST-MERGE-REVALIDATION-PLAN.md);
- os 21 gates pré-Studio de `LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED` continuam não migrados,
  não PASS e não mascarados;
- depois do merge desta fatia o catálogo fica **sem fatia ativa** até a próxima ser registrada —
  esse é o estado correto de repouso.

## Decisão

**STUDIO_BUILDER_LIFECYCLE_NORMALIZED** · aguardando auditoria independente.
