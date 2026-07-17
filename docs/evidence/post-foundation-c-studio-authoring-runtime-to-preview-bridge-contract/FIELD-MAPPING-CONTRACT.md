# Field Mapping Contract

> Slice: **Post-Foundation C — Studio Authoring Runtime-to-Preview Bridge Contract** (`studio-authoring-runtime-to-preview-bridge-contract@1.0.0`)
> Mode: **headless_authoring_runtime_to_preview_bridge_contract** — HEADLESS · CONTRACT-ONLY · METADATA-ONLY · SYNTHETIC-ONLY · DETERMINISTIC · FAIL-CLOSED · READ-ONLY over upstreams.
> Subtree: `src/studio/blueprint-engine/authoring-runtime-to-preview-bridge-contract/`

Eleven deterministic source→target mappings. Every critical field is mapped, lossless and uses only an allow-listed transform (`identity`/`assert_true`/`clone_synthetic`). Unknown transforms fail closed; defaults on critical fields and lossy critical mappings are forbidden; silent critical rename is forbidden. Computed guards `anyUnknownTransform`/`anyCriticalDefault`/`anyLossyCritical` are all false and `everyCriticalMapped` is true.

## What this slice does NOT do

This slice implements **no** bridge, adapter, source-validation runtime, target payload or preview mount. It creates **no** UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring. It never persists, writes the filesystem, touches backend/Prisma/migration/network/production/staging, reads or writes real data, generates or registers a module, certifies/self-certifies/overwrites the certified SSOT, integrates a permission/tenant model, or relinks the old Studio prototype. The certified blueprint remains the canonical SSOT.
