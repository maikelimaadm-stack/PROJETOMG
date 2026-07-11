# Read State & Snapshot Bridge

## Read state derivado

`createModeloBase2OperationalReadState({ moduleId, draft, eventLog, status })` — deriva o read state
a partir de draft + event log + status, reutilizando o read model do prototype. Puro: **não muta**
draft/event log.

- **entries** — central (do draft)
- **summary** — `{ totalEntries, pendingEntries, invalidEntries, lastEntryAt }`
- **timeline** — `{ events[], lastEventId, sequence }` (do event log)
- **table/form** — secundários, para compatibilidade `GenericModelReadModel` (rows espelham entries)
- **status**, **diagnostics** (`status`/`eventsCount`/`entriesCount`)
- `derivedFrom: { draft:true, eventLog:true, stateMachine:true }`

Validável por `validateGenericModelReadModel` (via o read model do prototype).

## Snapshot bridge

`createModeloBase2OperationalSnapshotBridge({ moduleId, adapter, clock })`:

- `createSnapshotFromSession(session)` — monta um draft (draft + entries + events) e gera
  `GenericModelSnapshot` (`modelType:'operacional'`).
- `validateSnapshot(snapshot)` — checksum **fail-closed** (data adulterada → inválido).
- `restoreSessionFromSnapshot(snapshot)` — reconstrói um estado de sessão (draft/entries/events)
  **sem mutar** o snapshot original.
- `roundtripSnapshot(session)` — save → load via `createGenericModelInMemoryAdapter`
  (`storageMode: 'memory_validation'`); `ok:true`, `persistenceReal:false`, `backendTouched:false`.
- `clearSnapshots()`.

### Regras

- `localOnly:true`, `persistenceReal:false`.
- `storageMode: memory_validation` — sem storage real obrigatório.
- restore **não muta** o snapshot original.
- checksum fail-closed.
- `moduleId`/`modelId` coerentes.

## persistenceReal false

Garantido em read state, snapshot, restore e roundtrip. Nada é escrito em backend/Prisma/storage.
