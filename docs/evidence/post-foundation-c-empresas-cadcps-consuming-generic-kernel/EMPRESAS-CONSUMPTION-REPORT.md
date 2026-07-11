# Empresas Consumption Report

## Flag

`MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL` (ou o umbrella `MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION`).
Default off; fail-closed em produção salvo `MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL_ALLOW_PROD`.

## Comportamento OFF

`/CadastroEmpresas` mantém o comportamento atual/beta atual. O `apply` retorna o `readState`
ModeloBase1 **verbatim** (cópia segura), sem qualquer anotação do kernel
(`genericKernelApplied` ausente). Rota, App.jsx, backend e Prisma intocados.

## Comportamento ON (flag + `betaApplied`)

`/CadastroEmpresas` consome o `runtimeReadModel` via generic kernel through ModeloBase1:

1. `adapter.mapReadToGeneric` → `GenericModelReadModel` + `validateGenericModelReadModel`;
2. safety/fallback/diagnostics genéricos;
3. `adapter.mapGenericToRead` → state MB1-compatível;
4. merge no `readState` original;
5. apply atual do ModeloBase1.

## `genericKernelApplied`

`true` no state consumido e nos diagnostics (`readiness: 'generic-kernel'`).

## Shape table/form

Preservado: `table.columns`, `table.visibleColumns`, `table.rows`, `table.rowCount`,
`form.fields`, `form.visibleFields` mantêm a contagem e o shape esperados pelo engine. Campos
originais (`moduleId`, `writeBlocked`, `source`, `diagnostics`) são preservados no merge.

## Local write compatibility

Inalterada: o consumo não substitui o local write controller. `write bridge` continua bloqueando
targets backend/prisma/runtimeBridge; local write continua `localOnly`.

## Persistence compatibility

Inalterada: `persistence bridge` continua fazendo roundtrip de `GenericModelSnapshot` in-memory;
`persistenceReal` continua `false`.

## Fallback

Por flag off **ou** por qualquer erro no caminho genérico → fluxo atual do ModeloBase1, com o
`readState` original preservado. `dangerousCapabilities` permanecem `false`.
