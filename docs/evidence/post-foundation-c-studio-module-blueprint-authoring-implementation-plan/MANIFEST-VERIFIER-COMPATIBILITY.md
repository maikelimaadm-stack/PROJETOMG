# Manifest, Verifier, Compatibility

## Manifest
`createAuthoringImplementationPlanManifest(...)` emits deterministic FNV-1a digests for every part
(session, phases, draft/lifecycle/operation/revision runtime plans, validation pipeline, invariant
enforcement, preview handoff, certification-candidate preparation, SSOT protection, permission/tenancy
boundary, persistence + module-generation prohibitions, prototype assertion, test harness, manual gate,
rollout/rollback, observability, governance registry, safety, readiness) plus `manifestDigest`.
Capabilities mirrored; `metadataOnly:true`.

## Verifier (fail-closed)
`verifyAuthoringImplementationPlan(...)` flags any violation as a blocker: any runtime/draft/lifecycle/
executor/revision/validation/invariant/preview/certification implementation, UI/editor, persistence,
module generation, backend/Prisma, production/staging, fetch/mutation, real data, product exposure/
menu/route, prototype relink, permission/tenant/server-auth integration without a foundation, phase
implemented, forbidden lifecycle state, SSOT inversion, self-certification, missing manual gate.

## Compatibility
`checkAuthoringImplementationPlanCompatibility(...)` returns `compatibleWithAuthoringFoundationContract`,
`compatibleWithBlueprintContract`, `compatibleWithBlueprintEngine`,
`compatibleWithModuleReferencePlanner`, `compatibleWithPreviewSandbox` = true, all later readiness =
false, and `status: ready_for_future_authoring_runtime_implementation_slice_after_enterprise_checkpoint`.
Mismatch → warning.
