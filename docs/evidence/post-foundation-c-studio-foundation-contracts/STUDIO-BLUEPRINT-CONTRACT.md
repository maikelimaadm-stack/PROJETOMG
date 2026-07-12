# STUDIO BLUEPRINT CONTRACT

O Blueprint é o envelope versionado de um módulo planejado.

## Estados de ciclo de vida

`draft` → `validated` → `previewable` → `certified_local` → `ready_for_staging`,
com estados terminais `blocked` e `deprecated`.

## Regras invioláveis

- **Nenhum estado** registra um módulo (`anyStateRegistersModule: false`).
- **Nenhum estado** autoriza produção sozinho (`anyStateAllowsProduction: false`).
- `certified_local` **não** é produção.
- `ready_for_staging` **não** acessa staging automaticamente.
- `blocked` falha fechado (`failClosed: true`).

## Envelope

`blueprintId`, `blueprintVersion`, `blueprintType`, `status`, `owner`,
`modelFamily`, `modelType`, `module`, `fields`, `screens`, `validations`,
`permissions`, `routeMenu`, `persistenceBoundary`, `runtimeBinding`,
`diagnostics`, `gates`, `compatibility`, `publicationPolicy`.
