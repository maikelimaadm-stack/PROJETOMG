# Plan Session — `createAppIntegrationImplementationPlanSession`

Deterministic session derived from the upstream App integration contract. Pure — no storage, no
fetch, no persistence, no side-effects. Exposes identity, version chain and a stable fnv1a
`sessionDigest`. Equal inputs yield an equal digest.
