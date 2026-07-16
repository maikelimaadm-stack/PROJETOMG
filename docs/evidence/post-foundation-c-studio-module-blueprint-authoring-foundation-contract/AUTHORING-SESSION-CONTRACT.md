# Authoring Session Contract

`createAuthoringFoundationContractSession({ certifiedBlueprint })` builds a **deterministic** session
referencing the certified blueprint read-only. It authors nothing.

Fields: `sessionId` (deterministic), `sessionKind`, `sourceBlueprintContractVersion`,
`sourceBlueprintEngineVersion`, `createdFromSyntheticSeed:true`, `ephemeral:true`,
`persistent:false`, `canonical:false`, `sideEffectFree:true`, `consumesUpstreamReadOnly:true`,
`authorsAnything:false`, `usesStorage/usesFetch/usesPersistence:false`, `runtimeSideEffects:false`,
`sessionDigest` (FNV-1a).

Same input → same session + digest. No storage, fetch, persistence, or side effects.
