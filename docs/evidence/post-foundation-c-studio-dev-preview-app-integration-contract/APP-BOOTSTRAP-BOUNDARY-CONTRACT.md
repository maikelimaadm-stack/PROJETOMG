# App Bootstrap Boundary Contract — `createAppBootstrapBoundaryContract`

Asserts the App bootstrap stays untouched and forbids any auto-behaviour:

- `bootstrapTouched: false`, `bootstrapIntegrationCreated: false`;
- `autoMountAllowed: false`, `mountOnImportAllowed: false`, `sideEffectOnImportAllowed: false`;
- `requiresExplicitFutureSlice: true`.

Nothing may mount on import or run automatically at bootstrap — a future slice must wire it
explicitly behind the manual gate.
