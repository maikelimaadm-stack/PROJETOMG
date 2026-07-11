# Fuel Persistence Boundary

`createModeloBase2FuelModulePersistenceBoundary({ moduleId })`.

## Invariantes

- **persistenceReal:** false
- **storageMode:** `memory_validation`
- **localOnly:** true
- **sent:** false
- **backendTouched:** false
- **prismaTouched:** false
- **runtimeBridgeTouched:** false

## Allowed now

- in-memory draft
- snapshot validation
- restore validation
- diagnostics

## Blocked now

- backend write
- Prisma write
- IndexedDB required
- localStorage required
- runtimeBridge mutation
- sync
- connector
- workflow

## Futura decisão

`futureDecision.pending: true` — as opções (persistência backend controlada, persistência local
opt-in, política de sync) permanecem uma **decisão futura**, fora deste slice
(`decidedNow: false`). Nada é decidido nem ativado aqui.
