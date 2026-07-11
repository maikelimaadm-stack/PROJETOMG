# Fuel UI View Model

`createModeloBase2FuelUiViewModel({ draft, readState, diagnostics, timeline })` — puro, React-free.

## Título / subtítulo

- `title`: "Lançamento de Combustível"
- `subtitle`: "Sandbox beta local — offline-first, sem backend"

## Form fields

`date`, `machineName`, `operatorName`, `fuelType`, `quantityLiters`, `hourmeter`,
`serviceDescription`, `location`, `notes` (com `label`, `type`, `required`).

## Table columns

`date`, `machineName`, `quantityLiters`, `hourmeter`, `operatorName`, `serviceDescription`,
`status`. `rows` derivadas das entries (cada `entry.values`).

## Summary cards

`totalEntries`, `totalLiters`, `machinesCount`, `operatorsCount`, `status`.

## Badges

- `localOnly` → "Local beta"
- `offlineFirst` → "Offline-first beta"
- `notSynced` → "Não sincronizado"
- `sentFalse` → "sent:false"
- `persistenceRealFalse` → "persistenceReal:false"

## Timeline

`{ events: [{ eventId, eventType, sequence, createdAt }] }` — dos eventos fuel locais.

## Diagnostics

Passado por props (sandbox diagnostics). `localOnly:true`, `sent:false`, `persistenceReal:false`.

## emptyState

Mensagem quando não há lançamentos ainda.
