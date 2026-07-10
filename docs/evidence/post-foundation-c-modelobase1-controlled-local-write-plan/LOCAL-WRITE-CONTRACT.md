# LOCAL WRITE CONTRACT

`createModeloBase1LocalWriteContract({ moduleId, enabled })` — descrição declarativa, pura, do que o plano de escrita local pode/não pode fazer. Cópia segura, sem execução.

## allowedOperations (locais/planejadas/simuladas)

- `planCreate`
- `planUpdate`
- `planDelete`
- `planSave`
- `planSubmit`
- `simulateLocalMutation`
- `inspectLocalDraft`
- `validatePayload`
- `reportDiagnostics`

## blockedOperations (fora do sandbox in-memory)

- `backendCreate` · `backendUpdate` · `backendDelete`
- `prismaCreate` · `prismaUpdate` · `prismaDelete`
- `fetchWrite`
- `persistStorage`
- `executeAction` · `startWorkflow` · `invokeConnector`
- `mutateRuntimeBridge` · `mutateGlobalRuntime`
- `replaceProductionUi`

## mutationOperations (verbos do controller)

`createRow` · `updateRow` · `deleteRow` · `saveDraft` · `submitDraft`

## requiredInputs

`moduleId` · `readState|runtimeReadModel` · `operation` · `payload`

## producedOutputs

`localDraft` · `nextReadModel` · `diagnostics`

## safety guarantees

| Campo | Valor |
|---|---|
| localOnly | true |
| backendTouched | false |
| prismaTouched | false |
| runtimeBridgeTouched | false |
| persistence | none |
| noSideEffects | true |
| dataSource | safe-copy-of-runtime-read-model |

## fallback / rollback

- **fallback:** available=true — flag off → beta read-only (sem plano).
- **rollback:** available=true — flag off / descarte do draft local (in-memory).

## future activation notes

O próximo slice (**Controlled Local Write Activation**) montará o controller na UI beta atrás de flag, permitindo edição local do draft. Ainda **sem persistência real**: `blockedOperations` permanece bloqueando backend/Prisma/fetch/storage. A persistência real só depois de gate+rollback provados numa fase posterior.
