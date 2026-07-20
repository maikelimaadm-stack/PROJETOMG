# Quality & Risk Notes

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

The correction removes a fail-closed dead-end (literal implementation would have rejected all real handoffs) by grounding the model in the real handoff via a live round-trip test. Residual risks noted: FNV-1a is not cryptographic (a cryptographic digest is required before certification/production); stricter bridge resource limits may reject some runtime-valid handoffs by design (non-silent, deterministic blocker); the runtime remains the source of truth for the serializer/digest and must not be forked. No behavior is added to the product; the change is reversible by non-consumption.

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
