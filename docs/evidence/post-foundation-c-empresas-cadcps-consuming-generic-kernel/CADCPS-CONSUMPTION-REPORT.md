# cadcps (Campos Personalizados) Consumption Report

## Flag

`MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL` (ou o umbrella `MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION`).
Default off; fail-closed em produção salvo `MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL_ALLOW_PROD`.

## Mesmo padrão, sem arquitetura separada

cadcps consome **exatamente o mesmo** resolver/apply que Empresas
(`applyModeloBase1GenericKernelConsumption`). **Não** há caminho paralelo: apenas
`moduleId`/`config`/`readModel` mudam. Isso é comprovado no teste (mesmo `apply`, `moduleId:'cadcps'`)
e o umbrella habilita ambos simultaneamente.

## Comportamento OFF

`/CadastroCamposPersonalizados` mantém o comportamento atual/beta atual; `readState` retornado
verbatim, sem anotação do kernel.

## Comportamento ON (flag + `betaApplied`)

Consome o `runtimeReadModel` via generic kernel through ModeloBase1 (map → validação → safety/
fallback/diagnostics → map back → merge → apply).

## `genericKernelApplied`

`true` no state consumido e nos diagnostics (`readiness: 'generic-kernel'`).

## Shape table/form

Preservado, idêntico ao caminho de Empresas (columns/visibleColumns/rows/rowCount/fields/
visibleFields).

## Local write compatibility

Inalterada: `localOnly` preservado; write bridge continua bloqueando targets sink.

## Persistence compatibility

Inalterada: `persistenceReal:false`; snapshot roundtrip in-memory preservado.

## Fallback

Por flag off ou erro → fluxo atual do ModeloBase1, seguro, com `readState` original preservado.
