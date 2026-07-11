# Fuel Command & Event Mapping

## Comandos fuel → operacionais (`createModeloBase2FuelCommandMapper`)

| comando fuel | comando operacional |
|---|---|
| `createFuelDraft` | `createDraft` |
| `appendFuelEntry` | `appendEntry` |
| `updateFuelEntry` | `updateEntry` |
| `removeFuelEntry` | `removeEntry` |
| `validateFuelDraft` | `validateDraft` |
| `saveFuelDraft` | `saveDraft` |
| `submitFuelDraft` | `submitDraft` |
| `createFuelSnapshot` | `createSnapshot` |
| `restoreFuelSnapshot` | `restoreSnapshot` |
| `resetFuelDraft` | `resetDraft` |
| `inspectFuelDiagnostics` | `inspectDiagnostics` |

Comando fuel desconhecido → **fail-closed** (`ok:false`). Cada comando mapeado preserva
`commandId`, `domain:'fuel'`, `operationType:'fuel_entry'`, `moduleId`, `modelId`, `payload`,
`localOnly:true`, `sent:false`, `persistenceReal:false`.

## Eventos operacionais → fuel (`createModeloBase2FuelEventMapper`)

| evento operacional | evento fuel |
|---|---|
| `draft.created` | `fuel.draft.created` |
| `entry.added` | `fuel.entry.added` |
| `entry.updated` | `fuel.entry.updated` |
| `entry.removed` | `fuel.entry.removed` |
| `draft.validated` | `fuel.draft.validated` |
| `draft.saved` | `fuel.draft.saved` |
| `draft.submitted.simulated` | `fuel.draft.submitted.simulated` |
| `snapshot.created` | `fuel.snapshot.created` |
| `snapshot.restored` | `fuel.snapshot.restored` |
| `draft.reset` | `fuel.draft.reset` |
| `command.blocked` | `fuel.command.blocked` |
| `fallback.applied` | `fuel.fallback.applied` |

Evento fuel: `{ fuelEventId, eventType, operationalEventType, sequence, fuelEntryId?, payload,
localOnly:true, sent:false, backend/prisma/runtimeBridge Touched:false, checksum, diagnostics }`.
Checksum FNV-1a determinístico sobre o conteúdo.

## Payload validation (`validateModeloBase2FuelPayload`, fail-closed)

Bloqueia: comando desconhecido; payload não-objeto quando presente; função/handler/elemento React/
prototype pollution; target proibido (backend/prisma/runtimebridge/fetch/api/storage/database/db);
`writeMode` ≠ localOnly; `persistenceReal:true`; `sent:true`. Para `appendFuelEntry`/`updateFuelEntry`,
valida a fuel entry contra o domínio e retorna a `normalizedFuelEntry`.

## localOnly / sent:false

Todo comando, evento e resultado carrega `localOnly:true`, `sent:false`,
`backend/prisma/runtimeBridge Touched:false`, `persistenceReal:false`.
