# Lifecycle Executor

`createIsolatedRuntimeLifecycleExecutor()` executes the lifecycle as a pure sequence of
metadata-only transitions (created → preflighted → contractsLoaded → syntheticDataPrepared →
framePrepared → blockedForUIRuntime → disposed). No real timers, event loop, DOM, or listeners
(`usesTimers/usesEventLoop/usesDom/usesListeners: false`).
