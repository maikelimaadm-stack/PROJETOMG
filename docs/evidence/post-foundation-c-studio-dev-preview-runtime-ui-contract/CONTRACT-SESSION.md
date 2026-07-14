# Contract Session

`createRuntimeUiContractSession({ isolatedRuntime })` builds a pure descriptor:
`sessionId = "<moduleId>#dev-preview-runtime-ui-contract"`, `seed` derived from the source
isolated-runtime / virtual-frame digests (stable across runs), and source contract versions.
Side-effect flags — `usesStorage`, `usesFetch`, `usesPersistence`, `runtimeSideEffects` — are all
`false`.
