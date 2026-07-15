# Manifest · Verifier · Compatibility

## Manifest — `createAppIntegrationImplementationPlanManifest`

Frozen, deterministic manifest with a fnv1a digest per plan part. Two builds over equal inputs
produce identical digests.

## Verifier — `verifyAppIntegrationImplementationPlan`

Asserts the invariants and flags any violation as a blocker. `mustBeFalse` includes `appIntegrated`,
`appTouched`, `appWiringImplemented`, `productionUiGuardExtended`, `featureFlagImplemented`,
`featureFlagConnectedToApp`, `routerWiringImplemented`, `routeExposedToProduct`,
`menuExposedToProduct`, `runtimeUiMountedInApp`, `reactDomUsed`, `createRootUsed`, `windowUsed`,
`documentUsed`, `deepLinkCreated`, `backendAccessed`, `prismaAccessed`, `productionAccessed`,
`realDataRead`, `realDataWrite`, `oldPrototypeImported`, … . `mustBeTrue` includes `headless`,
`contractOnly`, `metadataOnly`, `planOnly`. Part detections include `unsafe_app_touched`,
`unsafe_production_ui_guard_extended`, `unsafe_feature_flag_connected_to_app`, `unsafe_router_api`,
`unsafe_router_primitive`, `unsafe_menu_exposed`, `unsafe_runtime_ui_mounted`, `unsafe_react_dom`,
`unsafe_dom_globals`, `unsafe_production_staging_allowed`, `unsafe_prototype_relink`,
`unsafe_governance_registry`, and `missing_manual_gate`. The verifier never throws.

## Compatibility — `checkAppIntegrationImplementationPlanCompatibility`

Confirms version alignment with the App integration contract, route/menu runtime, and runtime UI.
Ready for the plan itself; **never** authorizes a real implementation slice, App integration, real
module generation, or production. Status:
`ready_for_future_app_integration_implementation_slice_after_enterprise_checkpoint`.
