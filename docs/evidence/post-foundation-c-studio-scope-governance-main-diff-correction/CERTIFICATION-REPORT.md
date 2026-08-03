# Certification report — Studio Scope Governance Main-Diff Correction

Fatia 43. Corrige três regressões reais já mergeadas na `main` pela PR #496
(merge commit `01e1b701c972869dd705fe90596cf2497a0fa19d`).

A PR #496 está mergeada e não pode ser reaberta. A PR #495 permanece OPEN + DRAFT e não foi
tocada. Esta é uma PR nova, draft, exclusivamente corretiva.

## O que foi corrigido

| blocker | correção |
|---|---|
| `B-POSTMERGE-EMPTY-DIFF-FAILS-CLOSED-ON-MAIN` | nova borda `evaluateStudioBranchDiffScope`; diff vazio = `notApplicable`, não violação |
| `B-TWO-EXTENSION-GATES-NOT-ACTIVE-BOUND` | os 2 gates chronology-free passaram ao authorizer central |
| `B-TEN-EXTENSION-GATES-PREFIX-BOUND` | os 10 gates prefix-bound (e 4 testes equivalentes) passaram ao authorizer central |

Detalhe em `POST-MERGE-ROOT-CAUSE.md`, `EMPTY-DIFF-BOUNDARY-CONTRACT.md` e
`RESOLVED-ACTIVE-PATH-AUTHORIZER.md`.

## O core NÃO foi enfraquecido

```
resolveActiveStudioSlice([])                → ok=false, no_active_slice_resolved
evaluateStudioBranchScope([], {caller})     → safe=false, ['no_active_slice_resolved']
evaluateStudioBranchDiffScope([], {caller}) → notApplicable=true, safe=true, allowed=[]
```

As três semânticas coexistem e são provadas lado a lado, na nova fatia e na fatia 42.

## Escopo

Registrado primeiro (`Register Studio scope governance main-diff correction`), com um regex exato
por arquivo histórico realmente modificado: 27 testes, 34 gates e 2 documentos de evidência
superseded — 63 padrões cruzados, zero duplicata, zero wildcard de diretório.

## Não tocado

`src/studio/blueprint-engine/**` · o Builder da #495 · `src/App.jsx` · `src/pages` ·
`src/components` · `src/modules` · `src/runtime` fora de `__tests__` · `backend/**` · `prisma/**` ·
`migrations/**` · `productionUiGuard.mjs` · contratos de domínio · runtime v2 · consumer runtime ·
preview mount · rota/menu de produto · os 21 gates pré-Studio. Nenhuma dependência nova.

## Status

**POST_MERGE_REVALIDATION_REQUIRED.** Ver `POST-MERGE-REVALIDATION-PLAN.md`. Esta branch não
certifica a `main`, e `READINESS.md` declara `mainVerifiedGreen:false`.

## Resultado

| alvo | branch |
|---|---|
| `test:runtime:studio-scope-governance-main-diff-correction` | **424 / 424** (mínimo 180) |
| `gate:g423-studio-scope-governance-main-diff-correction` | **409 / 409** (mínimo 120) |
| `npm run test:runtime` | **20859 / 20859 — 0 fail** |
| `gate:g423` | 7 / 7 |
| sweep `gate:g423*` | 95 verdes / 12 vermelhos, todos pré-Studio |

Matriz completa em `BRANCH-REGRESSION-MATRIX.md`.

## Uma correção adicional, declarada

Adicionar o addendum de supersessão aos dois documentos da fatia 42 colocou o diretório de
evidências dela no diff desta branch. Como esse diretório é o `branchMarkerPattern` da fatia 42,
duas fatias passaram a ser eleitas como ativas e `resolveActiveStudioSlice` — corretamente —
retornou `ambiguous_active_slice`.

A resolução NÃO foi afrouxar a ambiguidade. Foi tornar explícita, no próprio modelo, a diferença
entre **construir** uma fatia e **emendar** uma fatia anterior:

> quando TODOS os caminhos-marcador que elegem uma candidata S são explicitamente
> cross-autorizados por OUTRA candidata T, S está sendo emendada, não construída, e portanto não
> é candidata ativa.

A autorização é exata, por caminho, declarada no catálogo e nunca herdável — logo a regra não pode
alargar nada. Ambiguidade genuína (duas fatias construídas ao mesmo tempo, sem cross authorization
entre elas) continua bloqueando, e isso é provado diretamente.
