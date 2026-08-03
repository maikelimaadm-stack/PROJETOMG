# Readiness — fatia 44 (Studio Scope Governance Historical Branch Consumers)

## Flags

```
sliceOrdinal:                          44
sliceStatus:                           active_slice
onePrPerSlice:                         true
coreApisUnchanged:                     true
activeSliceBeforeCallerStillFails:     true
consumerInapplicabilityCatalogBound:   true
catalogEntriesWithCompatibilityField:  44
catalogEntriesAuthorized:              1
catalogEntriesNotAuthorized:           43
authorizedSliceId:                     bridge-decision-core-envelope-builder
mergedSlicesAuthorized:                0
authorizationInferredFromStatus:       false
authorizationInferredFromOrdinal:      false
authorizationInjectableByCaller:       false
selfCertificationStillMandatory:       true
newBoundaryIsAdditiveOnly:             true
permissiveOptionIntroduced:            false
historicalEvidenceRewritten:           false
productionRuntimeTouched:              false
builderImplemented:                    false
dependenciesAdded:                     false
pr495Touched:                          false
pr495BranchCheckedOut:                 false
mainMergedIntoPr495:                   false
prMarkedReady:                         false
prMerged:                              false
checkInScheduled:                      false
originMainMoved:                       false
gitUpdateRefUsed:                      false
syntheticWorktreeUsed:                 false
emptyDiffUsedAsProof:                  false
mainVerifiedGreen:                     false
postMergeRevalidationRequired:         true
readyToUpdatePr495WithMain:            false
legacyPreStudioGatesMigrated:          false
legacyPreStudioGatesMasked:            false
legacyPreStudioGatesRedOnThisBranch:   12
fullG423SweepFiles:                    109
fullG423SweepExitZero:                 97
```

## Varredura completa `scripts/gates/g423-*.mjs` — 109 arquivos

97 saem com exit 0. **12 saem com exit != 0**, e todos os 12 pertencem à lista
`LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED`:

```
g423-empresas-controlled-production-test-plan
g423-empresas-local-read-only-contract-pilot
g423-empresas-local-read-parity-hardening
g423-empresas-production-baseline-audit
g423-empresas-studio-compatibility-slice-1
g423-generic-model-multi-type-hardening
g423-modelobase2-fuel-beta-ui-sandbox
g423-modelobase2-fuel-dev-preview-route
g423-modelobase2-fuel-headless-candidate
g423-modelobase2-fuel-module-shell-readiness
g423-modelobase2-operational-runtime-foundation
g423-modelobase2-prototype-adapter
```

Causa medida, arquivo por arquivo: cada um carrega uma **allowlist de escopo de branch própria,
hardcoded, anterior à governança central**, que só admite diff vazio ou os próprios caminhos.
Como o diff desta branch contém caminhos de governança Studio, essas allowlists reprovam. As
falhas são exclusivamente nesses checks de escopo — nenhuma outra verificação desses gates
reprova.

Os 12 arquivos são **byte-idênticos** aos de `origin/main` (verificado por `diff` contra
`git show origin/main:<path>`): esta fatia não os alterou. Na `main`, onde o diff é vazio,
eles passam.

Isto é reportado como **condição aberta e pré-existente**, não corrigida e não mascarada. Migrar
esses 21 gates para a governança central é trabalho de uma fatia futura própria — está fora do
escopo autorizado desta.

## Bateria agregada

```
npm run test:runtime   → 21259 tests, 21259 pass, 0 fail   (main: 109 arquivos → esta branch: 110)
npm run gate:g423      → 7/7 PASS
npm run lint           → exit 0, sem saída
npm run build          → exit 0, built in ~20s
dist/                  → 0 hits para studio-scope-governance-historical-branch-consumers,
                         evaluateStudioBranchConsumerScope e historicalBranchConsumerCompatibility
```

## O que esta fatia entrega

Uma quarta API no guard, `evaluateStudioBranchConsumerScope`, que separa **certificação de
branch** de **aplicabilidade de consumidor**, e a migração dos 36 consumidores que julgam diff
de branch para essa API. O núcleo de certificação não mudou: `active_slice_before_caller`
continua reprovando exatamente onde reprovava.

Correção pós-auditoria (`B-CONSUMER-INAPPLICABILITY-NOT-CATALOG-BOUND`): a inaplicabilidade é
**vinculada ao catálogo**. Um consumidor posterior só pode se declarar inaplicável a uma branch
mais antiga quando a fatia ativa daquela branch declara `historicalBranchConsumerCompatibility:
true`. Hoje isso vale para exatamente uma fatia — a Builder da PR #495, ordinal 41. Fatias
mergeadas, inclusive 24, 42 e 43, continuam fail-closed para consumidores posteriores.

## O que esta fatia NÃO entrega

- não atualiza a PR #495;
- não declara que a #495 pode ser atualizada com a `main`;
- não migra os 21 gates pré-Studio (`LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED`);
- não autoriza nenhuma fatia além da Builder #495 a carregar consumidores posteriores;
- não mede o diff real da branch da #495 — usa uma fixture representativa, declarada como tal;
- não verifica a `main`, porque a `main` ainda não contém esta fatia.

## Condição para o próximo passo

`readyToUpdatePr495WithMain` só pode virar `true` depois de:

1. merge manual desta PR na `main` por Maike;
2. execução da revalidação pós-merge descrita em `POST-MERGE-REVALIDATION-PLAN.md`, **na `main`**,
   com todos os itens PASS.

Antes disso, qualquer declaração de prontidão seria uma afirmação sobre um estado não medido.
