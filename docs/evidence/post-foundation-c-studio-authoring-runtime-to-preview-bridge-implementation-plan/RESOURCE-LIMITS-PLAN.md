# Resource Limits Plan

> Slice: **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Implementation Plan** (`studio-authoring-runtime-to-preview-bridge-implementation-plan@1.0.0`)
> Mode: **headless_authoring_runtime_to_preview_bridge_implementation_plan** — HEADLESS · CONTRACT-ONLY · METADATA-ONLY · PLAN-ONLY · SYNTHETIC-ONLY · DETERMINISTIC · FAIL-CLOSED · READ-ONLY over upstreams.
> Subtree: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-implementation-plan/`

Plans bounded resource limits across 7 dimensions (maxSourcePayloadBytes, maxSourceFields, maxSourceLayoutSections, maxSourceRelationships, maxValidationIssues, maxExtensions, maxStringLength). Concrete default values are **planned**, not executed. Unknown dimensions rejected; no silent truncation; limit-exceeded fails closed. `resourceLimitsImplemented` = false.

## Plan, not implementation

This slice is a **plan**, not an implementation. Every phase is `planned`, none `implemented` or `completed`. It implements **no** bridge, adapter, source validator, target payload builder or preview mount. It creates **no** UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring. It never persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging, reads or writes real data, generates or registers a module, certifies/self-certifies/overwrites the certified SSOT, integrates a permission/tenant model, or relinks the old Studio prototype. The certified blueprint remains the canonical SSOT. Permission/Tenancy remains obligatory before any product exposure.


---

## Aligned by Source-Shape Correction (post-#482/#483)

This contract/plan was realigned to the **real** Authoring Runtime synthetic handoff shape: source fields use real names only — explicit `handoffVersion`/`runtimeVersion`/`targetSandboxVersion` and `handoffDigest` — with **no** aggregated `upstreamVersions` and **no** generic `digest`. The digest is validated by `recompute_and_compare` over the runtime serializer/preimage. See `docs/evidence/post-foundation-c-studio-authoring-runtime-to-preview-bridge-source-shape-alignment/`.
