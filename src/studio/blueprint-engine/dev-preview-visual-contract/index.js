/**
 * STUDIO DEV PREVIEW VISUAL CONTRACT — public surface (headless / contract-only).
 *
 * This subtree consumes a Dev Preview Contract Bridge and produces deterministic VISUAL
 * tree / screen / component-placeholder / state / interaction / theme-token / accessibility
 * CONTRACTS. It is pure metadata: it renders NO UI, creates NO React component / `.jsx` /
 * `.tsx` / DOM / runtime CSS, wires NO route / menu, generates NO module, writes NO file
 * under `src/modules`, and never touches backend / Prisma / migration / network / production /
 * staging, never mutates, never persists, never rewrites Empresas. Nothing here is
 * auto-consumed by the app; it is reversible by non-consumption. It authorizes NO visual
 * runtime — only a future, separately-approved slice may.
 */

export {
  VISUAL_CONTRACT_NAME,
  VISUAL_CONTRACT_SEMVER,
  VISUAL_CONTRACT_VERSION,
  VISUAL_CONTRACT_MODE,
  VISUAL_CONTRACT_ENVIRONMENT,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  ALLOWED_VISUAL_PLACEHOLDER_KINDS,
  BLOCKED_VISUAL_PLACEHOLDER_KINDS,
  VISUAL_STATE_KINDS,
  VISUAL_INTERACTION_KINDS,
  VISUAL_THEME_TOKEN_GROUPS,
  VISUAL_CONTRACT_READINESS_STATES,
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_TREE_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VISUAL_COMPATIBILITY_CHECK_FLAG,
  visualDigest,
  isStudioDevPreviewVisualContractEnabled,
  isStudioDevPreviewVisualTreeEnabled,
  isStudioDevPreviewVisualVerifyEnabled,
  isStudioDevPreviewVisualCompatibilityCheckEnabled,
} from './devPreviewVisualContractConfig.js';

export {
  VISUAL_CONTRACT_ERROR_CODES,
  DevPreviewVisualContractError,
  createDevPreviewVisualContractError,
  devPreviewVisualContractError,
} from './errors.js';

export { createDevPreviewVisualContractSession } from './createDevPreviewVisualContractSession.js';
export { createDevPreviewVisualTreeContract } from './createDevPreviewVisualTreeContract.js';
export { createDevPreviewVisualScreenContract } from './createDevPreviewVisualScreenContract.js';
export { createDevPreviewVisualSectionContract } from './createDevPreviewVisualSectionContract.js';
export {
  createDevPreviewVisualComponentPlaceholderRegistry,
  isAllowedVisualPlaceholderKind,
} from './createDevPreviewVisualComponentPlaceholderRegistry.js';
export { createDevPreviewVisualStateContract } from './createDevPreviewVisualStateContract.js';
export { createDevPreviewVisualInteractionContract } from './createDevPreviewVisualInteractionContract.js';
export { createDevPreviewVisualThemeTokenContract } from './createDevPreviewVisualThemeTokenContract.js';
export { createDevPreviewVisualValidationContract } from './createDevPreviewVisualValidationContract.js';
export { createDevPreviewVisualAccessibilityContract } from './createDevPreviewVisualAccessibilityContract.js';
export { createDevPreviewVisualRoutePlanMetadata } from './createDevPreviewVisualRoutePlanMetadata.js';
export { createDevPreviewVisualPlacementPlanMetadata } from './createDevPreviewVisualPlacementPlanMetadata.js';
export { createDevPreviewVisualRuntimeSafetyMetadata } from './createDevPreviewVisualRuntimeSafetyMetadata.js';
export { createDevPreviewVisualReadinessDecision } from './createDevPreviewVisualReadinessDecision.js';
export { createDevPreviewVisualContractManifest } from './createDevPreviewVisualContractManifest.js';
export { verifyDevPreviewVisualContract } from './verifyDevPreviewVisualContract.js';
export { checkDevPreviewVisualContractCompatibility } from './checkDevPreviewVisualContractCompatibility.js';
export { createDevPreviewVisualContractDiagnostics } from './createDevPreviewVisualContractDiagnostics.js';
export { createDevPreviewVisualContractFallback } from './createDevPreviewVisualContractFallback.js';
export { createStudioDevPreviewVisualContract } from './createStudioDevPreviewVisualContract.js';

export { default } from './createStudioDevPreviewVisualContract.js';
