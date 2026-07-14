# Dev Preview Bridge Session

`createDevPreviewBridgeSession({ sandbox })` builds a pure descriptor:
`bridgeId = "<moduleId>#dev-preview-contract-bridge"`, `seed` derived from the source
sandbox/blueprint digests (stable across runs), and source contract versions.

Side-effect flags: `usesStorage`, `usesFetch`, `usesPersistence`, `runtimeSideEffects`
are all `false`. `sessionDigest` is an FNV-1a checksum of the descriptor.
