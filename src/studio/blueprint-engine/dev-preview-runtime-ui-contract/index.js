/**
 * STUDIO DEV PREVIEW RUNTIME UI CONTRACT — public surface (headless / contract-only).
 *
 * This subtree consumes a Dev Preview Isolated Runtime's virtual preview frame and produces the
 * deterministic CONTRACT of a future UI runtime — UI node / layout / component-binding /
 * interaction-binding / render-boundary / state / accessibility / theme projections and
 * blocked-action metadata. It is pure metadata: it renders NO UI, creates NO React component /
 * `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route / menu, generates NO module,
 * implements NO UI runtime, and never touches backend / Prisma / migration / network /
 * production / staging, never mutates, never persists, never reads/writes real data, never
 * rewrites Empresas. Nothing here is auto-consumed by the app; it is reversible by
 * non-consumption. It authorizes NO UI runtime implementation and NO route/menu integration.
 */

export {
  RUNTIME_UI_CONTRACT_NAME,
  RUNTIME_UI_CONTRACT_SEMVER,
  RUNTIME_UI_CONTRACT_VERSION,
  RUNTIME_UI_CONTRACT_MODE,
  RUNTIME_UI_CONTRACT_ENVIRONMENT,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  UI_NODE_KINDS,
  BLOCKED_ACTION_KINDS,
  INTERACTION_KINDS,
  RUNTIME_UI_CONTRACT_READINESS_STATES,
  RUNTIME_UI_CONTRACT_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_NODES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG,
  uiContractDigest,
  isStudioDevPreviewRuntimeUiContractEnabled,
  isStudioDevPreviewRuntimeUiNodesEnabled,
  isStudioDevPreviewRuntimeUiVerifyEnabled,
  isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled,
} from './runtimeUiContractConfig.js';

export {
  RUNTIME_UI_CONTRACT_ERROR_CODES,
  RuntimeUiContractError,
  createRuntimeUiContractError,
  runtimeUiContractError,
} from './errors.js';

export { createRuntimeUiContractSession } from './createRuntimeUiContractSession.js';
export { createRuntimeUiVirtualFrameMapping } from './createRuntimeUiVirtualFrameMapping.js';
export { createRuntimeUiNodeContract } from './createRuntimeUiNodeContract.js';
export { createRuntimeUiLayoutContract } from './createRuntimeUiLayoutContract.js';
export { createRuntimeUiComponentBindingContract } from './createRuntimeUiComponentBindingContract.js';
export { createRuntimeUiInteractionBindingContract } from './createRuntimeUiInteractionBindingContract.js';
export { createRuntimeUiRenderBoundaryContract } from './createRuntimeUiRenderBoundaryContract.js';
export { createRuntimeUiStateProjectionContract } from './createRuntimeUiStateProjectionContract.js';
export { createRuntimeUiAccessibilityProjectionContract } from './createRuntimeUiAccessibilityProjectionContract.js';
export { createRuntimeUiThemeProjectionContract } from './createRuntimeUiThemeProjectionContract.js';
export { createRuntimeUiBlockedActionContract } from './createRuntimeUiBlockedActionContract.js';
export { createRuntimeUiSafetyPolicy } from './createRuntimeUiSafetyPolicy.js';
export { createRuntimeUiReadinessDecision } from './createRuntimeUiReadinessDecision.js';
export { createRuntimeUiManifest } from './createRuntimeUiManifest.js';
export { verifyRuntimeUiContract } from './verifyRuntimeUiContract.js';
export { checkRuntimeUiContractCompatibility } from './checkRuntimeUiContractCompatibility.js';
export { createRuntimeUiDiagnostics } from './createRuntimeUiDiagnostics.js';
export { createRuntimeUiFallback } from './createRuntimeUiFallback.js';
export { createStudioDevPreviewRuntimeUiContract } from './createStudioDevPreviewRuntimeUiContract.js';

export { default } from './createStudioDevPreviewRuntimeUiContract.js';
