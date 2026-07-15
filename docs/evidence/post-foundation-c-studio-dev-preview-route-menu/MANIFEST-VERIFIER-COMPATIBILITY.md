# Manifest · Verifier · Compatibility

## Manifest — `createRouteMenuManifest`

Produces a frozen, deterministic manifest of the runtime: identity, version chain,
isolated routes, component names, capabilities, readiness state and a fnv1a digest.
Two full-composer manifests over equal inputs produce identical digests.

## Verifier — `verifyRouteMenuRuntime`

Asserts the safety invariants as boolean capabilities:

- `mustBeFalse` — e.g. `runtimeUiMountedByDefault`, `globalRuntimeUiMounted`,
  `browserRouteRegistered`, `productRouterWiringImplemented`, `productMenuRegistered`,
  `productSidebarRegistered`, `appWiringImplemented`, `deepLinkImplemented`,
  `publicUrlCreated`, `featureFlagDefaultEnabled`, `prototypeRelinked`.
- `mustBeTrue` — e.g. `devOnly`, `isolated`, `defaultOff`, `failClosed`,
  `syntheticDataOnly`, `routeImplemented`, `menuImplemented`, `featureFlagRequired`,
  `productionDenied`, `stagingDenied`.
- Part-flag detections (`unsafe_app_touched`, `unsafe_main_router_wired`,
  `unsafe_react_router`, `unsafe_react_dom`, `unsafe_browser_globals`,
  `unsafe_auto_mount`, `unsafe_public_deep_link`, `unsafe_feature_flag_default_on`,
  `unsafe_global_mount`, `missing_checkpoint`, `unsafe_prototype_relink`) — all must
  be clear.

`verified: true` only when every invariant holds.

## Compatibility — `checkRouteMenuRuntimeCompatibility`

Confirms version alignment across the upstream chain (contract, runtime UI, isolated
runtime, shell, visual, bridge, sandbox) so the runtime refuses to run against an
incompatible upstream.
