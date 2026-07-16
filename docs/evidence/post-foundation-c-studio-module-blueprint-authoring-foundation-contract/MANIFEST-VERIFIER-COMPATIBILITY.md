# Manifest, Verifier, Compatibility

## Manifest
`createAuthoringFoundationManifest(...)` emits deterministic FNV-1a digests for every part: session,
draft/field/layout/relationship descriptors, validation issue, lifecycle, operation catalog,
invariants, preview handoff, certification-candidate handoff, SSOT boundary, permission/tenancy
boundary, prototype prohibition, manual gate, safety, readiness, plus `manifestDigest`. Capabilities
mirrored; `metadataOnly:true`.

## Verifier (fail-closed)
`verifyAuthoringFoundationContract(...)` flags any violation as a blocker: `draftIsCanonical` true,
`certifiedBlueprintRemainsSsot` false, authoring runtime/UI/editor/persistence implemented, module
generation/files/registration, backend/Prisma, production/staging, fetch/mutation, real data,
product exposure/menu/route, prototype relink, SSOT inversion, self-certification,
permission/tenancy claimed integrated without a foundation, any forbidden lifecycle state present,
missing manual gate.

## Compatibility
`checkAuthoringFoundationCompatibility(...)` returns `compatibleWithBlueprintContract`,
`compatibleWithBlueprintEngine`, `compatibleWithModuleReferencePlanner`,
`compatibleWithPreviewSandbox` = true, all later readiness = false, and
`status: ready_for_future_authoring_implementation_plan_after_explicit_authorization`. Mismatch →
warning.
