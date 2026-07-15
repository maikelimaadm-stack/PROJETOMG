# Manifest · Verifier · Compatibility

## Manifest — `createAppIntegrationManifest`

Frozen, deterministic manifest with a fnv1a digest per part (session, attachment point, feature
flag, product isolation, bootstrap boundary, router attachment, route/menu exposure, runtime UI
mount adapter, DI boundary, lifecycle/cleanup, failure containment, ownership/rollback,
production/staging denial, prototype relink prohibition, manual gate, safety, readiness). Two builds
over equal inputs produce identical digests.

## Verifier — `verifyAppIntegrationContract`

Asserts the invariants and flags any violation as a blocker:

- `mustBeFalse` — `appIntegrated`, `appTouched`, `appWiringCreated`, `routerTouched`,
  `routerWiringCreated`, `routeExposedToProduct`, `menuExposedToProduct`, `sidebarExposedToProduct`,
  `runtimeUiMountedInApp`, `featureFlagConnectedToApp`, `reactDomUsed`, `createRootUsed`,
  `windowUsed`, `documentUsed`, `deepLinkCreated`, `moduleGenerated`, `backendAccessed`,
  `prismaAccessed`, `productionAccessed`, `stagingAccessed`, `fetchUsed`, `mutationAllowed`,
  `persistenceCreated`, `realDataRead`, `realDataWrite`, `rewriteEmpresas`, …
- `mustBeTrue` — `headless`, `contractOnly`, `metadataOnly`, `appIntegrationContractOnly`, `devOnly`,
  `isolated`.
- Part detections — `unsafe_app_touched`, `unsafe_router_api`, `unsafe_route_exposed`,
  `unsafe_menu_exposed`, `unsafe_runtime_ui_mounted`, `unsafe_react_dom`, `unsafe_dom_globals`,
  `unsafe_prototype_relink`, `unsafe_production_staging_allowed`, `missing_manual_gate`, and more.

`verified: true` only when every invariant holds; the verifier never throws.

## Compatibility — `checkAppIntegrationCompatibility`

Confirms version alignment with the route/menu runtime and runtime UI. It is ready for the contract
itself and **never** authorizes a real implementation plan/slice, App integration, real module
generation, or production. Status:
`ready_for_future_app_integration_implementation_plan_when_explicitly_authorized`.
