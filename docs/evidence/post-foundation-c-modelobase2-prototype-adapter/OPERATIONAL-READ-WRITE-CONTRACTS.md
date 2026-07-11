# Operational Read / Write Contracts

## Read model operacional

`createModeloBase2OperationalReadModel({ moduleId, operationType, status, entries, events, columns, fields })`

Retorna `{ ok, readModel, validation, fallback, errors, warnings }`. O `readModel`:

- `modelId`, `moduleId`, `modelType: 'operacional'`, `source: 'modeloBase2-prototype'`
- `operationType`, `status`
- `entries[]` — o diferencial operacional
- `summary` = `{ totalEntries, pendingEntries, invalidEntries, lastEntryAt }`
- `timeline` = `{ events[], lastEventId, sequence }`
- `table`/`form` — mantidos para compatibilidade com `GenericModelReadModel` (rows espelham entries)
- `diagnostics`, `safety`, `fallback`

Validado por `validateGenericModelReadModel` (valid=true). Entry mínima:
`{ entryId, type, timestamp, actor, values, status, localOnly, validation }`.

## Write contract operacional

`createModeloBase2OperationalWriteContract({ moduleId })` sobre `createGenericModelWriteContract`.
Expõe `validateOperation(operation, payload)` (fail-closed) que **mapeia** cada operação
operacional para uma operação local genérica e valida o payload com
`validateGenericModelWritePayload`.

### Operações permitidas (local-only) → generic

| Operacional | Generic |
|---|---|
| `createOperationalDraft` | `create` |
| `updateOperationalDraft` | `update` |
| `validateOperationalDraft` | `validatePayload` |
| `appendLocalEvent` | `create` |
| `amendLocalEvent` | `update` |
| `discardLocalEvent` | `delete` |
| `saveOperationalDraft` | `saveDraft` |
| `submitOperationalDraft` | `submitDraft` |
| `resetOperationalDraft` | `resetDraft` |
| `simulateOperationalCommit` | `simulateMutation` |

### Operações bloqueadas (fail-closed)

`backendCreate`, `backendUpdate`, `backendDelete`, `backendCommit`, `prismaCreate`, `prismaUpdate`,
`prismaDelete`, `fetchWrite`, `directDatabaseWrite`, `persistStorageAutomatically`, `executeAction`,
`startWorkflow`, `invokeConnector`, `mutateRuntimeBridge`, `mutateGlobalRuntime`,
`replaceProductionUi`.

## Payload validation

Fail-closed via o kernel: operação desconhecida/bloqueada, payload não-objeto quando exigido,
função/handler/elemento React/prototype pollution, chaves sensíveis não mascaradas e targets
proibidos (`backend`/`prisma`/`runtimebridge`/`fetch`/`storage`/…) → rejeitados.

## localOnly / sent:false

Todo retorno do write contract carrega `localOnly: true`, `backendTouched/prismaTouched/
runtimeBridgeTouched: false`. Eventos e drafts carregam `sent: false`.
