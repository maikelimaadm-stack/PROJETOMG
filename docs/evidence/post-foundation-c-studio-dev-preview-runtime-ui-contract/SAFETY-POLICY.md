# Safety Policy

`createRuntimeUiSafetyPolicy()` asserts that no forbidden side effect and no UI runtime were
produced: `anyForbiddenSideEffect: false`, `visualRuntimeImplemented: false`, mirroring the frozen
capability flags; `reversibleByNonConsumption: true`. `forbiddenFlags` enumerates every forbidden
capability and every value is `false`.
