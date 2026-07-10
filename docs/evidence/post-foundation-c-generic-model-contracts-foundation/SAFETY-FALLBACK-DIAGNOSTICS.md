# SAFETY · FALLBACK · DIAGNOSTICS

## Safety policy
`createGenericModelSafetyPolicy` — declarativa, default-safe:
- defaults: backend/prisma/runtimeBridge/sideEffects/storage = **blocked**.
- capabilities: `backendWrite`/`workflow`/`connector`/`marketplacePublish` = **false** (opt-in via capabilityGates); `read`/`localWrite`/`localPersistenceValidation` = on; `studioEditable` opt-in.
- `isGenericModelCapabilityAllowed` — fail-closed (capability desconhecida/policy inválida → negado).

## Unsafe markers (detectGenericModelUnsafeMarkers)
Detecta: função/handler, React element (`$$typeof`), prototype pollution (`__proto__`/`constructor`/`prototype`), profundidade > 8, valores sensíveis não mascarados, referências string a sinks (Prisma/fetch/storage/makBootstrap). `detectGenericModelForbiddenTargetKeys` detecta chaves-alvo (backend*/prisma*/…) excluindo o vocabulário benigno de flags (`backendTouched`, `persistenceReal`, `storageMode`, …).

## Sensitive masking
Chaves: `password|token|apiKey|secret|authorization|bearer|credential|privateKey` → `[REDACTED]`. Aplicado em `sanitizeGenericModelPayload`, snapshot e error details.

## Fallback
`createGenericModelFallback` — objeto plano: `fallbackApplied`, `fallbackReason`, `fallbackSource`, `targetSource`, `safeState`, `reversible`, diagnostics (Touched:false), `noSideEffects`.

## Rollback plan
`createGenericModelRollbackPlan` — **plano, não executor**: `rollbackAvailable`, `strategy` (flag-off/reset-draft/clear-snapshots/revert-pr), `steps`, `flags`, `resetTargets`, `safety.executesRollback:false`.

## Diagnostics
`createGenericModelDiagnostics` — `status`/`readiness` (ready/fallback/blocked/needs_fixes/skipped), counts, `backendTouched:false`/`prismaTouched:false`/`runtimeBridgeTouched:false`/`persistenceReal:false`/`localOnly:true`/`noSideEffects:true`. Nunca expõe dados sensíveis.

## Blocked capabilities
`backendWrite`, `workflow`, `connector`, `marketplacePublish` — falsas por padrão; só via gate explícito.
