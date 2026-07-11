# WRITE BRIDGE REPORT

## Operações ModeloBase1 → operações genéricas
`createModeloBase1GenericWriteBridge({ moduleId })` mapeia:
| ModeloBase1 | Generic |
|---|---|
| createRow | create |
| updateRow | update |
| deleteRow | delete |
| saveDraft | saveDraft |
| submitDraft | submitDraft |
| resetDraft | resetDraft |

## Payload validation
`validateOperation(mb1Op, payload)` → mapeia o verbo e valida via `validateGenericModelWritePayload` (fail-closed). Retorna `{ ok, genericOperation, validation, localOnly:true, backendTouched:false, prismaTouched:false, runtimeBridgeTouched:false }`.

## Blocked operations
O `createGenericModelWriteContract` bloqueia por padrão: backend*/prisma*/fetchWrite/directDatabaseWrite/persistStorageAutomatically/executeAction/startWorkflow/invokeConnector/mutateRuntimeBridge/mutateGlobalRuntime/replaceProductionUi. Payloads com `target` backend/prisma/runtimeBridge ou chaves-alvo → rejeitados. Operação MB1 desconhecida → fail-closed.

## localOnly
Todo resultado é `localOnly:true`, backend/prisma/runtimeBridge Touched false.

## Limitações
- O write bridge **valida**; não executa e **não substitui** o controller local do ModeloBase1 ainda. É a ponte para a futura substituição gradual do validator MB1.
