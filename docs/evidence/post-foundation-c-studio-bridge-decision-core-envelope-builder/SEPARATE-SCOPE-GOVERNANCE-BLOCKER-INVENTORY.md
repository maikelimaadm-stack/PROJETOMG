# Separate scope-governance blocker inventory

Inventário medido na branch REAL, no mesmo worktree, sem mover refs e sem diff vazio.

- `HEAD` = `bb1a65a3bf0e5460ce066b9fea6413f0a6aa4c77`
- `origin/main` = `73d298e09fea349f9bc836555360d6adcb74655c`
- `merge-base` = `73d298e09fea349f9bc836555360d6adcb74655c`
- caminhos em `git diff --name-only origin/main...HEAD` fora de `docs/evidence/…/` e `package.json`:
  - `scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs`
  - `scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs`
  - `scripts/gates/lib/studioScopeGovernanceRegistry.mjs`
  - `src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js`
  - `src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js`
  - `src/studio/blueprint-engine/bridge-decision-core-envelope-builder/**`

Nenhum dos 11 artefatos históricos restaurados aparece no diff. Nenhum teste/gate histórico foi modificado para forçar verde.

## Causa raiz única

Todos os itens abaixo falham pelo MESMO motivo: um check de escopo branch-relative escrito antes do registry central, que compara `git diff --name-only origin/main...HEAD` contra uma allowlist hardcoded da própria fatia. Qualquer fatia Studio posterior — inclusive esta — aparece como "fora de escopo" ou como "prior gate/test alterado". Nenhum deles falha por conteúdo, contrato, digest, identidade, segurança ou runtime.

Em `main` esses checks ficam verdes porque o diff é vazio. Diff vazio NÃO é usado aqui como prova.

## A — ACTIVE_AGGREGATE_BLOCKER (9)

Cenários que pertencem ao `npm run test:runtime` oficial e portanto bloqueiam o agregado.

| # | comando | arquivo | assert/check | changed path que dispara | test:runtime? | gate:g423 oficial? | standalone? |
|---|---|---|---|---|---|---|---|
| 1 | `npm run test:runtime` | `src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-contract.test.js:738` | `590. no prior gate/test altered` | `scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs` · `src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js` | sim | não | não |
| 2 | `npm run test:runtime` | `…studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js:752` | `620. no prior gate/test altered` | idem | sim | não | não |
| 3 | `npm run test:runtime` | `…studio-authoring-runtime-to-preview-bridge.test.js:623` | `569. no prior gate/test altered` | idem | sim | não | não |
| 4 | `npm run test:runtime` | `…studio-dev-preview-app-integration-contract.test.js:541` | `404. no prior gate/test altered` | idem | sim | não | não |
| 5 | `npm run test:runtime` | `…studio-dev-preview-app-integration-implementation-plan.test.js:560` | `422. no prior gate/test altered` | idem | sim | não | não |
| 6 | `npm run test:runtime` | `…studio-dev-preview-app-integration.test.js:512` | `397. no prior gate/test altered` | idem | sim | não | não |
| 7 | `npm run test:runtime` | `…studio-module-blueprint-authoring-foundation-contract.test.js:625` | `458. no prior gate/test altered` | idem | sim | não | não |
| 8 | `npm run test:runtime` | `…studio-module-blueprint-authoring-implementation-plan.test.js:622` | `484. no prior gate/test altered` | idem | sim | não | não |
| 9 | `npm run test:runtime` | `…studio-module-blueprint-authoring-runtime.test.js:794` | `649. no prior gate/test altered` | idem | sim | não | não |

`npm run test:runtime` = **21472 / 21481 pass, 9 fail** — reportado FAIL, não PASS.

Correção recomendada para a fatia separada: dar a cada check a IDENTIDADE CRONOLÓGICA da fatia chamadora (posição na ordem do programa), e tolerar apenas artefatos comprovadamente POSTERIORES a ela — em vez do registry global/flat atual, que não recebe essa identidade e por isso não prova posterioridade.

## B — ACTIVE_GATE_BLOCKER (0)

O gate oficial `npm run gate:g423` está **PASS 7/7**. Nenhum blocker ativo nele.

## C — LEGACY_STANDALONE_SCOPE_CHECK (43 gates)

Gates do inventário `gate:g423*` que NÃO fazem parte do `gate:g423` oficial. Todos falham apenas no check de escopo branch-relative (e, quando o gate roda o próprio teste como subprocesso, no eco desse mesmo teste).

