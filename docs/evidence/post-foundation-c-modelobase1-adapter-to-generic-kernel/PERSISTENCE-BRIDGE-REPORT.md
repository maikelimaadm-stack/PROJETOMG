# PERSISTENCE BRIDGE REPORT

## GenericModelSnapshot
`createModeloBase1GenericPersistenceBridge({ moduleId }).toSnapshot(draft)` representa um draft local do ModeloBase1 (`{ table:{rows}, form }`) como um `GenericModelSnapshot` via `createGenericModelSnapshot` (sanitiza, estampa version/schemaVersion/source/localOnly/persistenceReal:false + checksum).

## Adapter genérico
Usa `createGenericModelInMemoryAdapter({ storageMode: 'memory_validation' })` — save/load/list/delete em memória. Nenhum localStorage/IndexedDB/backend/Prisma.

## Versioning / checksum
`version()` → `createGenericModelVersion` (determinístico); `checksum(value)` → `createGenericModelChecksum` (FNV-1a). `validateSnapshot` recomputa e detecta adulteração.

## Roundtrip
`roundTrip(draft)`: snapshot → `validateGenericModelSnapshot` → adapter.save → adapter.load → retorna `{ ok, snapshot, loaded, validation, storageMode, persistenceReal:false, backendTouched:false, prismaTouched:false, runtimeBridgeTouched:false }`. Prova que drafts ModeloBase1 são representáveis e round-trippáveis no kernel genérico.

## persistenceReal false
Todo resultado/adaptador/snapshot: `persistenceReal:false`, `storageMode:memory_validation`, `mandatoryStorage:false`.

## Limitações
- **Não substitui** o adapter/persistence do ModeloBase1 ainda — apenas valida representabilidade no kernel.
