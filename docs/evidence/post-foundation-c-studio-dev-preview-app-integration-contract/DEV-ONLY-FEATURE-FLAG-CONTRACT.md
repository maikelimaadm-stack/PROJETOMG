# Dev-Only Feature Flag Contract — `createDevOnlyFeatureFlagContract`

Metadata for a future flag that would gate the isolated host in the App. It defines **no real flag
connected to the App**.

- `defaultEnabled: false` (default-off);
- `devOnly: true`; `productionAllowed: false`; `stagingAllowed: false`;
- `connectedToApp: false`;
- `requiresExplicitFutureSlice: true`; `requiresManualGate: true`.

The flag stays a description; wiring it to the App is a future, checkpoint-gated step.
