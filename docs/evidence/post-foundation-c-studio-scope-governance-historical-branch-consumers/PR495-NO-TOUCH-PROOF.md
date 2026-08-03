# Prova de não-toque na PR #495

## O que foi proibido nesta rodada

Não tocar na PR #495; não fazer checkout da sua branch; não fazer merge nem rebase da `main`
nela; não alterar seu body; não implementar Builder; não alterar nenhum arquivo dela.

## Estado observado

```
branch da PR #495 : claude/post-foundation-c-studio-bridge-decision-core-envelope-builder
head remoto       : 9634c3643541248d4b272813161b489b85fd8692
```

O head foi lido por `git rev-parse` sobre a referência remota já presente no clone — leitura,
sem checkout, sem fetch dirigido àquela branch, sem escrita de ref. Nenhum `git update-ref`,
nenhum worktree sintético, nenhum `origin/main` movido.

## Prova pelo diff

`git diff --name-only origin/main...HEAD` = 55 caminhos. Nenhum deles casa
`bridge-decision-core-envelope-builder`. Verificado ao vivo pelo gate desta fatia
(`this branch touches no Builder artifact`) e pelo teste (`P003`), não por inspeção manual.

## Prova pelo catálogo

A entrada da fatia 41 está intacta:

```
sliceOrdinal                          41
status                                open_pull_request_495
primaryArtifactPatterns               4
crossSliceAuthorizedPatterns          2
explicitlyAuthorizedForbiddenPatterns 0
```

A única alteração na entrada da fatia 41 é o novo campo obrigatório do catálogo,
`historicalBranchConsumerCompatibility: true` — a autorização explícita que permite a esta branch,
e só a esta, carregar consumidores posteriores. Nenhum arquivo do Builder foi tocado; nenhum
padrão da entrada foi alterado; ordinal, status, primary, cross e forbidden explícito seguem
idênticos. Ver `CATALOG-BOUND-COMPATIBILITY-AUTHORIZATION.md`.

E está **fora do alcance** desta fatia — `isPathAuthorizedForStudioSlice(..., 44) === false` para:

```
src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js
src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js
scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs
docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md
```

A lista de autorização cruzada desta fatia também não casa nenhum caminho do Builder.

## Como a #495 foi exercitada sem ser tocada

Por uma **fixture determinística em memória** — cinco caminhos representativos, avaliados pelas
mesmas APIs que os consumidores usam. Ver `PR495-HISTORICAL-BRANCH-FIXTURE.md`. Nada foi lido
daquela branch, nada foi escrito nela.

## O que continua pendente

Esta fatia **não** atualiza a #495 e **não** declara que ela pode ser atualizada.
`readyToUpdatePr495WithMain: false` em `READINESS.md`. A decisão só pode ser tomada depois do
merge desta fatia na `main` e da revalidação descrita em `POST-MERGE-REVALIDATION-PLAN.md`.
