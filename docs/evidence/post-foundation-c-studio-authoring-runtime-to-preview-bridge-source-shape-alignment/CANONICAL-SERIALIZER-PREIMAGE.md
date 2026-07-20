# Canonical Serializer & Preimage

> Slice: **Post-Foundation C — Studio Bridge Source-Shape Alignment Correction**
> Fable 5 decision: **READY_WITH_BRIDGE_PLAN_CORRECTIONS_REQUIRED** — the real bridge is NOT authorized.
> Aligns the merged bridge contract (#482) + implementation plan (#483) to the REAL Authoring Runtime synthetic handoff shape. Headless · contract/plan-only · deterministic · fail-closed · read-only over upstreams.

- **Serializer**: `stableSerialize` — `src/studio/blueprint-engine/module-blueprint-authoring-runtime/stableSerialize.js` (recursive, key-sorted JSON; arrays preserve order; functions/undefined/symbol dropped).
- **Digest helper**: `createDeterministicDigest` — `.../createDeterministicDigest.js` (FNV-1a → `fnv1a-` + 8 hex over the stable serialization).
- **Preimage**: the handoff `core` object = every real handoff field **except** `handoffDigest` itself (`handoffDigest` is excluded from its own preimage).
- **Canonicalization**: key-sorted, array-order preserved, locale/timezone independent, no clock/randomness.

The future bridge must reuse this exact serializer/digest **read-only** — `alternativeSerializerAllowed` = false.

## Still blocked

This correction implements **no** bridge, adapter, source validator, target payload builder or preview mount; every plan phase stays `planned`, none `implemented`. No UI/editor/React/`.jsx`/`.tsx`/`.css`; no App/route/menu; no persistence/storage/filesystem; no backend/Prisma/migration; no network; no real data; no module generation/registration; no certification; no product/production/staging exposure; no old Studio prototype relink; no permission/tenancy integration. The runtime and the Preview Sandbox are consumed **read-only** and are **not altered**. The certified blueprint remains the canonical SSOT. A repeat FABLE 5 pre-implementation checkpoint is required before any real bridge.
