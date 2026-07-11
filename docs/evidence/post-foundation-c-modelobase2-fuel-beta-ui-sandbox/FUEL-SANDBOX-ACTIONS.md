# Fuel Sandbox Actions

`createModeloBase2FuelSandboxActions({ moduleId })` — puro, React-free. Fail-closed.

## Actions → comando headless

| action | comando fuel |
|---|---|
| `newDraft` | `createFuelDraft` |
| `addFuelEntry` | `appendFuelEntry` |
| `editFuelEntry` | `updateFuelEntry` |
| `removeFuelEntry` | `removeFuelEntry` |
| `validate` | `validateFuelDraft` |
| `saveLocal` | `saveFuelDraft` |
| `submitSimulated` | `submitFuelDraft` |
| `snapshot` | `createFuelSnapshot` |
| `restore` | `restoreFuelSnapshot` |
| `reset` | `resetFuelDraft` |
| `inspectDiagnostics` | `inspectFuelDiagnostics` |

`resolveAction(actionType, payload)` → `{ ok, action, fuelCommandType, payload, localOnly, sent,
persistenceReal, errors }`. Action desconhecida → `ok:false` (fail-closed).

## localOnly / sent:false / persistenceReal:false

Todo resultado de action carrega `localOnly:true`, `sent:false`, `persistenceReal:false`,
`backend/prisma/runtimeBridge Touched:false`.

## Blocked side effects

Nenhuma action pode chamar backend, fetch, Prisma, runtimeBridge, storage real obrigatório, ou
executar workflow/connector. O descriptor lista `blockedSideEffects`. Payloads inseguros/targets
proibidos são bloqueados pela validação do fuel-headless.
