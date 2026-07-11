# Gate Report — G423-EMPRESAS-CADCPS-GENERIC-KERNEL

**Gate:** `scripts/gates/g423-empresas-cadcps-consuming-generic-kernel.mjs`
**Script:** `npm run gate:g423-empresas-cadcps-generic-kernel`
**Resultado:** **26/26 PASS**

## Checks

| # | Check | Tipo |
|---|---|---|
| 1–8 | Arquivos esperados existem (7 de `activation/` + o teste) | estrutural |
| 9 | flags: off = fluxo atual; on+beta = consumo; consumo exige beta | dinâmico |
| 10 | produção fail-closed salvo `*_ALLOW_PROD` | dinâmico |
| 11 | apply OFF: fluxo ModeloBase1 verbatim (sem anotação do kernel) | dinâmico |
| 12 | apply ON+beta: `runtimeReadModel` passa pelo adapter (shape + fields preservados; local-only) | dinâmico |
| 13 | read model inválido → fallback (`generic-validation-failed`) | dinâmico |
| 14 | falha do adapter → fallback (read state original preservado) | dinâmico |
| 15 | diagnostics: backend/Prisma/runtimeBridge Touched false; persistenceReal false; reversible | dinâmico |
| 16 | fallback preserva read state original + rollback plan passivo | dinâmico |
| 17 | capacidades perigosas do adapter permanecem false; persistenceReal false | dinâmico |
| 18 | activation estruturalmente isolada (kernel/adapter + siblings; React só em hooks; sem backend/Prisma/runtimeBridge/modules/fetch/storage) | **import-scan** |
| 19 | activation consome o adapter ModeloBase1 → generic kernel (aditivo) | import-scan |
| 20 | sem import de CSS global | estrutural |
| 21 | ModeloBase1 não reescrito (só `generic-model-adapter/` tocado) | git-diff (tolerante) |
| 22 | Empresas/cadcps (src/modules) não alterados | git-diff (tolerante) |
| 23 | `src/App.jsx` não alterado | git-diff (tolerante) |
| 24 | backend/Prisma/framework/Studio/BOS/makBootstrap/SSOT intocados | git-diff (tolerante) |
| 25 | sem dependência nova | package.json diff |
| 26 | testes unitários do slice PASS | `node --test` |

> Numeração acima agrupa os 8 checks de existência (1–8) em uma linha; o gate imprime 26 linhas.

## Robustez cross-slice

O check estrutural de isolamento usa **import-scan recursivo** (não git-diff branch-relativo),
permanecendo verde quando slices futuros adicionarem arquivos à pasta `activation/`.

Este slice também endureceu o gate do slice anterior
(`g423-modelobase1-adapter-to-generic-kernel.mjs`, check 16) para import-scan estrutural, de modo
que ele continua **28/28** com a nova subpasta `activation/` presente.

## Gates relacionados (cross-slice, todos verdes)

| Gate | Resultado |
|---|---|
| `gate:g423-empresas-cadcps-generic-kernel` | 26/26 |
| `gate:g423-modelobase1-generic-adapter` | 28/28 |
| `gate:g423-generic-model-contracts-foundation` | 39/39 |
| `gate:g423` (master Foundation C) | 7/7 |
