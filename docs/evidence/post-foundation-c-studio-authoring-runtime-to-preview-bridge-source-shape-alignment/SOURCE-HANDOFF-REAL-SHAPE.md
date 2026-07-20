# Source Handoff — Real Shape

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

The real `createSyntheticPreviewHandoff` emits exactly these fields: `kind`, `handoffKind`, `handoffVersion`, `runtimeVersion`, `targetSandboxVersion`, `draftId`, `draftRevision`, `draftDigest`, `synthetic`, `immutable`, `validated`, `previewPayloadCreated`, `previewMounted`, `realDataAttached`, `routeCreated`, `menuCreated`, `productExposed`, `payload`, `ok`, `handoffDigest`. There is **no** `upstreamVersions` and **no** generic `digest`. The test asserts `REAL_HANDOFF_FIELDS` equals the actual object keys.

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
