# Synthetic Data Provider

`createIsolatedRuntimeSyntheticDataProvider({ implementationPlan, rowCount })` produces
deterministic SYNTHETIC rows and fields with fabricated values. `syntheticDataOnly: true`;
`realDataRead`, `realDataWrite`, `usesStorage`, `usesPersistence` are all `false`. Tenant and
permission hints are synthetic only.
