# Post-merge root cause — three real regressions on `main`

A PR #496 foi mergeada em `main` pelo merge commit `01e1b701c972869dd705fe90596cf2497a0fa19d`
(pais `73d298e0` + `1ad97ccd`). A certificação pré-merge foi medida **na branch**, e a branch é
o único ambiente em que os checks migrados podiam passar. Na `main` eles ficam permanentemente
vermelhos.

## B1 — B-POSTMERGE-EMPTY-DIFF-FAILS-CLOSED-ON-MAIN

Os checks branch-relative obtêm o diff assim:

```js
git diff --name-only origin/main...HEAD
```

e se protegem apenas com:

```js
if (files === null) return;
```

Esse guard cobre **somente** o caso em que o comando LANÇA. Na `main` o comando **sucede** e
devolve string vazia, que vira `[]`. O consumidor então chama `evaluateStudioBranchScope([])`,
que corretamente resolve zero active slice e falha fechado (`no_active_slice_resolved`,
`safe = false`), e a asserção quebra.

O core está certo. O erro está na **borda**: um diff vazio significa "nenhuma mudança para
julgar", não "branch Studio inválida". Antes da #496, o mesmo cenário era
`assert.ok(!files.some(...))`, que com `[]` é vacuamente verdadeiro.

Impacto medido na `main` em `01e1b701`:

| alvo | resultado |
|---|---|
| `npm run test:runtime` | 20405 / 20425 — **20 fail**, exit 1 |
| nove testes agregados | 9/9 exit 1, 1 cenário vermelho cada |
| teste da migration (seção T) | 775 / 786 — 11 fail |
| gate da migration | 698 / 708 — 10 fail |
| 22 gates Studio migrados | 21 vermelhos |
| sweep `gate:g423*` | 84 verdes / 22 vermelhos |

## B2 — B-TWO-EXTENSION-GATES-NOT-ACTIVE-BOUND

`g423-studio-blueprint-engine-foundation.mjs` e `g423-studio-blueprint-module-reference-planner.mjs`
isentam o blanket histórico com um filtro **por caminho isolado**:

```js
FORBIDDEN.some((re) => re.test(f)) && !isKnownLaterStudioHeadlessArtifact(f)
  && classifyStudioScopePath(f) !== 'forbidden_scope' ? true : filterForbiddenScopePaths([f]).length > 0
```

Essa expressão nunca recebe o conjunto de arquivos, logo **não conhece a fatia ativa** e não
verifica ordinal. Qualquer caminho catalogado — de qualquer fatia, inclusive anteriores — escapa
do `/migration/i`, `/prisma/i`, `/\.css$/`. É exatamente o defeito chronology-free que a fatia 42
existia para eliminar.

## B3 — B-TEN-EXTENSION-GATES-PREFIX-BOUND

Dez gates (e os dois blocos equivalentes dentro dos nove testes) usam:

```js
resolveActiveStudioSlice(files).sliceId.startsWith('studio-scope-governance-')
```

Prefixo casa três fatias — `studio-scope-governance-maintenance` (9),
`studio-scope-governance-self-guard-fix` (10) e a migration (42) — sendo duas delas
**anteriores** a todos esses chamadores. E nenhuma verificação de autorização de caminho é feita.

## Correção

Esta fatia 43 introduz uma borda explícita (`evaluateStudioBranchDiffScope`) e uma única fonte de
isenção exata (`createResolvedActiveStudioSlicePathAuthorizer`), e migra os 29+ consumidores para
elas. O core continua fail-closed, sem exceção.
