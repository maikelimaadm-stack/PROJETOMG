# Runtime Session

`createIsolatedRuntimeSession({ implementationPlan })` builds a pure descriptor:
`sessionId = "<moduleId>#dev-preview-isolated-runtime"`, `seed` derived from the source plan /
runtime-shell digests (stable across runs), and source contract versions. `devOnly: true`,
`isolated: true`. Side-effect flags — `usesStorage`, `usesFetch`, `usesPersistence`,
`externalSideEffects` — are all `false`.
