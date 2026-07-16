# Plan Session

`createAuthoringImplementationPlanSession({ authoringFoundationContract })` builds a **deterministic**,
plan-only session referencing the foundation contract read-only.

Fields: `sessionId` (deterministic), `sourceAuthoringFoundationContract`, `sourceBlueprintContract`,
`sourceBlueprintEngine`, `planOnly:true`, `consumesUpstreamReadOnly:true`,
`usesStorage/usesFetch/usesPersistence:false`, `runtimeSideEffects:false`, `sessionDigest` (FNV-1a).

Same input → same session + digest. No storage, fetch, persistence, or side effects.
