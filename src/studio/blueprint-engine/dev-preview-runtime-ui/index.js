/**
 * STUDIO DEV PREVIEW RUNTIME UI — public surface (dev-only / isolated).
 *
 * This subtree is the first REAL, ISOLATED UI runtime of the Studio dev preview. Real React/JSX
 * lives ONLY in the sibling `.jsx` files (RuntimeUiRoot/Screen/Section/Slot/Placeholder/
 * BlockedActionBanner/Fallback). This `index.js` intentionally exports only the pure `.js` API
 * (config, composer, part builders, verifier, compatibility, diagnostics, manifest, fallback) so
 * the module graph stays JSX-free and importable by the plain `node --test` runner; the renderable
 * `.jsx` components are imported directly (by a future, separately-authorized route/menu slice),
 * never mounted here. Nothing wires App / routes / menu / modules, uses ReactDOM / createRoot /
 * window / document, touches backend / Prisma / migration / network / production / staging, mutates,
 * persists, reads/writes real data, rewrites Empresas, or imports the old Studio prototype.
 * Reversible by non-consumption.
 */

export {
  RUNTIME_UI_NAME,
  RUNTIME_UI_SEMVER,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_MODE,
  RUNTIME_UI_ENVIRONMENT,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  RUNTIME_UI_COMPONENT_NAMES,
  RUNTIME_UI_INTERACTION_KINDS,
  RUNTIME_UI_BLOCKED_ACTION_KINDS,
  FORBIDDEN_PROTOTYPE_IMPORT_PREFIXES,
  RUNTIME_UI_READINESS_STATES,
  RUNTIME_UI_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_RENDER_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG,
  runtimeUiDigest,
  isProductionEnv,
  isStudioDevPreviewRuntimeUiEnabled,
  isStudioDevPreviewRuntimeUiRenderEnabled,
  isStudioDevPreviewRuntimeUiVerifyEnabled,
  isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled,
} from './runtimeUiConfig.js';

export {
  RUNTIME_UI_ERROR_CODES,
  RuntimeUiError,
  createRuntimeUiError,
  runtimeUiError,
} from './errors.js';

export { createRuntimeUiSession } from './createRuntimeUiSession.js';
export { createRuntimeUiPreflight } from './createRuntimeUiPreflight.js';
export { createRuntimeUiContractLoader } from './createRuntimeUiContractLoader.js';
export { createRuntimeUiVirtualFrameInput } from './createRuntimeUiVirtualFrameInput.js';
export { createRuntimeUiDevFlagGate } from './createRuntimeUiDevFlagGate.js';
export { createRuntimeUiIsolationBoundary } from './createRuntimeUiIsolationBoundary.js';
export { createRuntimeUiComponentRegistry } from './createRuntimeUiComponentRegistry.js';
export { createRuntimeUiInteractionRegistry } from './createRuntimeUiInteractionRegistry.js';
export { createRuntimeUiStateProjection } from './createRuntimeUiStateProjection.js';
export { createRuntimeUiAccessibilityProjection } from './createRuntimeUiAccessibilityProjection.js';
export { createRuntimeUiThemeProjection } from './createRuntimeUiThemeProjection.js';
export { createRuntimeUiBlockedActionModel } from './createRuntimeUiBlockedActionModel.js';
export { createRuntimeUiReactTree } from './createRuntimeUiReactTree.js';
export { createRuntimeUiManifest } from './createRuntimeUiManifest.js';
export { verifyRuntimeUi } from './verifyRuntimeUi.js';
export { checkRuntimeUiCompatibility } from './checkRuntimeUiCompatibility.js';
export { createRuntimeUiDiagnostics } from './createRuntimeUiDiagnostics.js';
export { createRuntimeUiFallback } from './createRuntimeUiFallback.js';
export { createStudioDevPreviewRuntimeUi } from './createStudioDevPreviewRuntimeUi.js';

export { default } from './createStudioDevPreviewRuntimeUi.js';
