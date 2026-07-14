/**
 * STUDIO DEV PREVIEW RUNTIME SHELL CONTRACT — public surface (headless / contract-only).
 *
 * This subtree consumes a Dev Preview Visual Contract and produces the deterministic CONTRACT
 * of a future dev-preview runtime shell — lifecycle, mount boundary, events, render request,
 * state / error / permission / data boundaries, isolation and policy. It is pure metadata: it
 * renders NO UI, creates NO React component / `.jsx` / `.tsx` / DOM / runtime CSS, mounts
 * NOTHING, wires NO route / menu, generates NO module, writes NO file under `src/modules`, and
 * never touches backend / Prisma / migration / network / production / staging, never mutates,
 * never persists, never rewrites Empresas. Nothing here is auto-consumed by the app; it is
 * reversible by non-consumption. It authorizes NO runtime implementation — only a future,
 * separately-approved slice may.
 */

export {
  RUNTIME_SHELL_CONTRACT_NAME,
  RUNTIME_SHELL_CONTRACT_SEMVER,
  RUNTIME_SHELL_CONTRACT_VERSION,
  RUNTIME_SHELL_CONTRACT_MODE,
  RUNTIME_SHELL_CONTRACT_ENVIRONMENT,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  RUNTIME_SHELL_LIFECYCLE_PHASES,
  RUNTIME_SHELL_EVENT_KINDS,
  ALLOWED_MOUNT_TARGET_KINDS,
  BLOCKED_MOUNT_TARGET_KINDS,
  ALLOWED_STATE_KINDS,
  BLOCKED_STATE_KINDS,
  RUNTIME_SHELL_READINESS_STATES,
  RUNTIME_SHELL_HEADLESS_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_LIFECYCLE_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_COMPATIBILITY_CHECK_FLAG,
  shellDigest,
  isStudioDevPreviewRuntimeShellContractEnabled,
  isStudioDevPreviewRuntimeShellLifecycleEnabled,
  isStudioDevPreviewRuntimeShellVerifyEnabled,
  isStudioDevPreviewRuntimeShellCompatibilityCheckEnabled,
} from './devPreviewRuntimeShellContractConfig.js';

export {
  RUNTIME_SHELL_ERROR_CODES,
  DevPreviewRuntimeShellContractError,
  createDevPreviewRuntimeShellContractError,
  devPreviewRuntimeShellContractError,
} from './errors.js';

export { createDevPreviewRuntimeShellSession } from './createDevPreviewRuntimeShellSession.js';
export { createDevPreviewRuntimeShellLifecycleContract } from './createDevPreviewRuntimeShellLifecycleContract.js';
export { createDevPreviewRuntimeShellMountBoundary } from './createDevPreviewRuntimeShellMountBoundary.js';
export { createDevPreviewRuntimeShellEventContract } from './createDevPreviewRuntimeShellEventContract.js';
export { createDevPreviewRuntimeShellRenderRequestContract } from './createDevPreviewRuntimeShellRenderRequestContract.js';
export { createDevPreviewRuntimeShellStateBoundary } from './createDevPreviewRuntimeShellStateBoundary.js';
export { createDevPreviewRuntimeShellErrorBoundary } from './createDevPreviewRuntimeShellErrorBoundary.js';
export { createDevPreviewRuntimeShellPermissionBoundary } from './createDevPreviewRuntimeShellPermissionBoundary.js';
export { createDevPreviewRuntimeShellDataBoundary } from './createDevPreviewRuntimeShellDataBoundary.js';
export { createDevPreviewRuntimeShellIsolationContract } from './createDevPreviewRuntimeShellIsolationContract.js';
export { createDevPreviewRuntimeShellPolicyContract } from './createDevPreviewRuntimeShellPolicyContract.js';
export { createDevPreviewRuntimeShellRouteBlockedMetadata } from './createDevPreviewRuntimeShellRouteBlockedMetadata.js';
export { createDevPreviewRuntimeShellPlacementBlockedMetadata } from './createDevPreviewRuntimeShellPlacementBlockedMetadata.js';
export { createDevPreviewRuntimeShellSafetyMetadata } from './createDevPreviewRuntimeShellSafetyMetadata.js';
export { createDevPreviewRuntimeShellReadinessDecision } from './createDevPreviewRuntimeShellReadinessDecision.js';
export { createDevPreviewRuntimeShellManifest } from './createDevPreviewRuntimeShellManifest.js';
export { verifyDevPreviewRuntimeShellContract } from './verifyDevPreviewRuntimeShellContract.js';
export { checkDevPreviewRuntimeShellCompatibility } from './checkDevPreviewRuntimeShellCompatibility.js';
export { createDevPreviewRuntimeShellDiagnostics } from './createDevPreviewRuntimeShellDiagnostics.js';
export { createDevPreviewRuntimeShellFallback } from './createDevPreviewRuntimeShellFallback.js';
export { createStudioDevPreviewRuntimeShellContract } from './createStudioDevPreviewRuntimeShellContract.js';

export { default } from './createStudioDevPreviewRuntimeShellContract.js';
