# Plan Session

`createIsolatedRuntimeImplementationPlanSession({ runtimeShellContract })` builds a pure
descriptor: `sessionId = "<moduleId>#dev-preview-isolated-runtime-implementation-plan"`, `seed`
derived from the source runtime-shell / visual digests (stable across runs), and source
contract versions. Side-effect flags — `usesStorage`, `usesFetch`, `usesPersistence`,
`runtimeSideEffects` — are all `false`. `sessionDigest` is an FNV-1a checksum.
