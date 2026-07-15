# Manual Enablement Gate Plan — `createAppIntegrationManualEnablementGatePlan`

A future real App integration implementation slice requires an explicit enterprise checkpoint. This
slice authorizes **nothing** real:

- `manualGateRequired: true`;
- `requiredCheckpoint: pre_app_integration_implementation_enterprise_checkpoint`;
- `currentSliceAuthorization: plan_only`;
- `authorizesAppTouch/AppWiring/RouterWiring/RouteExposure/MenuExposure/RuntimeUiMount/
  ProductionUiGuardExtension/Production/Backend/Prisma/RealData` — all `false`.

The verifier flags `missing_manual_gate` if the requirement is dropped and
`unsafe_manual_gate_authorizes_integration` if the gate ever authorizes wiring, a mount, or a guard
extension.
