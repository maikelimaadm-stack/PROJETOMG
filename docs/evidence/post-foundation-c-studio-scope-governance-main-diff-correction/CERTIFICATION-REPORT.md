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
por arquivo histórico realmente modificado: 26 testes e 35 gates — **61 padrões cruzados únicos**,
zero duplicata, zero wildcard de diretório, **zero caminho de evidência da fatia 42**.

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

## Evidência histórica preservada imutável

A fatia 42 **não foi editada**. Seus documentos permanecem byte-identical à `main`
(`git diff --exit-code origin/main -- <ambos>` → exit 0) e ausentes do diff desta PR. A
supersessão é declarada, append-only, em `HISTORICAL-CERTIFICATION-SUPERSESSION.md`, dentro da
evidência desta fatia.

Uma rodada anterior desta fatia havia inserido um addendum de supersessão DENTRO dos documentos da
fatia 42. Isso colocou o diretório de evidências dela — que é o `branchMarkerPattern` da 42 — no
diff desta branch, elegendo duas fatias como candidatas ativas, e levou a uma regra implícita de
"candidata emendada" dentro de `resolveActiveStudioSlice`.

Essa regra foi **integralmente removida**. `resolveActiveStudioSlice` voltou ao contrato estrito:

```
zero marker candidates   → no_active_slice_resolved
exatamente um candidate  → fatia ativa resolvida
dois ou mais candidates  → ambiguous_active_slice
```

`crossSliceAuthorizedPatterns`, `sharedGovernancePatterns`, explicit-forbidden, ordinal e status
**não participam da eleição**. Nenhuma candidata é removida, nenhuma ambiguidade é desempatada.
A causa foi eliminada em vez de a exceção ser sofisticada.
