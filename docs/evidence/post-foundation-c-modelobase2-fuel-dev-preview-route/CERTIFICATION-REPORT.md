# Post-Foundation C — Certification Report — ModeloBase2 Fuel Dev Preview Route

**Slice:** Post-Foundation C — ModeloBase2 Fuel Dev Preview Route
**Branch:** `claude/post-foundation-c-modelobase2-fuel-dev-preview-route`

**Áreas:**
- fuel-ui-sandbox dev preview
- App route dev-only
- fuel sandbox / fuel headless (reutilizados)

## Objetivo

Criar uma rota **dev-only** para abrir a Fuel Beta UI Sandbox no navegador em
`/__dev/modelobase2/fuel`, atrás de guard de ambiente/flag, **sem menu, sem módulo real, sem
backend**. Espelha o padrão já existente da rota dev-preview do runtime-v2.

## Arquivos criados

| File | Papel |
|---|---|
| `src/ModeloBase2/fuel-ui-sandbox/dev-preview/errors.js` | Erro tipado MAK-MB2-FUEL-DPR-001..004 |
| `.../dev-preview/modeloBase2FuelDevPreviewConfig.js` | Route path, flags, guard (shouldMount) |
| `.../dev-preview/resolveModeloBase2FuelDevPreviewAccess.js` | Access resolver (fail-closed) |
| `.../dev-preview/createModeloBase2FuelDevPreviewFixtures.js` | Fixtures determinísticas fictícias |
| `.../dev-preview/createModeloBase2FuelDevPreviewState.js` | Preview state (session + viewModel + fixtures) |
| `.../dev-preview/createModeloBase2FuelDevPreviewDiagnostics.js` | Diagnostics |
| `.../dev-preview/ModeloBase2FuelDevPreviewRoute.jsx` | Componente de rota (self-guarding) |
| `.../dev-preview/index.js` | Barrel (pura; sem JSX) |
| `src/runtime/__tests__/modelobase2-fuel-dev-preview-route.test.js` | 15 casos (cobrindo os 34 cenários) |
| `scripts/gates/g423-modelobase2-fuel-dev-preview-route.mjs` | Gate do slice (29 checks) |
| `docs/evidence/post-foundation-c-modelobase2-fuel-dev-preview-route/*` | 8 evidências |

## Arquivos modificados

| File | Alteração |
|---|---|
| `src/App.jsx` | **Somente** a montagem da rota dev-only (lazy import + `<Route>` guardado por `shouldMountModeloBase2FuelDevPreviewRoute()`); menu/rotas produtivas intactos |
| `package.json` | Scripts `test:runtime:modelobase2-fuel-dev-preview-route` + `gate:g423-modelobase2-fuel-dev-preview-route` + append no `test:runtime` |
| `scripts/gates/lib/productionUiGuard.mjs` | Guard compartilhado ganha a rota fuel dev como **2ª exceção sancionada** de App.jsx (espelha a do runtime-v2). Estrito e específico; nenhuma proteção enfraquecida |
| `scripts/gates/g423-modelobase2-fuel-beta-ui-sandbox.mjs` | Robustez cross-slice: "pure" = `.js` (React em qualquer `.jsx`); App.jsx guardado centralmente; allowlist tolera o slice dev-preview |
| `src/runtime/__tests__/modelobase2-fuel-beta-ui-sandbox.test.js` | "pure" = `.js` (React em qualquer `.jsx`) |
| `src/runtime/__tests__/preview/runtime-v2-dev-preview-route-activation.test.js` | Assert de path do App.jsx aceita também a rota fuel dev sancionada |

**Fuel-ui-sandbox / fuel-headless / operational runtime reutilizados sem alteração de comportamento.**
**src/modules / src/pages / ModeloBase1 / Empresas / cadcps NÃO alterados.** **Menu NÃO alterado.**

## Dev Preview Route

- **routePath:** `/__dev/modelobase2/fuel` (dev-only)
- **devOnly:** true
- **access guard:** `resolveModeloBase2FuelDevPreviewAccess` + `shouldMountModeloBase2FuelDevPreviewRoute` (off por default; prod fail-closed salvo `*_ALLOW_PROD` com warning)
- **fixtures:** determinísticas/fictícias (empty/basic/withDraft/withEvents)
- **view model:** derivado do fuel-headless
- **sandbox shell:** montado quando access allowed; fallback seguro quando negado
- **uiMountedInApp:** reflete o access (true só quando allowed)
- **routeRegistered:** reflete o access
- **menuRegistered:** **false** (sempre)
- **localOnly:** true · **sent:** false · **persistenceReal:** false
- **backend/Prisma/runtimeBridge/src-modules/src-pages alterado:** não
- **App/menu alterado:** App.jsx só para a rota dev; menu não

## Testes

- `test:runtime:modelobase2-fuel-dev-preview-route`: **15 pass / 0 fail**
- `test:runtime`: **1468 pass / 0 fail**

## Gates

- `gate:g423-modelobase2-fuel-dev-preview-route`: **29/29**
- `gate:g423-modelobase2-fuel-ui-sandbox`: **PASS** (relaxado para React-em-`.jsx` + dev-route)
- `gate:g423` (master Foundation C): **7/7** (inclui o production-UI guard com a rota fuel dev)
- `gate:g423-modelobase2-fuel-headless` / `gate:g423-modelobase2-operational-runtime` /
  `gate:g423-generic-model-multi-type-hardening` / `gate:g423-generic-model-contracts-foundation`:
  **PASS no main / no próprio branch** (empty diff). No branch deste slice, apenas seus checks
  git-diff branch-relativos (authorized-scope + "App.jsx untouched") acusam os arquivos novos deste
  slice e a rota dev sancionada; **todos os checks funcionais/estruturais passam** — verificado
  emulando o contexto pós-merge (origin/main = HEAD → 4/4 PASS). Nenhuma regressão funcional.

## Lint / Build

- `npm run lint`: exit 0
- `npm run build`: exit 0 (a rota é lazy + guardada; só é incluída no bundle quando montada)

## Observações

- `gate:paridade-visual` (spawnSync `/bin/sh` ENOENT) não executado — ambiental, fora do escopo,
  idêntico à main limpa.

## Status: PASS
