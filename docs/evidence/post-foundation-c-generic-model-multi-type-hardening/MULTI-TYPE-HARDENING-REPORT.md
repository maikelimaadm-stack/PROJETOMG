# Multi-Type Hardening Report

## Objetivo

Provar formalmente que o Generic Model Runtime serve **múltiplos tipos de modelo** e que
ModeloBase1 (cadastro) e ModeloBase2 (operacional) coexistem sobre o mesmo kernel **sem acoplamento
indevido**.

## O que foi implementado

1. **Model Type Registry** — definições canônicas dos 8 modelTypes, validadas e registráveis.
2. **Capability Matrix** — capacidades por tipo, com dangerous capabilities false em todos.
3. **Conformance Suite** — validação de adapter por tipo + suite MB1+MB2 com invariantes comuns.
4. **Multi-Type Diagnostics** — resumo de readiness e status dos invariantes.

## Registry

`createGenericModelTypeRegistry()` valida cada definição via
`validateGenericModelTypeDefinition` (fail-closed) e expõe `get/has/list/register`. Cada definição
declara `requiredContracts`, `optionalContracts`, `allowedCapabilities`, `dangerousCapabilities`,
`defaultSafety`, `expectedReadShape`, `expectedWriteShape`, `persistencePolicy`, `sideEffectPolicy`,
`futureAdapters`. `cadastro`→`modeloBase1`; `operacional`→`modeloBase2`; demais são definições
futuras sem adapter real.

## Capability Matrix

`createGenericModelCapabilityMatrix()` consolida 12 capacidades por tipo. `validateGenericModelCapabilities`
bloqueia (fail-closed): `backendWrite`/`connector`/`marketplacePublish`/`workflowState`/`transaction`
true sem `explicitAllowDangerous`; `persistenceReal: true`; e targets estrangeiros
(fetch/prisma/runtimeBridge com nome fora do vocabulário de capacidade). `dangerousAllFalse === true`.

## Conformance Suite

`validateGenericModelAdapterConformance` verifica presença tolerante de contratos (o adapter pode
expor um contrato diretamente ou via `runtimeContract`/bridge), capacidades perigosas false,
`localOnly`/`persistenceReal`/`sent` corretos, e ausência de targets proibidos **introduzidos pelo
próprio descriptor** (os contratos confiáveis do kernel — safetyPolicy/capabilities — são
excluídos do scan, pois nomeiam o vocabulário de segurança legitimamente).

`createGenericModelMultiTypeConformanceSuite` recebe adapters **injetados** (o generic runtime nunca
importa MB1/MB2), valida cada um, e consolida `sharedInvariants` + `allowedDifferences`.

## Diagnostics

`createGenericModelMultiTypeDiagnostics` deriva `readiness` (`ready`/`partial`/`blocked`/
`needs_fixes`/`skipped`) e reporta status de conformance/matrix/dangerous/shared-invariants, com
`backend/prisma/runtimeBridge Touched` false e `persistenceReal` false.

## O que ficou fora de escopo

- Nenhuma UI/rota/menu; nenhum módulo real; nenhum backend/Prisma/runtimeBridge.
- Transação, workflowState e backendWrite permanecem **false** (futuro, com allow explícito).
- ModeloBase2 continua headless (não virou módulo real).

## Próximo passo recomendado

**ModeloBase2 Operational Runtime Foundation.**
