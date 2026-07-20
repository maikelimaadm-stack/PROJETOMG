# Certification Report — Bridge Source-Shape Alignment

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

## Summary

The Fable 5 pre-implementation audit found the merged bridge contract/plan expected source fields that the real handoff never emits (`upstreamVersions`, generic `digest`) and missed the real ones (`handoffVersion`/`runtimeVersion`/`targetSandboxVersion`, `handoffDigest`). A literal implementation would fail closed and reject every real handoff. This slice realigns the contract and plan to the **real** handoff shape (verified against the runtime source of truth), adds a real round-trip test, exact version/digest semantics and resource-limit coherence — and keeps the bridge itself unimplemented.

## Result

- Contract composes green from a REAL handoff: readiness ready, 0 blockers, verification ok.
- Plan composes green from the corrected contract: readiness ready, 0 blockers.
- `readyForBridgeImplementationEnterpriseRevalidation` = true on both; `readyForBridgeImplementationSlice` = false.

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
