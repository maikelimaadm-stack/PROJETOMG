# SSOT Protection Plan

The heart of this plan's safety model.

```
Authoring Draft            = temporary, NON-CANONICAL.
Certified Blueprint Contract = canonical SSOT.
Blueprint Engine           = read-only consumer.
Module Reference Planner   = read-only consumer.
Preview Sandbox            = synthetic destination.
```

`createSsotProtectionPlan()`: `canonicalSsot: certified-blueprint-contract`,
`certifiedBlueprintRemainsSsot:true`, `draftIsCanonical:false`, `candidateIsCanonical:false`,
`authoringMayOverwriteCertifiedBlueprint:false`, `authoringMayBypassCertification:false`,
`engineConsumedReadOnly:true`, `plannerConsumedReadOnly:true`, `previewSandboxConsumedReadOnly:true`.

A draft or candidate may NEVER become the SSOT, self-certify, or overwrite the certified contract.
