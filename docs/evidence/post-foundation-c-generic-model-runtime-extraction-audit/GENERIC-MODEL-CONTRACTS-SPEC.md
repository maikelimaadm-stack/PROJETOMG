# GENERIC MODEL CONTRACTS SPEC

Especificação (SEM implementação) dos contratos genéricos a extrair. Baseada no que já foi provado no ModeloBase1. Invariantes globais aplicam a todos: **localOnly por padrão**, **sem backend/Prisma/fetch/storage real sem capability gate explícito**, **cópias seguras**, **fail-closed**, **determinismo**.

## GenericModelReadModel

Descreve a leitura de um modelo (read-only por padrão).

| Campo | Tipo | Regras |
|---|---|---|
| `modelId` | string | identidade do modelo (ex: `modelobase1`) |
| `moduleId` | string | identidade do módulo consumidor (ex: `empresas`) |
| `modelType` | enum | `cadastro`\|`operacional`\|`movimentacao`\|`financeiro`\|`relatorio`\|`workflow` |
| `source` | string | ex: `runtime-v2-beta`, `controlled-dev-dataset` |
| `table` | `{ columns, visibleColumns, rows, rowCount }` | rows renderizáveis; ids estáveis |
| `form` | `{ fields, visibleFields, permissionsApplied }` | fields com id/permission/validation |
| `actions` | array | metadados; **não executáveis** por padrão |
| `permissions` | array | por field/action |
| `validations` | array | regras por field |
| `diagnostics` | object | shapes/flags, sem dados sensíveis |
| `safety` | object | `readOnly`, `usesRealData:false`, `noSideEffects:true` |
| `fallback` | object | estado legado quando inválido/off |

**Bloqueios:** funções/handlers/React elements no payload; dados sensíveis não mascarados; referência a backend/fetch/Prisma/storage; `usesRealData:true`.

## GenericModelWriteContract

| Campo | Regras |
|---|---|
| `allowedOperations` | createRow/updateRow/deleteRow/saveDraft/submitDraft (local) |
| `blockedOperations` | backend*/prisma*/fetchWrite/persistStorage/executeAction/startWorkflow/invokeConnector/mutateRuntimeBridge/mutateGlobalRuntime/replaceProductionUi |
| `payloadValidation` | fail-closed (fn/handler/React/pollution/sensível/target) |
| `localOnly` | true (default) |
| `backendAllowed` | false (default; só via capability gate futuro) |
| `persistenceMode` | `none`\|`local_validation`\|`local`\|(futuro) `remote` |
| `diagnostics` | backend/prisma/runtimeBridge Touched:false |

## GenericModelLocalWriteController

Controller in-memory sobre cópia segura do read state. Nunca muta o original.

- `createRow(payload)` → id local determinístico
- `updateRow(id, payload)` → merge
- `deleteRow(id)` → soft delete
- `saveDraft()` → localOnly
- `submitDraft()` → simulatedSubmit, `sent:false`
- `resetDraft()` → recria do read state original
- `inspectLocalDraft()` → cópia segura

**Invariante:** todo resultado `{ ok, localOnly:true, backendTouched:false, prismaTouched:false, runtimeBridgeTouched:false }`.

## GenericModelPersistenceContract

| Operação | Regras |
|---|---|
| `serializeDraft` | snapshot plano + version/schemaVersion/source/localOnly/persistenceReal:false + checksum; strip fn/React; mask sensível; bloqueia pollution |
| `validateSnapshot` | fail-closed (moduleId mismatch/fn/pollution/target/checksum) |
| `rehydrateDraft` | valida antes; não muta snapshot; rejeita inválido |
| `adapter` | in-memory/injetável (save/load/list/delete/clear/diagnostics) |
| `storageMode` | `memory_validation`\|`injected_adapter_validation`; nunca storage real sem gate |
| `versioning` | determinístico (clock injetável, sem `Date.now`) |
| `checksum` | FNV-1a determinístico (não-crypto) |
| `rollback` | flag off / clear / rehydrate original |

## GenericModelAdapter

Ponte modelo-específico ↔ kernel. Um por modelo (ModeloBase1, modeloBase2, ...).

- `modelType` — tipo do modelo
- `canHandle(config)` — se este adapter atende o config
- `mapReadModelToUi(readModel)` — read model → shape de UI do modelo
- `mapUiEventToMutation(event)` — evento de UI → operação do controller
- `mapDraftToSnapshot(draft)` — draft → entrada de serialização
- `mapSnapshotToDraft(snapshot)` — snapshot → draft de UI
- `diagnostics()` — diagnostics do adapter

## GenericModelSafetyPolicy

Política declarativa de capacidades (default seguro).

- `backend: 'blocked'` por padrão
- `prisma: 'blocked'` por padrão
- `runtimeBridge: 'blocked'` por padrão
- `sideEffects: 'blocked'` (action/workflow/connector) por padrão
- `capabilityGates` — habilitação explícita e auditável (flag + gate + evidência) por capacidade
- **Invariante:** nenhuma capacidade perigosa liga por default; toda habilitação é opt-in, fail-closed em produção.

## GenericModelDiagnostics

- `modelId`, `moduleId`, flags, `localOnly`, `persistenceReal`, `backend/prisma/runtimeBridge Touched`, counts, `warnings`, `blockers`, `noSideEffects`, `nextAllowedStep`. Nunca expõe dados sensíveis.

## GenericModelFallback

- `createFallbackState({ modelId, moduleId, reason })` → estado neutro/seguro que preserva a renderização legada. `betaApplied:false`, `writeBlocked:false`, `usesLegacyConfig:true`, `reversible:true`.

## GenericModelSnapshot

- `{ kind, snapshotId, modelId, moduleId, version, schemaVersion, source, localOnly:true, persistenceReal:false, rows, form, metadata, diagnostics, checksum }`. Puro/serializável; sem funções/React; sensível mascarado.
