/**
 * STUDIO DEV PREVIEW ISOLATED RUNTIME — public surface (dev-only / headless / isolated).
 *
 * This subtree IS the dev-only isolated runtime the prior plan described
 * (`isolatedRuntimeImplemented: true`), but it renders NO UI. It consumes the upstream contracts
 * (implementation plan → runtime shell → visual → bridge → sandbox) and produces a deterministic
 * VIRTUAL PREVIEW FRAME in pure JSON/metadata from synthetic data only. It creates NO React
 * component / `.jsx` / `.tsx` / `.css` / DOM / runtime CSS, wires NO route / menu, generates NO
 * module, and never touches backend / Prisma / migration / network / production / staging, never
 * mutates, never persists, never reads/writes real data, never rewrites Empresas. Nothing here
 * is auto-consumed by the app; it is reversible by non-consumption. It authorizes NO UI runtime
 * and NO route/menu integration — only a future, separately-approved slice may.
 */

export {
  ISOLATED_RUNTIME_NAME,
  ISOLATED_RUNTIME_SEMVER,
  ISOLATED_RUNTIME_VERSION,
  ISOLATED_RUNTIME_MODE,
  ISOLATED_RUNTIME_ENVIRONMENT,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  MANUAL_GATE_NAME,
  MANUAL_GATE_STATUS,
  ISOLATED_RUNTIME_LIFECYCLE_STEPS,
  ISOLATED_RUNTIME_EVENT_KINDS,
  ISOLATED_RUNTIME_READINESS_STATES,
  ISOLATED_RUNTIME_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FRAME_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_COMPATIBILITY_CHECK_FLAG,
  runtimeDigest,
  isStudioDevPreviewIsolatedRuntimeEnabled,
  isStudioDevPreviewIsolatedRuntimeFrameEnabled,
  isStudioDevPreviewIsolatedRuntimeVerifyEnabled,
  isStudioDevPreviewIsolatedRuntimeCompatibilityCheckEnabled,
} from './isolatedRuntimeConfig.js';

export {
  ISOLATED_RUNTIME_ERROR_CODES,
  IsolatedRuntimeError,
  createIsolatedRuntimeError,
  isolatedRuntimeError,
} from './errors.js';

export { createIsolatedRuntimeSession } from './createIsolatedRuntimeSession.js';
export { createIsolatedRuntimePreflight } from './createIsolatedRuntimePreflight.js';
export { createIsolatedRuntimeContractLoader } from './createIsolatedRuntimeContractLoader.js';
export { createIsolatedRuntimeSyntheticDataProvider } from './createIsolatedRuntimeSyntheticDataProvider.js';
export { createIsolatedRuntimePlaceholderResolver } from './createIsolatedRuntimePlaceholderResolver.js';
export { createIsolatedRuntimeVirtualFrame } from './createIsolatedRuntimeVirtualFrame.js';
export { createIsolatedRuntimeLifecycleExecutor } from './createIsolatedRuntimeLifecycleExecutor.js';
export { createIsolatedRuntimeEventDispatcher } from './createIsolatedRuntimeEventDispatcher.js';
export { createIsolatedRuntimeRenderRequestExecutor } from './createIsolatedRuntimeRenderRequestExecutor.js';
export { createIsolatedRuntimeStateContainer } from './createIsolatedRuntimeStateContainer.js';
export { createIsolatedRuntimePermissionEnforcer } from './createIsolatedRuntimePermissionEnforcer.js';
export { createIsolatedRuntimeDataBoundary } from './createIsolatedRuntimeDataBoundary.js';
export { createIsolatedRuntimeIsolationBoundary } from './createIsolatedRuntimeIsolationBoundary.js';
export { createIsolatedRuntimeManualGate } from './createIsolatedRuntimeManualGate.js';
export { createIsolatedRuntimeSafetyPolicy } from './createIsolatedRuntimeSafetyPolicy.js';
export { createIsolatedRuntimeManifest } from './createIsolatedRuntimeManifest.js';
export { verifyIsolatedRuntime } from './verifyIsolatedRuntime.js';
export { checkIsolatedRuntimeCompatibility } from './checkIsolatedRuntimeCompatibility.js';
export { createIsolatedRuntimeDiagnostics } from './createIsolatedRuntimeDiagnostics.js';
export { createIsolatedRuntimeFallback } from './createIsolatedRuntimeFallback.js';
export { createStudioDevPreviewIsolatedRuntime } from './createStudioDevPreviewIsolatedRuntime.js';

export { default } from './createStudioDevPreviewIsolatedRuntime.js';
