# RUNTIME BINDING CONTRACT

Mapeia tipos de blueprint para runtimes, **apenas como referência**.

## Tipos

`cadastro`, `operacional`, `dashboardPlanned`, `workflowPlanned`,
`marketplacePlanned`.

## Mapeamento

- `cadastro` → `modeloBase1` (referência de cadastro, próxima de produção)
- `operacional` → `modeloBase2Experimental` (referência operacional, **experimental**)
- `dashboardPlanned` / `workflowPlanned` / `marketplacePlanned` → `planned`

## Bindings de referência

- `genericModelRuntime`: kernel de contratos/safety/diagnostics.
- `empresasCertifiedContract`: `empresas-local-read-contract@1.0.0` — seed model
  certificado, **não reescrito**.
- `cadcpsReference`: referência de campos personalizados.

## Invariantes

- `activatesProduction: false`
- `registersModule: false`
- `accessesPrismaDirectly: false`

O binding **não** ativa produção, **não** registra módulo e **não** acessa Prisma.
