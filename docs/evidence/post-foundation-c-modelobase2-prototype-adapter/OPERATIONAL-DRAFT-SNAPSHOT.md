# Operational Draft & Snapshot

## Draft shape

`createModeloBase2OperationalDraft({ moduleId, operationType, entries, events, status, draftVersion, clock })`:

```
{ kind: 'modelobase2-operational-draft',
  draftId, modelId, moduleId, modelType: 'operacional', operationType,
  status, entries[], events[], summary,
  localOnly: true, persistenceReal: false, sent: false,
  backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false,
  diagnostics, version }
```

## Status

`draft`, `valid`, `invalid`, `submitted_simulated`, `reset` (sem status de workflow real ainda).

- `saveDraft` → `valid` (ou `invalid` se houver entry inválida)
- `submitDraft` → `submitted_simulated` (mantém `sent: false`)
- `resetDraft` → `reset` (entries esvaziadas)

## Entries

Cada entry: `{ entryId, type, timestamp, actor, values, status, localOnly, validation }`.
`appendEntry`/`updateEntry`/`removeEntry` produzem novas entries **sem mutar** o draft de entrada.

## Events

Timeline append-only anexada a cada mutation (ver OPERATIONAL-EVENT-APPEND-CONTRACT).

## Summary

`{ totalEntries, pendingEntries, invalidEntries, lastEntryAt }`, recomputado a cada mutation.

## Snapshot

`createModeloBase2OperationalSnapshot({ draft })` usa `createGenericModelSnapshot` com
`modelType: 'operacional'` e `data = { draft, entries, events, summary }`:

- `kind: 'generic-model-snapshot'`, `modelType: 'operacional'`
- `checksum` determinístico (FNV-1a); `persistenceReal: false`, `localOnly: true`
- `validateModeloBase2OperationalSnapshot` → checksum **fail-closed** (data adulterada → inválido)

## Roundtrip

`roundTripModeloBase2OperationalSnapshot({ draft })` salva e recarrega o snapshot via
`createGenericModelInMemoryAdapter` (`storageMode: 'memory_validation'`):

- `ok: true`, `persistenceReal: false`, `backendTouched: false`
- `loaded.data.entries` preservadas
- Nenhuma escrita real — apenas validação de persistência em memória.

## persistenceReal false

Garantido em draft, snapshot e roundtrip. Nada é escrito em backend/Prisma/storage.
