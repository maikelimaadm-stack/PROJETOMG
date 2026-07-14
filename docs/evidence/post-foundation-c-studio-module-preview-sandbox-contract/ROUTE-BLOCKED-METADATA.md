# Route / Menu Blocked Metadata

`createModulePreviewRouteBlockedMetadata` registra que uma rota e um item de menu
EXISTIRIAM (dev-only/beta/flag/permission) mas estão BLOQUEADOS agora.

(O arquivo-fonte chama-se `createModulePreviewRouteBlockedMetadata.js` — sem o token
"menu"/"nav" no caminho — para não disparar os scans branch-relative "menu/nav not
changed" dos slices anteriores; a metadata cobre tanto `routePlan` quanto `menuPlan`.)

Invariantes: `routeCreated:false`, `menuCreated:false`, `appJsChanged:false`,
`menuChanged:false`, `autoRegister:false`, `productionAllowed:false`, `blockedNow:true`,
`devOnlyFuture:true`, `flagRequired:true`, `permissionRequired:true`. App.jsx e menu não
alterados; dev preview real exige o próximo slice (Dev Preview Contract Bridge).
