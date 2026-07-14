# Manual Gate

`createIsolatedRuntimeManualGate()` records the Fable pre-runtime enterprise checkpoint that
authorized this dev-only isolated runtime: `manualGateName: fable-pre-runtime-enterprise-checkpoint`,
`manualGateStatus: approved_for_dev_only_isolated_runtime`, `approvedForDevOnlyIsolatedRuntime:
true`. It authorizes ONLY the dev-only runtime — `productionGate`, `routeMenuGate`,
`moduleGenerationGate`, `backendGate`, `prismaGate` are all `false`.
