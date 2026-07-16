# SSOT Boundary

The heart of this foundation's safety model.

```
Authoring Draft            = temporary, NON-CANONICAL structure.
Certified Blueprint Contract = canonical SSOT.
Blueprint Engine           = read-only consumer/validator.
Module Reference Planner   = read-only consumer.
Preview Sandbox            = synthetic handoff destination.
```

`createAuthoringSsotBoundaryContract()` declares: `canonicalSsot:'certified-blueprint-contract'`,
`certifiedBlueprintRemainsSsot:true`, `draftIsCanonical:false`, `draftIsTemporary:true`,
`draftIsNonCanonical:true`, `draftCanBecomeSsot:false`, `draftSelfCertifies:false`,
`draftOverwritesCertifiedContract:false`, `blueprintEngineIsReadOnlyConsumer:true`,
`moduleReferencePlannerIsReadOnlyConsumer:true`, `previewSandboxIsSyntheticDestination:true`,
`ssotPreserved:true`.

A draft may NEVER become the SSOT, self-certify, or overwrite the certified contract. No new SSOT is
created; this foundation consumes existing contracts read-only.
