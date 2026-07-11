# Fuel Route / Menu / Permission Plan

Todos os planos são **apenas planos** — nada é registrado neste slice.

## Route plan (`createModeloBase2FuelModuleRoutePlan`)

- **plannedRoutePath:** `/operacional/combustivel`
- **devPreviewRoutePath:** `/__dev/modelobase2/fuel` (rota dev-only já existente — fallback)
- **routeRegistered:** false
- **appJsChangeRequiredFuture:** true
- **currentAppJsChange:** false
- **guardRequired:** true
- **betaFlagRequired:** true
- **productionAllowed:** false
- **allowProdFlagRequired:** true
- **fallbackRoute:** `/__dev/modelobase2/fuel`

> A rota produtiva ainda **NÃO** é criada. App.jsx permanece intocado.

## Menu plan (`createModeloBase2FuelModuleMenuPlan`)

- **menuRegistered:** false
- **plannedMenuGroup:** `Operacional`
- **plannedMenuLabel:** `Combustível`
- **plannedOrder:** 50
- **plannedIcon:** `Fuel`
- **visibilityPolicy:** `beta_flag_and_permission`
- **permissionRequired:** `fuel.read`
- **betaFlagRequired:** true
- **productionAllowed:** false

> O menu principal **NÃO** é alterado.

## Permission plan (`createModeloBase2FuelModulePermissionPlan`)

Permissões locais/seguras planejadas (allowed):

`fuel.read`, `fuel.create_local`, `fuel.update_local`, `fuel.delete_local`,
`fuel.submit_simulated`, `fuel.snapshot`, `fuel.restore`, `fuel.diagnostics`

Bloqueadas (fail-closed):

`fuel.backend_write`, `fuel.sync`, `fuel.export`, `fuel.approve`, `fuel.connector`, `fuel.workflow`

- **permissionsRegistered:** false
- **authGlobalChanged:** false
- **failClosed:** true
- **futurePermissionModel:** `module_scoped_local_first`, `defaultDeny:true`, `integratedNow:false`

## O que NÃO foi registrado

- Nenhuma rota produtiva (App.jsx intocado).
- Nenhuma entrada de menu.
- Nenhuma permissão no modelo de auth global.

## Futuro controlado

O registro real (rota + menu + permissões) acontece somente em
**Fuel Controlled Module Registration** ou **Fuel Beta Module Shell Candidate**, atrás de
guard + flag, fail-closed em produção.
