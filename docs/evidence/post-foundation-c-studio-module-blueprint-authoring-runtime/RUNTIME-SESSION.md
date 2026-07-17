# Runtime Session

`createAuthoringRuntimeSession(config)` returns a **deterministic, isolated, in-memory** session
derived ONLY from an explicit `seed` (never a clock/random). Each call is a fresh, frozen, per-instance
object — NOT a global singleton (`usesGlobalSingleton: false`).

Fields: `sessionId` (deterministic), `sessionVersion`, `seed`, `sourceVersions`, `synthetic:true`,
`ephemeral:true`, `persistent:false`, `canonical:false`, `sideEffectFree:true`,
`createdFromExplicitSeed:true`, `drafts`, `draftCount`, `operationCount`, `revisionCountTotal`,
`limits`, `status`, `sessionDigest`.

Same seed → same session + digest. Two seeds → isolated sessions. Operations never mutate the input
session; they return a new frozen session.
