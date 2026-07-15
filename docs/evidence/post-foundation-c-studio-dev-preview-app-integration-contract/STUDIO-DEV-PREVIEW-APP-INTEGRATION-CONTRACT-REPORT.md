# Studio Dev Preview App Integration Contract — Report

## What was built

A headless `.js` subtree that consumes the Dev Preview Route/Menu runtime
(`dev-preview-route-menu`) and produces a deterministic, metadata-only contract for a future
controlled integration of the isolated dev-preview host with the real App.

## Building blocks

| Concern | File |
| --- | --- |
| Config / flags / digest | `appIntegrationContractConfig.js` |
| Error taxonomy | `errors.js` |
| Contract session | `createAppIntegrationContractSession.js` |
| App attachment point | `createAppAttachmentPointContract.js` |
| Dev-only feature flag | `createDevOnlyFeatureFlagContract.js` |
| Product isolation | `createProductIsolationContract.js` |
| App bootstrap boundary | `createAppBootstrapBoundaryContract.js` |
| Router attachment | `createRouterAttachmentContract.js` |
| Route exposure | `createRouteExposureContract.js` |
| Menu exposure | `createMenuExposureContract.js` |
| Runtime UI mount adapter | `createRuntimeUiMountAdapterContract.js` |
| Dependency injection boundary | `createDependencyInjectionBoundaryContract.js` |
| Lifecycle / cleanup | `createLifecycleCleanupContract.js` |
| Failure containment | `createFailureContainmentContract.js` |
| Ownership / rollback | `createOwnershipRollbackContract.js` |
| Production / staging denial | `createProductionStagingDenialContract.js` |
| Prototype relink prohibition | `createPrototypeRelinkProhibitionContract.js` |
| Manual enablement gate | `createAppIntegrationManualEnablementGateContract.js` |
| Safety | `createAppIntegrationSafetyContract.js` |
| Readiness decision | `createAppIntegrationReadinessDecision.js` |
| Manifest | `createAppIntegrationManifest.js` |
| Verifier | `verifyAppIntegrationContract.js` |
| Compatibility | `checkAppIntegrationCompatibility.js` |
| Diagnostics | `createAppIntegrationDiagnostics.js` |
| Fallback | `createAppIntegrationFallback.js` |
| Composer | `createStudioDevPreviewAppIntegrationContract.js` |
| Public surface | `index.js` |

## Contract identity

- `appIntegrationContractName`: `studio-dev-preview-app-integration-contract`
- `appIntegrationContractVersion`: `studio-dev-preview-app-integration-contract@1.0.0`
- `mode`: `headless_dev_preview_app_integration_contract`
- `readiness`: `studio_dev_preview_app_integration_contract_ready`

## Result

27 `.js` files; ≥410 test scenarios and a ≥125-check gate, all passing; the full upstream chain
remains green.
