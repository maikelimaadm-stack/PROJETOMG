# LOCAL PERSISTENCE CONTRACT

`createModeloBase1LocalPersistenceContract({ moduleId, enabled, storageMode })` — declarativo, puro, cópia segura.

## allowedOperations (validação local)
`serializeDraft` · `validateSnapshot` · `rehydrateDraft` · `compareDraftVersion` · `clearDraftSnapshot` · `inspectPersistenceDiagnostics` · `reportReadiness`

## blockedOperations
`backendPersist` · `backendCreate` · `backendUpdate` · `backendDelete` · `prismaPersist` · `prismaCreate` · `prismaUpdate` · `prismaDelete` · `fetchWrite` · `directDatabaseWrite` · `persistStorageAutomatically` · `executeAction` · `startWorkflow` · `invokeConnector` · `mutateRuntimeBridge` · `mutateGlobalRuntime` · `replaceProductionUi`

## requiredInputs
`moduleId` · `localDraft|snapshot` · `operation`

## producedOutputs
`snapshot` · `validation` · `rehydratedDraft` · `diagnostics`

## storageMode
`memory_validation` · `injected_adapter_validation` (nunca storage real; `mandatoryStorage:false`)

## safety guarantees
`localOnly:true` · `persistenceReal:false` · `backendTouched:false` · `prismaTouched:false` · `runtimeBridgeTouched:false` · `mandatoryStorage:false` · `noSideEffects:true`

## generic model readiness notes
`genericModelReady` documenta: já genérico (contract/adapter/serialization/validation/rehydration/versioning/diagnostics/localOnly-safety); ainda preso ao ModeloBase1 (paths/nomes/integração runtimeReadModel/hook-UI); alvos futuros (modeloBase2/3, módulos nativos/usuário, Studio, Marketplace); recomendação: Generic Model Runtime Extraction Audit. Ver GENERIC-MODEL-READINESS.md.
