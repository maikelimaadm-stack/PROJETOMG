# Runtime Safety

`createDevPreviewRuntimeShellSafetyMetadata()` asserts the headless invariant:
`anySideEffect: false`, mirroring the frozen capability flags. `mountCreated`, `domCreated`,
`cssCreated`, `backendAccessed`, `prismaAccessed`, `productionAccessed`, `stagingAccessed`,
`fetchUsed`, `mutationAllowed`, `persistenceCreated`, `realDataRead`, `realDataWrite` are all
`false`; `reversibleByNonConsumption: true`. `sideEffectFlags` enumerates every capability and
every value is `false`.
