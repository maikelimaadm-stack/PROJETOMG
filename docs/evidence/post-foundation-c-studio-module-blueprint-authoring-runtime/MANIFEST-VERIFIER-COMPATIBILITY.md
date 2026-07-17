# Manifest, Verifier, Compatibility

## Manifest
`createAuthoringRuntimeManifest(...)` emits deterministic FNV-1a digests for every part: session,
limits, lifecycle, operations, revisions, validation, invariants, preview handoff, candidate
preparation, discard, SSOT boundary, permission/tenancy boundary, safety, readiness, diagnostics, plus
`manifestDigest`. Capabilities mirrored.

## Verifier (fail-closed)
`verifyAuthoringRuntime(...)` flags any violation as a blocker: any UI/editor/persistence/storage/
filesystem/module/backend/prisma/production/fetch/network/real-data/product/prototype/permission-tenant
capability true; draft/candidate canonical; SSOT inversion/overwrite/bypass; second SSOT;
self-certification; forbidden lifecycle state; unknown-transition accepted; operations not allow-list;
unknown-op accepted; operation effects; negative revision; revision mutation/persistence; validation
not fail-closed; preview mounted/real-data; candidate certified/self-cert; permission/tenant/server-auth
integration; missing manual gate; and any embedded nondeterministic source
(`Date.now`/`new Date`/`Math.random`/`crypto.randomUUID`/`randomUUID`). `verifyAuthoringOperationOutcome`
detects input-session mutation and revision regression.

## Compatibility
`checkAuthoringRuntimeCompatibility(...)` returns compatibility with the implementation plan, foundation
contract, blueprint contract/engine, planner and preview sandbox = true; all later readiness = false;
`status: authoring_runtime_ready_for_headless_synthetic_validation_only`. Mismatch → warning.
