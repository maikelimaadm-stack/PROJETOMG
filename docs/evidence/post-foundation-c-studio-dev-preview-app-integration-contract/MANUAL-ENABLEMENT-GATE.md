# Manual Enablement Gate — `createAppIntegrationManualEnablementGateContract`

A future real App integration requires an explicit enterprise checkpoint. This slice authorizes
**nothing** real.

- `manualGateRequired: true`;
- `requiredCheckpoint: pre_app_integration_implementation_enterprise_checkpoint`;
- `currentSliceAuthorization: contract_only`;
- `authorizesAppTouch/AppWiring/RouterWiring/RouteExposure/MenuExposure/RuntimeUiMount/Production/
  Backend/Prisma/RealData` — all `false`.

The verifier flags `missing_manual_gate` if the requirement is dropped and
`unsafe_manual_gate_authorizes_integration` if the gate ever authorizes wiring or a mount.
