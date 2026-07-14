# Runtime Shell Session

`createDevPreviewRuntimeShellSession({ visualContract })` builds a pure descriptor:
`sessionId = "<moduleId>#dev-preview-runtime-shell-contract"`, `seed` derived from the source
visual / bridge digests (stable across runs), and source contract versions.

Side-effect flags — `usesStorage`, `usesFetch`, `usesPersistence`, `runtimeSideEffects` — are all
`false`. `sessionDigest` is an FNV-1a checksum of the descriptor.
