# Lifecycle Execution Plan

`createIsolatedRuntimeLifecycleExecutionPlan()` maps the steps a future runtime WOULD move
through (created → preflight → validated → blockedForImplementation → readyForFutureSlice →
failedClosed → disposed). `failedClosed`/`disposed` are terminal; `blockedForImplementation`/
`failedClosed` are blocking. No step is implemented; `usesRealRuntime: false`.
