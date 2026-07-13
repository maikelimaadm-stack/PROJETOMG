# CANONICAL ROUTE/MENU & PERSISTENCE CONTRACT

## Route/Menu contract

routePlan + menuPlan são planos. Defaults: routeEnabled false · menuVisible false ·
productionAllowed false · autoRegister false. App.jsx/menu não alterados · public route
bloqueado · guard/flag/permission obrigatórios.

## Persistence boundary

8 estados (noPersistence … productionWriteControlled), default `noPersistence`.
Defaults false: schemaAllowed · migrationAllowed · prismaAllowed · backendAllowed ·
mutationAllowed. Dado real nunca é fixture · schema/migration automáticos bloqueados ·
produção exige política explícita futura.
