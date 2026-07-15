# Route/Menu Runtime — File & Export Inventory

## Source files (`src/studio/blueprint-engine/dev-preview-route-menu/`)

### `.js` runtime graph (25)

`routeMenuConfig.js`, `errors.js`, `createRouteMenuSession.js`,
`createRouteMenuPreflight.js`, `createRouteMenuContractLoader.js`,
`createRouteMenuCheckpointReceipt.js`, `createDevOnlyFeatureGate.js`,
`createIsolatedRouteRegistry.js`, `createIsolatedRouteResolver.js`,
`createIsolatedMenuRegistry.js`, `createIsolatedNavigationController.js`,
`createRouteGuard.js`, `createMenuVisibilityDecision.js`,
`createRuntimeUiMountRequest.js`, `createRuntimeUiMountAdapter.js`,
`createRouteMenuReactHostTree.js`, `createBlockedNavigationModel.js`,
`createRouteMenuIsolationBoundary.js`, `createRouteMenuManifest.js`,
`verifyRouteMenuRuntime.js`, `checkRouteMenuRuntimeCompatibility.js`,
`createRouteMenuDiagnostics.js`, `createRouteMenuFallback.js`,
`createStudioDevPreviewRouteMenu.js`, `index.js`.

### `.jsx` real React host (5)

`StudioDevPreviewRouteMenuHost.jsx`, `StudioDevPreviewMenu.jsx`,
`StudioDevPreviewRouteView.jsx`, `StudioDevPreviewNotFound.jsx`,
`StudioDevPreviewBlocked.jsx`.

## Isolated routes

- `/__dev/studio/preview`
- `/__dev/studio/preview/not-found`

## Checkpoint receipt

`approved_for_isolated_route_menu_runtime`

## Validation

- Test: `src/runtime/__tests__/studio-dev-preview-route-menu.test.js` (≥430 scenarios)
- Gate: `scripts/gates/g423-studio-dev-preview-route-menu.mjs` (≥135 checks)
- Scripts: `test:runtime:studio-dev-preview-route-menu`,
  `gate:g423-studio-dev-preview-route-menu`, plus the aggregate `test:runtime` entry.
- Evidence: 24 documents in this directory.
