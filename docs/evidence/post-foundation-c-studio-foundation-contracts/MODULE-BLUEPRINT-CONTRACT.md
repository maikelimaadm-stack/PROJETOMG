# MODULE BLUEPRINT CONTRACT

Define os requisitos de um Module Blueprint. Nada é registrado.

## Campos obrigatórios

`moduleId`, `version`, `modelType`, `permissions`, `persistenceBoundary`.

## Defaults fail-safe (todos `false`)

`productionAllowed`, `menuVisible`, `routeEnabled`, `mutationAllowed`,
`backendAllowed`, `prismaAllowed`, `migrationAllowed`.

## Regras

- `moduleId`, `version`, `modelType` obrigatórios.
- Campos obrigatórios não podem ficar vazios.
- **Permission blueprint obrigatório** (`permissionBlueprintRequired: true`).
- **Persistence boundary obrigatória** (`persistenceBoundaryRequired: true`).
- Rota/menu nunca automáticos (`routeMenuAutomatic: false`).

Nenhum módulo pode ser criado antes de um Module Blueprint válido.
