# Runtime Safety

`createDevPreviewVisualRuntimeSafetyMetadata()` asserts the headless invariant:
`anySideEffect: false`, mirroring the frozen capability flags. `backendAccessed`,
`prismaAccessed`, `productionAccessed`, `stagingAccessed`, `fetchUsed`, `mutationAllowed`,
`persistenceCreated`, `moduleRegistered`, `filesWrittenToModule`, `domCreated`, `cssCreated`
are all `false`; `reversibleByNonConsumption: true`. `sideEffectFlags` enumerates every
capability and every value is `false`.
