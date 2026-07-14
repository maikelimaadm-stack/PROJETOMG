# Lifecycle Contract

`createDevPreviewRuntimeShellLifecycleContract()` describes the 7 phases a future shell WOULD
move through (created → configured → validated → ready → blocked → failed → disposed) as
metadata. `failed`/`disposed` are terminal; `blocked`/`failed` are blocking. No real runtime,
no timers, no event loop, no DOM: `usesTimers`, `usesEventLoop`, `usesRealRuntime`, `dom` are
all `false`.