### C.1 — pré-Studio (21), allowlist própria não ligada ao registry

| gate | checks | falha |
|---|---|---|
| `g423-modelobase1-direct-beta` | 23/25 | authorized scope only · Studio untouched |
| `g423-modelobase1-runtime-wiring` | 21/23 | authorized scope only · Studio untouched |
| `g423-modelobase1-beta-ui-hardening` | 19/21 | authorized scope only · Studio untouched |
| `g423-modelobase1-local-write-plan` | 22/24 | authorized scope only · Studio untouched |
| `g423-modelobase1-local-write-activation` | 18/20 | authorized scope only · Studio untouched |
| `g423-modelobase1-local-persistence-validation` | 25/27 | authorized scope only · Studio untouched |
| `g423-generic-model-contracts-foundation` | 38/39 | Studio untouched |
| `g423-modelobase1-generic-adapter` | 27/28 | Studio untouched |
| `g423-empresas-cadcps-generic-kernel` | 26/27 | Studio untouched |
| `g423-modelobase2-prototype-adapter` | 29/31 | authorized scope only · Studio untouched |
| `g423-generic-model-multi-type-hardening` | 25/27 | authorized scope only · Studio untouched |
| `g423-modelobase2-operational-runtime` | 30/32 | authorized scope only · Studio untouched |
| `g423-modelobase2-fuel-headless` | 32/34 | authorized scope only · Studio untouched |
| `g423-modelobase2-fuel-ui-sandbox` | 32/34 | authorized scope only · Studio untouched |
| `g423-modelobase2-fuel-dev-preview-route` | 27/29 | authorized scope only · Studio untouched |
| `g423-modelobase2-fuel-module-shell-readiness` | 40/42 | authorized scope only · Studio untouched |
| `g423-empresas-production-baseline-audit` | 19/21 | forbidden areas · authorized scope only |
| `g423-empresas-controlled-production-test-plan` | 25/27 | forbidden areas · authorized scope only |
| `g423-empresas-local-read-only-contract-pilot` | 31/33 | production untouched · authorized scope only |
| `g423-empresas-local-read-parity-hardening` | 30/32 | production untouched · authorized scope only |
| `g423-empresas-studio-compatibility-slice-1` | 60/62 | other Studio untouched · authorized scope only |

Nota: esses gates classificam `src/studio/**` inteiro como área proibida para si. Isso é correto para a fatia deles, mas não recebe a identidade cronológica da fatia chamadora, então dispara para qualquer branch Studio.

### C.2 — Studio anteriores (22), check `prior gates/tests NOT altered`

| gate | checks | falha primária | falhas em eco (subprocesso do próprio teste) |
|---|---|---|---|
| `g423-studio-foundation-audit` | 30/32 | authorized scope only | — |
| `g423-studio-module-preview-sandbox-contract` | 72/74 | authorized scope only · prior gates altered | — |
| `g423-studio-dev-preview-contract-bridge` | 87/88 | prior gates/tests altered | — |
| `g423-studio-dev-preview-visual-contract` | 85/86 | prior gates/tests altered | — |
| `g423-studio-dev-preview-runtime-shell-contract` | 89/90 | prior gates/tests altered | — |
| `g423-studio-dev-preview-isolated-runtime-implementation-plan` | 96/97 | prior gates/tests altered | — |
| `g423-studio-dev-preview-isolated-runtime` | 105/106 | prior gates/tests altered | — |
| `g423-studio-dev-preview-runtime-ui-contract` | 105/106 | prior gates/tests altered | — |
| `g423-studio-dev-preview-runtime-ui-implementation-plan` | 117/118 | prior gates/tests altered | — |
| `g423-studio-dev-preview-runtime-ui` | 126/127 | prior gates/tests altered | — |
| `g423-studio-dev-preview-route-menu-contract` | 124/125 | prior gates/tests altered | — |
| `g423-studio-dev-preview-route-menu-implementation-plan` | 132/133 | prior gates/tests altered | — |
| `g423-studio-dev-preview-route-menu` | 150/151 | prior gates/tests altered | — |
| `g423-studio-dev-preview-app-integration-contract` | 133/136 | prior gates/tests altered | unit tests PASS · ≥410 scenarios |
| `g423-studio-dev-preview-app-integration-implementation-plan` | 145/148 | prior gates/tests altered | unit tests PASS · ≥430 scenarios |
| `g423-studio-dev-preview-app-integration` | 161/164 | prior gates/tests altered | unit tests PASS · ≥470 scenarios |
| `g423-studio-module-blueprint-authoring-foundation-contract` | 164/167 | prior gates/tests altered | unit tests PASS · ≥450 scenarios |
| `g423-studio-module-blueprint-authoring-implementation-plan` | 203/206 | prior gates/tests altered | unit tests PASS · ≥480 scenarios |
| `g423-studio-module-blueprint-authoring-runtime` | 226/229 | prior gates/tests altered | unit tests PASS · ≥650 scenarios |
| `g423-studio-authoring-runtime-to-preview-bridge-contract` | 196/199 | prior gates/tests altered | unit tests PASS · ≥520 scenarios |
| `g423-studio-authoring-runtime-to-preview-bridge-implementation-plan` | 239/242 | prior gates/tests altered | unit tests PASS · ≥560 scenarios |
| `g423-studio-authoring-runtime-to-preview-bridge` | 238/241 | prior gates/tests altered | unit tests PASS · ≥700 scenarios |

