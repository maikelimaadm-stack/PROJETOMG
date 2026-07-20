# Corrected Field Mappings

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

12 deterministic mappings, every sourceField real: handoffKind→sourceHandoffKind, draftId→candidateDraftId, draftRevision→candidateDraftRevision, draftDigest→candidateDraftDigest, runtimeVersion→sourceRuntimeVersion, handoffVersion→sourceHandoffVersion, targetSandboxVersion→sourceTargetSandboxVersion, synthetic→synthetic (assert_true), immutable→immutable (assert_true), validated→validated (assert_true), payload→syntheticPayload (clone_synthetic), handoffDigest→sourceDigest.

Guarantees: `everyMappingSourceExistsInRealHandoff` = true, `anyInventedSourceField` = false, `anyLegacyAliasSourceField` = false, `noDuplicateSourceField/TargetField` = true, `anyCriticalDefault/anyLossyCritical/anyUnknownTransform` = false. Count derives from the real model (not artificially preserved at 11).

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
