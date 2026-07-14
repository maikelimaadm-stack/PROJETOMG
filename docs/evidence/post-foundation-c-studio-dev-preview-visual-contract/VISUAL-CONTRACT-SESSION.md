# Visual Contract Session

`createDevPreviewVisualContractSession({ bridge })` builds a pure descriptor:
`sessionId = "<moduleId>#dev-preview-visual-contract"`, `seed` derived from the source bridge /
sandbox digests (stable across runs), and source contract versions.

Side-effect flags — `usesStorage`, `usesFetch`, `usesPersistence`, `runtimeSideEffects` — are all
`false`. `sessionDigest` is an FNV-1a checksum of the descriptor.
