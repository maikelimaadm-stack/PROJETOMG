/**
 * STUDIO DEV PREVIEW CONTRACT BRIDGE — public surface (headless / contract-only).
 *
 * This subtree transforms a Module Preview Sandbox contract into deterministic dev-preview
 * render / layout / screen / adapter CONTRACTS. It is pure metadata: it renders NO UI,
 * creates NO React component / `.jsx` / `.tsx`, wires NO route / menu, generates NO module,
 * writes NO file under `src/modules`, and never touches backend / Prisma / migration /
 * network / production / staging, never mutates, never persists, never rewrites Empresas.
 * Nothing here is auto-consumed by the app; it is reversible by non-consumption.
 */

export {
  DEV_PREVIEW_BRIDGE_NAME,
  DEV_PREVIEW_BRIDGE_SEMVER,
  DEV_PREVIEW_BRIDGE_VERSION,
  DEV_PREVIEW_BRIDGE_MODE,
  DEV_PREVIEW_BRIDGE_ENVIRONMENT,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  ALLOWED_COMPONENT_KINDS,
  BLOCKED_COMPONENT_KINDS,
  DEV_PREVIEW_BRIDGE_READINESS_STATES,
  DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RENDER_SCHEMA_FLAG,
  MAK_STUDIO_DEV_PREVIEW_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_COMPATIBILITY_CHECK_FLAG,
  bridgeDigest,
  isStudioDevPreviewContractBridgeEnabled,
  isStudioDevPreviewRenderSchemaEnabled,
  isStudioDevPreviewVerifyEnabled,
  isStudioDevPreviewCompatibilityCheckEnabled,
} from './devPreviewBridgeConfig.js';

export {
  DEV_PREVIEW_BRIDGE_ERROR_CODES,
  DevPreviewBridgeError,
  createDevPreviewBridgeError,
  devPreviewBridgeError,
} from './errors.js';

export { createDevPreviewBridgeSession } from './createDevPreviewBridgeSession.js';
export { createDevPreviewRenderSchema } from './createDevPreviewRenderSchema.js';
export { createDevPreviewLayoutSchema } from './createDevPreviewLayoutSchema.js';
export { createDevPreviewScreenSchema } from './createDevPreviewScreenSchema.js';
export { createDevPreviewTableBridgeSchema } from './createDevPreviewTableBridgeSchema.js';
export { createDevPreviewFormBridgeSchema } from './createDevPreviewFormBridgeSchema.js';
export { createDevPreviewDetailBridgeSchema } from './createDevPreviewDetailBridgeSchema.js';
export { createDevPreviewFieldBridgeSchema } from './createDevPreviewFieldBridgeSchema.js';
export { createDevPreviewActionBridgeSchema } from './createDevPreviewActionBridgeSchema.js';
export { createDevPreviewPermissionBridgeSchema } from './createDevPreviewPermissionBridgeSchema.js';
export { createDevPreviewAllowedComponentContract } from './createDevPreviewAllowedComponentContract.js';
export { createDevPreviewVisualAdapterContract } from './createDevPreviewVisualAdapterContract.js';
export { createDevPreviewRoutePlanMetadata } from './createDevPreviewRoutePlanMetadata.js';
export { createDevPreviewMenuPlanMetadata } from './createDevPreviewPlacementPlanMetadata.js';
export { createDevPreviewRuntimeSafetyMetadata } from './createDevPreviewRuntimeSafetyMetadata.js';
export { createDevPreviewReadinessDecision } from './createDevPreviewReadinessDecision.js';
export { createDevPreviewBridgeManifest } from './createDevPreviewBridgeManifest.js';
export { verifyDevPreviewBridgeContract } from './verifyDevPreviewBridgeContract.js';
export { checkDevPreviewBridgeCompatibility } from './checkDevPreviewBridgeCompatibility.js';
export { createDevPreviewBridgeDiagnostics } from './createDevPreviewBridgeDiagnostics.js';
export { createDevPreviewBridgeFallback } from './createDevPreviewBridgeFallback.js';
export { createStudioDevPreviewContractBridge } from './createStudioDevPreviewContractBridge.js';

export { default } from './createStudioDevPreviewContractBridge.js';
