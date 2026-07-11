# ADAPTER REPORT

## Objetivo
Criar o primeiro adapter do ModeloBase1 para o Generic Model Runtime Kernel — fino, aditivo, reversível — sem substituir hooks/UI/engine.

## Adapter principal
`createModeloBase1GenericModelAdapter({ moduleId })` → objeto plano com:
- `adapterId`, `modelType: cadastro`, `modelFamily: modeloBase1`, `modelId: modelobase1`, `moduleId`
- `supports`: read, localWrite, localPersistenceValidation, diagnostics, fallback
- `capabilities` (do runtime contract genérico) — perigosas false
- `genericKernelVersion`, `mappings`, `limitations`, `nextSteps`
- bridges vivas: safetyBridge, diagnosticsBridge, fallbackBridge, writeBridge, persistenceBridge
- helpers: `mapReadToGeneric`, `mapGenericToRead`

## Supports / capabilities
Suporta read/localWrite/localPersistenceValidation/diagnostics/fallback. Capacidades perigosas (`backendWrite`/`workflow`/`connector`/`marketplacePublish`) permanecem **false**.

## Limitations
- Adapter **fino** — não substitui hooks/UI/engine do ModeloBase1.
- A UI continua usando o fluxo atual do ModeloBase1.
- Persistência é memory-only (`persistenceReal:false`).
- Empresas/cadcps inalterados.

## Por que não substitui o ModeloBase1 ainda
Só há 1 consumidor real. Substituir hooks/UI antes de provar paridade arrisca regressão numa cadeia de 7 slices verde. A estratégia (EXTRACTION-RISKS-AND-PLAN da auditoria) é: adapter experimental provado por teste → depois Empresas/cadcps pelo kernel atrás de flag → depois migração.

## Próximo passo recomendado
**Empresas/cadcps consuming Generic Kernel through ModeloBase1** — fazer Empresas/cadcps lerem via o kernel (através do adapter), atrás de flag, com fallback, provando paridade.
