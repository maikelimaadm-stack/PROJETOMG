# Manifest · Verifier · Compatibility

## Manifest — `createAppIntegrationManifest`

Frozen, deterministic manifest with a fnv1a digest per part (session, featureGate, checkpointReceipt,
appAttachment, lazyPreviewLoader, mountRequest, failureContainment, rollback). Stable across builds.

## Verifier — `verifyAppIntegration`

Asserts the invariants and flags any violation as a blocker. `mustBeFalse` includes
`routeExposedToProduct`, `menuExposedToProduct`, `sidebarExposedToProduct`,
`runtimeUiMountedByDefault`, `eagerImportUsed`, `productionBundleContainsPreview`, `reactDomUsed`,
`createRootUsed`, `windowUsed`, `documentUsed`, `deepLinkPublic`, `moduleGenerated`,
`backendAccessed`, `prismaAccessed`, `productionAccessed`, `stagingAccessed`, `fetchUsed`,
`realDataRead`, `realDataWrite`, `prototypeRelinked`, … . `mustBeTrue` includes `devOnly`,
`defaultOff`, `isolated`, `failClosed`, `syntheticDataOnly`, `appIntegrated`, `devRouteAttached`,
`lazyImportUsed`, `runtimeUiMountedInApp`, `rollbackByFlagOff`. Part detections include
`unsafe_feature_gate_default_on`, `unsafe_route_exposed`, `unsafe_menu_sidebar_exposed`,
`unsafe_router_change`, `unsafe_app_core_touched`, `unsafe_eager_import`,
`unsafe_production_bundle_contains_preview`, `unsafe_global_mount`, `unsafe_react_dom`,
`unsafe_dom_globals`, `unsafe_mount_by_default`. Never throws.

## Compatibility — `checkAppIntegrationCompatibility`

Confirms alignment with the route-menu runtime, app-integration contract, and runtime UI. Ready for
the dev-only integration; **never** ready for product exposure, real module generation, or
production. Status: `ready_for_dev_only_app_integration_default_off_fail_closed`.