As colunas "eco" são consequência direta do grupo A: o gate roda `node --test <seu teste>`, o teste falha no MESMO check de escopo, o subprocesso sai != 0 e o gate reporta `0 scenarios`. Corrigir o grupo A apaga automaticamente todas essas linhas de eco.

## D — NOT_REPRODUCED (0)

Nenhuma falha reportada anteriormente deixou de se reproduzir nesta medição.

## Correção recomendada (fatia separada, NÃO nesta PR)

1. Dar identidade cronológica ao guard: `classifyStudioScopePath(path, { callerSliceOrdinal })`, tolerando apenas artefatos com ordinal estritamente MAIOR que o da fatia chamadora.
2. Registrar cada fatia com seu ordinal no registry, mantendo regexes ancoradas, sem wildcard, newest-first.
3. Migrar os 22 gates Studio e os 9 testes do grupo A para consumir esse guard com ordinal.
4. Para os 21 gates pré-Studio, decidir explicitamente: ou recebem o mesmo guard, ou passam a declarar `src/studio/**` como fora do universo avaliado por eles.
5. Rodar a bateria completa numa branch Studio real — nunca com diff vazio — para provar a correção.

Enquanto isso não acontece, esta PR permanece **BLOQUEADA_PARA_MERGE**.


---

# ADENDO — Round 4/5: a dívida inventariada aqui foi resolvida

Este inventário foi escrito quando a causa raiz — checks de escopo branch-relative sem identidade
cronológica — ainda estava aberta. Ela foi resolvida, fora desta PR, pela sequência de fatias de
governança 42, 43 e 44, todas mergeadas na `main`:

```
42  studio-scope-governance-chronological-migration   ordinais no registry, guard cronológico
43  studio-scope-governance-main-diff-correction      fronteira de diff, autorizador central único
44  studio-scope-governance-historical-branch-consumers
                                                      aplicabilidade de consumidor + autorização
                                                      de compatibilidade histórica no catálogo
```

A `main` foi então incorporada nesta branch por merge (`377ca48f`). Os números medidos ANTES,
registrados acima, foram superados:

| item | antes (este inventário) | agora, nesta branch |
|---|---|---|
| `npm run test:runtime` | 21472 / 21481 — **9 fail** | **23112 / 23112 — 0 fail** |
| `npm run gate:g423` | 7/7 | 7/7 |
| gates Studio vermelhos no sweep | 22 | **0** |
| `ACTIVE_AGGREGATE_BLOCKER` | 9 | **0** |

Restou, e foi corrigido nesta PR, um defeito **novo**, próprio da integração:

```
B-GOVERNANCE-SELF-SCOPE-ASSERTIONS-UNGUARDED-ON-FOREIGN-BRANCH
```

Detalhamento completo em
[`ROUND-4-MAIN-INTEGRATION-AND-GOVERNANCE-CONSUMER-CORRECTION.md`](./ROUND-4-MAIN-INTEGRATION-AND-GOVERNANCE-CONSUMER-CORRECTION.md).

## Estado desta PR

O status **BLOQUEADA_PARA_MERGE** registrado na seção anterior era consequência dos 9 blockers
agregados. Eles não existem mais. O estado atual é:

```
AWAITING_FINAL_INDEPENDENT_AUDIT
```

A PR permanece OPEN + DRAFT, sem merge e sem ready, aguardando auditoria independente. A limpeza
pós-merge (`historicalBranchConsumerCompatibility` do Builder de volta a `false`, normalização de
status do catálogo) continua obrigatória e não foi executada.
