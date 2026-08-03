# Plano de revalidação pós-merge — fatia 44

Executar **somente** depois que Maike confirmar o merge manual desta PR na `main`.
Read-only: sem commit, sem alteração de arquivo, sem merge, sem ready, sem tocar na #495.
Se qualquer item reprovar: PARAR, reportar `FAIL`, não corrigir automaticamente.

## 0. Base

```
git fetch origin main
git checkout main && git pull origin main
git rev-parse HEAD          # registrar o SHA da main mergeada
git status --porcelain      # deve ser vazio
```

## 1. Diff vazio na `main` — a regressão que a fatia 43 corrigiu

Na `main`, `git diff --name-only origin/main...HEAD` é **vazio**. Verificar que isso continua
sendo tratado como inaplicável e seguro, não como falha:

```
evaluateStudioBranchDiffScope([],     { callerSliceId: <qualquer caller conhecido> }) → notApplicable, safe
evaluateStudioBranchConsumerScope([], { callerSliceId: <qualquer caller conhecido> }) → notApplicable, safe, reason 'empty_branch_diff'
```

## 2. Núcleo intacto na `main`

```
resolveActiveStudioSlice([])                                → ok false, no_active_slice_resolved
evaluateStudioBranchScope([], { caller: 44 })               → safe false
evaluateStudioBranchDiffScope(FIXTURE_41, { caller: 42/43/44 }) → safe false, active_slice_before_caller
evaluateStudioBranchScope(FIXTURE_41,     { caller: 42/43/44 }) → active_slice_before_caller
```

Tokens ausentes no guard: `allowHistorical`, `ignoreChronology`, `skipChronology`, `permissive`,
`bypassChronology`.

## 3. Aplicabilidade na `main`

```
evaluateStudioBranchConsumerScope(FIXTURE_41, { caller: 41 })    → aplicável, safe, 5/5 allowed
evaluateStudioBranchConsumerScope(FIXTURE_41, { caller: 42/43/44 })
    → notApplicable, safe, reason 'consumer_slice_after_active_slice',
      certifiedAgainstActiveSlice true, evaluatedAsSliceId 'bridge-decision-core-envelope-builder'
```

E toda a matriz negativa de `NEGATIVE-MATRIX.md` continuando a reprovar.

## 4. Bateria completa na `main`

```
npm run test:runtime:studio-scope-governance-historical-branch-consumers
npm run gate:g423-studio-scope-governance-historical-branch-consumers
npm run test:runtime:studio-scope-governance-main-diff-correction
npm run gate:g423-studio-scope-governance-main-diff-correction
npm run test:runtime:studio-scope-governance-chronological-migration
npm run gate:g423-studio-scope-governance-chronological-migration
npm run test:runtime:studio-scope-governance-maintenance
npm run gate:g423-studio-scope-governance-maintenance
os 9 testes agregados migrados
os 22 gates Studio migrados
npm run gate:g423
npm run test:runtime          # contagem total deve subir, nunca cair
npm run lint
npm run build
varredura completa: todos os gates g423-* , exit 0
```

## 5. Decisão sobre a PR #495 — e só então

Se **todos** os itens acima passarem na `main`, e somente então, pode-se avaliar
`READY_TO_UPDATE_PR495_WITH_MAIN`. A avaliação continua sendo uma **recomendação**: a
atualização em si depende de autorização explícita e não faz parte desta fatia.

Conflitos de texto já previstos para essa futura atualização: `package.json` e
`scripts/gates/lib/studioScopeGovernanceRegistry.mjs`. Eles são resolvíveis; o bloqueio
semântico — `active_slice_before_caller` nos consumidores posteriores — é o que esta fatia
remove, sem enfraquecer o núcleo.

## 6. Se algo reprovar

Reportar `FAIL` com o item exato, a saída exata e o SHA da `main`. Não emendar evidência
histórica, não editar documento mergeado, não mascarar. Correção, se necessária, é uma fatia
nova com PR nova — evidência histórica mergeada é imutável, supersessão é declarada pela fatia
corretiva posterior.
