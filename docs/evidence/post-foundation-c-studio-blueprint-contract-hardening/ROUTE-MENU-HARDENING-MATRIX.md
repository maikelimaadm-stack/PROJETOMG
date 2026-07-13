# ROUTE/MENU HARDENING MATRIX

`createStudioRouteMenuHardeningMatrix()` — 19 cenários; todos bloqueados
(`allBlocked: true`).

## Casos bloqueados

routeEnabled/menuVisible/productionAllowed default true · devOnly/betaOnly false sem
gate · guardRequired/flagRequired/permissionRequired false · componentBinding real ·
App.jsx binding · public route · wildcard route · routePath inseguro/duplicado ·
menu sem permission · menu production visible · autoRegister · fallbackRoute externo ·
diagnostics com secret.

## Regras

route/menu default off; **App.jsx não é alterado**; **menu não é alterado**; nenhum
registro automático; permission/flag/guard obrigatórios; rota de produção bloqueada.
