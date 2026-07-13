# Module Route / Menu Plan

`createModuleRouteMenuPlan` planeja rota e menu — sem criar nenhum dos dois.

Route: `routeId`, `routePath` (`/__dev/studio/<id>`), `routeType:devPreview`,
`devOnly:true`, `betaOnly:true`, `productionAllowed:false`, `guardRequired:true`,
`flagRequired:true`, `permissionRequired:true`, `componentBinding:plannedOnly`,
`fallbackRoute`, `diagnostics`.

Menu: `menuId`, `label`, `group:studioBeta`, `order`, `icon`, `visibilityPolicy`,
`permissionRequired:true`, `betaOnly:true`, `productionAllowed:false`, `flagRequired:true`.

Regras: `routeCreated:false`, `menuCreated:false`, `autoRegister:false`,
`changesAppJsx:false`, `changesMenu:false`. Produção bloqueada. Um dev preview real exige
seu próprio slice.
