# Fuel Read State & Snapshot

## Read state fuel (`createModeloBase2FuelReadState`)

Deriva de draft + event log (reutilizando o read state operacional) e sobrepõe o **fuel summary** +
table/form de compatibilidade. Puro; não muta o draft/event log.

### entries

Do draft operacional (cada `entry.values` é uma fuel entry).

### summary (fuel)

- `totalEntries`, `activeEntries`, `validEntries`, `invalidEntries`, `removedEntries`
- **`totalLiters`** (soma de `quantityLiters`)
- `lastEntryAt`
- **`machinesCount`** (máquinas distintas)
- **`operatorsCount`** (operadores distintos)

### timeline

Do event log operacional (`events[]`, `lastEventId`, `sequence`).

### table compatível (columns)

`date`, `machineName`, `quantityLiters`, `hourmeter`, `operatorName`, `serviceDescription`, `status`.

### form compatível (fields)

`date`, `machineId`, `machineName`, `operatorId`, `operatorName`, `fuelType`, `quantityLiters`,
`hourmeter`, `serviceDescription`, `location`, `notes`.

> Tudo headless — nenhum componente visual é criado.

## Snapshot fuel (`createModeloBase2FuelSnapshot`)

Embrulha um `GenericModelSnapshot` (via o snapshot bridge operacional) com o domínio fuel:

- `kind: 'modelobase2-fuel-snapshot'`, `domain: 'fuel'`, `operationType: 'fuel_entry'`
- `snapshot` (o generic snapshot), `snapshotId`, `checksum`
- `localOnly:true`, `sent:false`, `persistenceReal:false`

### Operações

- `validateModeloBase2FuelSnapshot` → checksum **fail-closed** (data adulterada → inválido)
- `restoreModeloBase2FuelSnapshot` → reconstrói o estado **sem mutar** o snapshot
- `roundtripModeloBase2FuelSnapshot` → save→load via `createGenericModelInMemoryAdapter`
  (`memory_validation`), `ok:true`, `persistenceReal:false`

## persistenceReal false

Garantido em read state, snapshot, restore e roundtrip. Nada é escrito em backend/Prisma/storage.
