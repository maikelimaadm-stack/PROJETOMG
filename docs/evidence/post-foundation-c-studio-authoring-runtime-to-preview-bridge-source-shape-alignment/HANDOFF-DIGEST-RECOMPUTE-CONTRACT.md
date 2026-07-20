# Handoff Digest Recompute Contract

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

`sourceDigestField` = `handoffDigest`; `digestValidationMode` = `recompute_and_compare`; `sourceDigestAlgorithm` = `fnv1a-32`; `sourceDigestPurpose` = `deterministic_internal_identity`. Validation recomputes `createDeterministicDigest(handoff-minus-handoffDigest)` and compares to `handoffDigest`. FNV-1a is internal-only: `cryptographicIntegrityProvided` = false; `digestMayAuthorizeCertification/ModuleGeneration/Production` = false; a cryptographic digest is required before certification/production. The live test proves the recompute reproduces the real `handoffDigest` and detects tampering.

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
