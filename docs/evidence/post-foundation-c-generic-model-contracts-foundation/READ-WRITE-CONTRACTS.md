# READ · WRITE CONTRACTS

## GenericModelReadModel (validado)
Campos: `modelId`, `moduleId`, `modelType`, `source` (obrigatórios); `table`/`form`/`actions`/`permissions`/`validations`/`diagnostics` (opcionais). `validateGenericModelReadModel`:
- table/form opcionais mas coerentes (columns/rows/fields arrays quando presentes);
- sem função/handler/React/pollution/forbidden target;
- source no allow-list (warning se fora);
- modelType conhecido (warning se desconhecido);
- **inválido → retorna `fallback`** (createGenericModelFallback) para manter render seguro.

## GenericModelReadContract
`createGenericModelReadContract` — `readOnly:true`, `requiredFields`, `optionalFields`, `safeSources`, `safety.usesRealData:false`, `fallbackAvailable:true`.

## GenericModelWriteContract
`createGenericModelWriteContract` — `allowedOperations` (create/update/delete/saveDraft/submitDraft/resetDraft/validatePayload/simulateMutation), `blockedOperations` (backend*/prisma*/fetchWrite/directDatabaseWrite/persistStorageAutomatically/executeAction/startWorkflow/invokeConnector/mutateRuntimeBridge/mutateGlobalRuntime/replaceProductionUi), `localOnly:true`, `backendAllowed:false` (opt-in), `persistenceMode` (none/local_validation/local).

## GenericModelWritePayload (validado)
`validateGenericModelWritePayload` — fail-closed: operação desconhecida, payload não-plano, função/handler/React/pollution, sensível não mascarado, `target`/chave forbidden (backend/prisma/runtimeBridge/…), `writeMode` não-localOnly → `safeToApply:false`.

## Blocked operations (default)
15 operações bloqueadas por padrão — nenhuma toca backend/Prisma/fetch/storage/side-effect/runtimeBridge.

## Capabilities
Do RuntimeContract/SafetyPolicy: perigosas (`backendWrite`/`workflow`/`connector`/`marketplacePublish`) **false**; seguras (`read`/`localWrite`/`localPersistenceValidation`) on.
