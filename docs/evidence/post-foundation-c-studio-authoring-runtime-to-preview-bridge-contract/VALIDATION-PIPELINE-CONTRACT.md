# Validation Pipeline Contract

> Slice: **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Contract** (`studio-authoring-runtime-to-preview-bridge-contract@1.0.0`)
> Mode: **headless_authoring_runtime_to_preview_bridge_contract** — HEADLESS · CONTRACT-ONLY · METADATA-ONLY · SYNTHETIC-ONLY · DETERMINISTIC · FAIL-CLOSED · READ-ONLY over upstreams.
> Subtree: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/`

Thirteen fixed-order, deterministic, **fail-closed** stages with no auto-correction and no permissive fallback: source shape/identity/version/digest/synthetic-boundary/ssot-boundary, mapping, target version/shape, product-exposure, module-generation, certification-boundary, prototype-reference. `blocker`/`error` issues block both the bridge and the preview-sandbox handoff. The validation runtime is a future slice.

## What this slice does NOT do

This slice implements **no** bridge, adapter, source-validation runtime, target payload or preview mount. It creates **no** UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring. It never persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging, reads or writes real data, generates or registers a module, certifies/self-certifies/overwrites the certified SSOT, integrates a permission/tenant model, or relinks the old Studio prototype. The certified blueprint remains the canonical SSOT.
