# Consumption Flow Report — Empresas/cadcps through the Generic Kernel

## Entrada

`applyModeloBase1GenericKernelConsumption({ moduleId, readState, env, createAdapter? })`

- `readState`: o **state de leitura ModeloBase1 já aplicado** (o mesmo shape que a UI beta usa:
  `{ moduleId, betaApplied, writeBlocked, source, table:{columns,visibleColumns,rows,rowCount},
  form:{fields,visibleFields}, diagnostics, fallbackApplied, ... }`).
- `createAdapter`: injeção do factory do adapter (default `createModeloBase1GenericModelAdapter`),
  usada em testes para simular falhas.

## Decisão (resolve)

`resolveModeloBase1GenericKernelConsumption({ moduleId, readState, env })`:

```
consumptionRequested = flag(módulo) OR flag(umbrella)     // + fail-closed prod
betaApplied          = readState.betaApplied === true
consumptionEnabled   = consumptionRequested AND betaApplied
```

- `reason: 'consumption-flag-off'` quando a flag está desligada.
- `reason: 'beta-read-model-off'` quando a flag está ligada mas o beta não está aplicado.

## Caminho FLAG OFF (comportamento atual)

```
readState → (safeClone) → readState        // verbatim, sem anotação
consumptionApplied: false · legacyFallback: true · genericKernelApplied: (ausente)
```

O state atual do ModeloBase1 é retornado **verbatim** (cópia segura para o chamador não
mutar por referência). A UI continua no fluxo atual.

## Caminho FLAG ON + beta (consumo)

```
readState
  → adapter.mapReadToGeneric({ runtimeReadModel: readState })
      → sanitize + GenericModelReadModel + validateGenericModelReadModel
  → (generic.ok === true?)  ── não ──▶  FALLBACK (generic-validation-failed)
  → adapter.mapGenericToRead({ readModel, writeBlocked })
      → state MB1-compatível normalizado {table,form}
  → mergeConsumedState(readState, reconstructed)
      → preserva TODOS os campos originais; sobrescreve table/form normalizados;
        anota genericKernelApplied:true + genericKernelSource + invariantes seguros
consumptionApplied: true · legacyFallback: false
```

### Merge (preservação)

`mergeConsumedState` mantém o state original (`moduleId`, `writeBlocked`, `source`,
`diagnostics`, `permissionsApplied`, etc.) e só troca `table`/`form` pela forma normalizada
do kernel. Anota:

- `genericKernelApplied: true`
- `genericKernelSource: <string>`
- `localOnly: true`, `persistenceReal: false`, `backendTouched/prismaTouched/runtimeBridgeTouched: false`

## Caminho ERRO/FALHA (fallback)

Qualquer uma destas condições cai para o fluxo atual, retornando o `readState` **original**:

| Condição | `reason` |
|---|---|
| `mapReadToGeneric` retorna `ok:false` / readModel inválido | `generic-validation-failed` |
| `mapGenericToRead` retorna não-objeto | `invalid-read-model` |
| adapter sem métodos esperados / lança exceção | `adapter-failure` |

O resultado inclui um `fallback` genérico (`fallbackApplied:true`) + `rollbackPlan`
(passivo: `safety.executesRollback === false`). `consumptionApplied:false`, `legacyFallback:true`.

## Reversibilidade

- **flag off** ⇒ estado idêntico ao atual (sem `genericKernelApplied`).
- **on vs off** preservam os mesmos dados de `table.rows` e `form.fields`.
- Nenhum efeito colateral: o consumo é uma derivação pura e síncrona.
