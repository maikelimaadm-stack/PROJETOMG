# SAFETY · FALLBACK · DIAGNOSTICS BRIDGE

## Safety bridge
`createModeloBase1GenericSafetyBridge({ moduleId })` — `sanitize(payload)`, `detect(payload)`, `isSafe(payload)` via kernel genérico. Bloqueia função/handler/React element/prototype pollution e alvos backend/Prisma/runtimeBridge/fetch/storage; mascara `password/token/apiKey/secret/authorization/bearer/credential/privateKey`.

## Fallback bridge
`createModeloBase1GenericFallbackBridge({ moduleId, reason })` — usa `createGenericModelFallback` + `createGenericModelRollbackPlan`. Cenários: runtime read ausente/inválido, generic read validation falha, write validation falha, snapshot validation falha, adapter failure. **Não executa rollback real** (`safety.executesRollback:false`).

## Rollback plan
Estratégia `flag-off`, flags `MAK_MODELOBASE1_EMPRESAS_BETA`/`MAK_MODELOBASE1_CADCPS_BETA`, resetTargets `local-draft`/`generic-adapter`. Plano, não executor.

## Diagnostics bridge
`createModeloBase1GenericDiagnosticsBridge({ moduleId, runtimeReadState })` — usa `createGenericModelDiagnostics` e preserva sinais MB1 (`betaApplied`, `fallbackApplied`, `writeBlocked`). Invariantes: `localOnly:true`, `persistenceReal:false`, `backendTouched:false`, `prismaTouched:false`, `runtimeBridgeTouched:false`, `readiness`.

## Dangerous capabilities false
Herdadas do runtime contract genérico: `backendWrite`/`workflow`/`connector`/`marketplacePublish` = false.
