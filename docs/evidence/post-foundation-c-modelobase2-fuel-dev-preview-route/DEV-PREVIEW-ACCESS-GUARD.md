# Dev Preview Access Guard

`resolveModeloBase2FuelDevPreviewAccess({ env })` + `shouldMountModeloBase2FuelDevPreviewRoute(env)`.

## Flags

- `MAK_MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE` — opt-in da rota (off por default).
- `MAK_MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD` — override explícito para produção (off por default).

## Ambiente

`detectFuelDevEnvLabel(env)` → `production` / `development` / `other`. Sob `node --test`
(DEV/MODE/NODE_ENV ausentes) o default é `development`.

## Matriz

| flag | ambiente | allowProd | allowed | reason |
|---|---|---|---|---|
| off | qualquer | — | **false** | `flag-off` |
| on | dev/test | — | **true** | `allowed` |
| on | production | false | **false** | `production-fail-closed` |
| on | production | true | **true** (warning alto) | `production-allowed-override` |

## Comportamento off

Rota não montada (`shouldMount` false). O componente, se renderizado, mostra um **fallback seguro**
(aviso dev-only) — nunca a sandbox, nunca dados reais.

## Comportamento on

Rota montada em dev; o componente renderiza a Fuel Sandbox Shell + diagnostics + badges dev.

## Invariantes

`menuRegistered:false` sempre; `backendTouched/prismaTouched/runtimeBridgeTouched:false`;
`persistenceReal:false`; `localOnly:true`; `sent:false`.
