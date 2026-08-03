# Plano de revalidação pós-merge — fatia 45

Executar **somente** depois que Maike confirmar o merge manual desta PR na `main`.
Read-only: sem commit, sem alteração de arquivo, sem merge, sem ready.
Se qualquer item reprovar: PARAR, reportar `FAIL`, não corrigir automaticamente.

## 0. Base

```bash
git fetch origin main
git checkout main && git pull --ff-only origin main
git rev-parse HEAD          # registrar o SHA
git status --porcelain      # deve ser vazio
git diff --name-only origin/main...HEAD   # deve ser vazio
```

## 1. Estado final do catálogo

```
45 entradas · ordinais contíguos 1..45 · dez chaves em todas
exatamente uma active_slice → studio-builder-lifecycle-normalization (45)
fatias com historicalBranchConsumerCompatibility true → 0
nenhuma fatia merged autorizada

bridge-decision-core-envelope-builder (41)
  status = merged · compatibility = false
  primary 4 · cross 8 · explicitForbidden 0

studio-scope-governance-historical-branch-consumers (44)
  status = merged
```

## 2. Fail-closed universal

Com zero fatias autorizadas, toda fatia ativa anterior ao consumidor reprova:

```
fixture 41 → callers 42/43/44/45   → historical_branch_consumer_compatibility_not_authorized
fixture 24 → callers 42/43/44/45   → idem
fixture 42 → callers 43/44/45      → idem
fixture 43 → callers 44/45         → idem
fixture 44 → caller 45             → idem
```

Sempre com `notApplicable = false`, `certifiedAgainstActiveSlice = false`,
`evaluatedAsSliceId = null`, `blockers = ['active_slice_before_caller']`, `safe = false`.

## 3. Core intacto

```
resolveActiveStudioSlice([])                       → ok false
evaluateStudioBranchScope([], caller)              → safe false
evaluateStudioBranchDiffScope([], caller)          → notApplicable, safe true
evaluateStudioBranchConsumerScope([], caller)      → empty_branch_diff, notApplicable, safe true
```

Tokens ausentes do guard: `allowHistorical`, `ignoreChronology`, `skipChronology`, `permissive`,
`bypassChronology`, `bridge-decision-core-envelope-builder`, `open_pull_request`, `495`.

## 4. Diff vazio na `main`

Na `main` o diff da branch é vazio. Todos os gates de governança e o gate desta fatia devem
passar nesse estado — nenhuma autoasserção de escopo próprio pode reprovar por diff vazio.

## 5. Bateria completa

```
npm run test:runtime:studio-builder-lifecycle-normalization
npm run gate:g423-studio-builder-lifecycle-normalization
npm run test:runtime:studio-bridge-decision-core-envelope-builder
npm run gate:g423-studio-bridge-decision-core-envelope-builder
os quatro pares de governança (9, 42, 43, 44)
os 9 testes agregados e os 22 gates Studio
npm run gate:g423          → 7/7
npm run test:runtime       → zero fail, total não pode cair
npm run lint · npm run build
varredura completa g423-*  → zero gate Studio vermelho
```

## 6. Estado de repouso

Depois desta fatia o catálogo fica sem fatia ativa até a próxima ser registrada. Isso é
esperado e correto — `active_slice` marca trabalho em curso, e não há trabalho em curso.

## 7. Se algo reprovar

Reportar `FAIL` com o item exato, a saída exata e o SHA da `main`. Não emendar evidência
histórica, não mascarar. Correção, se necessária, é fatia nova com PR nova — evidência histórica
mergeada é imutável, supersessão é declarada pela fatia corretiva posterior.
