# Dev-Only Execution Policy

`createIsolatedRuntimeDevOnlyExecutionPolicy()` declares that a future runtime may run only in
development: `devOnly: true`, `productionAllowed: false`, `stagingAllowed: false`,
`requiresExplicitFutureSlice: true`, `requiresManualGate: true`,
`requiresRuntimeShellContract: true`, `requiresVisualContract: true`.
