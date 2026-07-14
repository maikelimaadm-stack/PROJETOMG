# Runtime Safety

`createIsolatedRuntimeSafetyPlan()` asserts the headless invariant: `runtimeImplemented: false`
and `anySideEffect: false`, mirroring the frozen capability flags. `realDataRead`,
`realDataWrite`, `domCreated`, `cssCreated` are `false`; `reversibleByNonConsumption: true`.
`sideEffectFlags` enumerates every capability (including `runtimeImplemented`) and every value is
`false`.
