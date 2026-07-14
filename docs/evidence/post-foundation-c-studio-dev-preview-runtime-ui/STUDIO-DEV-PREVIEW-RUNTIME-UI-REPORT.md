# Studio Dev Preview Runtime UI — Report

Dev-only, isolated UI runtime. Real React/JSX confined to `src/studio/blueprint-engine/dev-preview-runtime-ui/`.

## Upstream chain (read-only)
… → Runtime UI Contract (#470) → Runtime UI Implementation Plan (#471) → **(this)** Runtime UI.

## Composer
`createStudioDevPreviewRuntimeUi({ runtimeUiContract, implementationPlan, env })` consumes a valid
Dev Preview Runtime UI Contract and produces the isolated UI's metadata contract. On an
invalid/missing/fallback contract, a failed preflight, or a production/staging env, it returns a
safe fallback and never throws.

## The React graph vs the pure graph
The renderable React lives in the sibling `.jsx` files (RuntimeUiRoot/Screen/Section/Slot/
Placeholder/BlockedActionBanner/Fallback). `index.js` and the composer are pure `.js` and never
import the `.jsx` (keeping the module graph importable by the plain `node --test` runner); the
`.jsx` are referenced by name and never mounted here.

## Output shape (key fields)
- `kind: studio-dev-preview-runtime-ui` · `mode: dev_only_isolated_runtime_ui`
- `readiness: studio_dev_preview_runtime_ui_ready` · `readyForRuntimeUi: true`
- `readyForRouteMenuIntegration: false` · `readyForRealModuleGeneration: false` · `readyForProduction: false`
