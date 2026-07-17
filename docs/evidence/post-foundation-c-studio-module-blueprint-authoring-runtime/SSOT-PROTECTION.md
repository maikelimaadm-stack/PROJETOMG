# SSOT Protection

`createAuthoringRuntimeSsotBoundary()`: the **certified Blueprint Contract remains the canonical SSOT**.

`canonicalSsot: certified-blueprint-contract`, `certifiedBlueprintRemainsSsot:true`,
`draftIsCanonical:false`, `candidateIsCanonical:false`, `selfCertificationAllowed:false`,
`authoringMayOverwriteCertifiedBlueprint:false`, `authoringMayBypassCertification:false`,
`engineConsumedReadOnly:true`, `plannerConsumedReadOnly:true`, `previewSandboxConsumedReadOnly:true`,
`secondSsotCreated:false`.

The runtime never certifies, self-certifies, publishes, registers, generates a module, writes files,
or alters the certified contract/engine/planner/preview sandbox. Drafts and candidates are always
non-canonical.
