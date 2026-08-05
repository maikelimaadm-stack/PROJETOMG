# Causa raiz — o run vermelho 31041688686

## O que aconteceu

A PR #500 nasceu como a correção de **P1-01**: o único workflow do repositório
(`.github/workflows/foundation-governance.yml`) não executava `npm run test:runtime` nem
`npm run gate:g423`. Contagem no workflow antes da PR: `test:runtime` = 0, `gate:g423` = 0,
`verify:all` = 0, `studio` = 0, `prisma` = 0, `e2e` = 0.

Ao ligar o enforcement, o primeiro run real foi:

```
run 31041688686 · Build · Lint · Typecheck · Governance · failure
# tests 23375 · # pass 23314 · # fail 61 · # skipped 0
```

As **61 falhas** foram reproduzidas localmente byte a byte, o que descarta peculiaridade
de ambiente de CI.

## Distribuição exata das 61 falhas

```
20  studio-scope-governance-historical-branch-consumers.test.js
12  studio-scope-governance-main-diff-correction.test.js
12  studio-scope-governance-chronological-migration.test.js
 8  studio-builder-lifecycle-normalization.test.js
 1  studio-module-blueprint-authoring-runtime.test.js
 1  studio-module-blueprint-authoring-implementation-plan.test.js
 1  studio-module-blueprint-authoring-foundation-contract.test.js
 1  studio-authoring-runtime-to-preview-bridge.test.js
 1  studio-authoring-runtime-to-preview-bridge-contract.test.js
 1  studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js
 1  studio-dev-preview-app-integration.test.js
 1  studio-dev-preview-app-integration-contract.test.js
 1  studio-dev-preview-app-integration-implementation-plan.test.js
```

## Causa semântica

O diff da branch continha um único caminho: o workflow. Medido pelo guard:

```
classifyStudioScopePath('.github/workflows/foundation-governance.yml') = unknown_scope
resolveActiveStudioSlice([workflow])  = ok:false · no_active_slice_resolved · candidates 0
unknown  = ['.github/workflows/foundation-governance.yml']
blockers = ['no_active_slice_resolved','unknown_scope']
```

As seções `T` dos consumidores afirmam `deepEqual(scope.unknown, [])`, e por isso falharam.

Duas suposições implícitas ficaram expostas:

1. "todo diff não vazio resolve exatamente uma fatia ativa";
2. "`empty_branch_diff` é a única forma de inaplicabilidade".

Ambas são falsas para uma branch que não toca o território Studio.

## Erro metodológico da tentativa anterior, declarado

A bateria local da primeira tentativa rodou **antes** do commit. Naquele momento
`git diff origin/main...HEAD` era vazio, os testes tomaram o caminho `empty_branch_diff` e
reportaram 23375/23375. O verde era verdadeiro para o estado em que rodou, mas não
exercitou a condição que o CI exercitou. A ordem correta — e a adotada nesta fatia — é
commitar primeiro e só então medir contra o diff real.

## Por que a correção virou uma fatia

Uma tentativa experimental alterou o guard sem fatia dedicada e foi **revertida**. O motivo
é estrutural: o guard e os testes de governança são caminhos **governados**. Assim que
entram no diff, a branch deixa de ser non-Studio e passa a exigir marcador de fatia. Sem
marcador, `no_active_slice_resolved` — a PR de infraestrutura reprovaria a si mesma.

Portanto toda alteração do guard é, por construção do próprio sistema, uma fatia numerada
com evidência própria. É o que as fatias 42, 43, 44 e 45 sempre foram. Esta é a 46.

## Consequência para P1-01

**P1-01 continua aberto.** O enforcement de CI foi revertido nesta PR e volta numa PR
posterior, pequena, contendo apenas os dois steps — que, com esta fatia mergeada, será
genuinamente non-Studio e passará pela nova regra.
