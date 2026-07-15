# Studio Dev Preview Route/Menu — Implementation Report

## What was built

An isolated, dev-only route/menu runtime for the Studio Dev Preview. It consumes the
upstream Route/Menu Contract (`dev-preview-route-menu-contract`) and the Runtime UI
(`dev-preview-runtime-ui`) and produces a headless, deterministic runtime plus a
separate, real React host graph (`.jsx`) that is only mounted through explicit
dependency injection.

## Building blocks

| Concern | File |
| --- | --- |
| Config / flags / digest | `routeMenuConfig.js` |
| Error taxonomy | `errors.js` |
| Session | `createRouteMenuSession.js` |
| Preflight | `createRouteMenuPreflight.js` |
| Contract loader | `createRouteMenuContractLoader.js` |
| Checkpoint receipt | `createRouteMenuCheckpointReceipt.js` |
| Dev-only feature gate | `createDevOnlyFeatureGate.js` |
| Isolated route registry | `createIsolatedRouteRegistry.js` |
| Isolated route resolver | `createIsolatedRouteResolver.js` |
| Isolated menu registry | `createIsolatedMenuRegistry.js` |
| Local navigation controller | `createIsolatedNavigationController.js` |
| Route guard | `createRouteGuard.js` |
| Menu visibility | `createMenuVisibilityDecision.js` |
| Mount request | `createRuntimeUiMountRequest.js` |
| Mount adapter (DI) | `createRuntimeUiMountAdapter.js` |
| React host tree (descriptor) | `createRouteMenuReactHostTree.js` |
| Blocked navigation | `createBlockedNavigationModel.js` |
| Isolation boundary | `createRouteMenuIsolationBoundary.js` |
| Manifest | `createRouteMenuManifest.js` |
| Verifier | `verifyRouteMenuRuntime.js` |
| Compatibility | `checkRouteMenuRuntimeCompatibility.js` |
| Diagnostics | `createRouteMenuDiagnostics.js` |
| Fallback | `createRouteMenuFallback.js` |
| Composer | `createStudioDevPreviewRouteMenu.js` |
| Real React host `.jsx` | 5 files |

## Isolated routes

- `/__dev/studio/preview`
- `/__dev/studio/preview/not-found`

Both are under the `/__dev` namespace and never registered with any product router.

## Result

66+ runtime tests upstream remain green; this slice adds ≥430 scenarios and a
≥135-check gate, all passing.
