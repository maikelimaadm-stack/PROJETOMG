# Safety Policy

`createIsolatedRuntimeSafetyPolicy()` asserts the invariant that the runtime, while implemented
(`isolatedRuntimeImplemented: true`), produced no forbidden side effect: `anyForbiddenSideEffect:
false`, mirroring the frozen capability flags. `visualRuntimeImplemented: false`;
`reversibleByNonConsumption: true`. `forbiddenFlags` enumerates every forbidden capability and every
value is `false`.
