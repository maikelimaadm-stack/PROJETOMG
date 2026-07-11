# Fuel Domain Schema

`createModeloBase2FuelDomainSchema()` — domínio mínimo headless. Puro.

## Campos

| campo | tipo | obrigatório | default |
|---|---|---|---|
| `fuelEntryId` | string | não | — |
| `date` | string | **sim** | — |
| `machineId` | string | não* | — |
| `machineName` | string | não* | — |
| `operatorId` | string | não | — |
| `operatorName` | string | não | — |
| `fuelType` | string | não | `diesel` |
| `quantityLiters` | number | **sim (>0)** | — |
| `hourmeter` | number | não (>=0 se informado) | — |
| `serviceDescription` | string | não | — |
| `location` | string | não | — |
| `notes` | string | não | — |
| `status` | string | não | `draft` |

\* `machineId` **ou** `machineName` é obrigatório.

## Validações (`validateEntry`)

- `date` obrigatório (string não vazia).
- `machineId` **ou** `machineName` obrigatório.
- `quantityLiters` número finito **> 0**.
- `hourmeter`, se informado, número finito **>= 0**.
- operador ausente → **warning** (não bloqueia).

## Status

`draft`, `valid`, `invalid`, `saved_local`, `submitted_simulated`, `removed`.

## Defaults (`normalizeEntry`)

`fuelType='diesel'`, `status='draft'`, `localOnly=true`, `sent=false`, `persistenceReal=false`.
Campos ausentes viram `null`; tipos inesperados são coeridos com segurança.

## Regras fora de escopo (documentado)

- cálculo financeiro
- estoque / tanque
- integração com máquina real (device)
- sincronização
