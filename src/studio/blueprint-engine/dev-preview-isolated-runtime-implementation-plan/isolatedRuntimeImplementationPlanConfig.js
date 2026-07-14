/**
 * Config + headless flags for the STUDIO DEV PREVIEW ISOLATED RUNTIME IMPLEMENTATION PLAN.
 *
 * Despite the word "implementation" in its name, this layer implements NO runtime. It is
 * HEADLESS and CONTRACT-ONLY: it consumes the Dev Preview Runtime Shell Contract and produces
 * a deterministic PLAN for a future, isolated dev-preview runtime implementation — phases,
 * boundaries, dev-only execution policy, adapter/render/lifecycle/event/data/permission/test/
 * rollout/observability plans. It renders NO UI, creates NO React component, NO `.jsx`/`.tsx`/
 * `.css`, NO DOM, NO runtime CSS, NO route/menu, NO module, implements NO runtime, writes NO
 * file under `src/modules`, and never touches backend/Prisma/migration/network/production/
 * staging, never mutates, never persists, never rewrites Empresas. Default disabled; headless
 * only; nothing is auto-consumed by the app; reversible by non-consumption. It authorizes NO
 * runtime implementation — only a future, separately-approved slice may.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a
 * bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const IMPLEMENTATION_PLAN_NAME = 'studio-dev-preview-isolated-runtime-implementation-plan';
export const IMPLEMENTATION_PLAN_SEMVER = '1.0.0';
export const IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0';
export const IMPLEMENTATION_PLAN_MODE = 'headless_dev_preview_isolated_runtime_implementation_plan';
export const IMPLEMENTATION_PLAN_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The planned implementation phases (metadata-only; none implemented). */
export const IMPLEMENTATION_PHASE_IDS = Object.freeze([
  'phase_0_preflight',
  'phase_1_contract_validation',
  'phase_2_isolation_boundary',
  'phase_3_dev_only_adapter',
  'phase_4_render_pipeline_stub',
  'phase_5_event_boundary_stub',
  'phase_6_test_harness',
  'phase_7_manual_enablement_gate',
  'phase_8_rollout_blocked',
]);

/** Planned lifecycle execution steps (metadata-only; no real runtime). */
export const LIFECYCLE_EXECUTION_STEPS = Object.freeze([
  'created', 'preflight', 'validated', 'blockedForImplementation',
  'readyForFutureSlice', 'failedClosed', 'disposed',
]);

/** Planned event kinds (metadata-only; no real EventEmitter/listener/handler). */
export const EVENT_HANDLING_KINDS = Object.freeze([
  'previewRequested', 'renderRequested', 'renderBlocked', 'interactionRequested',
  'interactionBlocked', 'permissionDenied', 'diagnosticEmitted', 'disposed',
]);

/** Planned render pipeline steps (metadata-only; real render blocked). */
export const RENDER_PIPELINE_STEPS = Object.freeze([
  'validateContracts', 'normalizeVisualTree', 'resolvePlaceholders',
  'prepareRenderRequest', 'blockRealRender', 'emitDiagnostics',
]);

/** Planned test-harness fixture kinds (metadata-only; no real harness). */
export const TEST_HARNESS_FIXTURE_KINDS = Object.freeze([
  'contractFixtures', 'negativeFixtures', 'tamperFixtures', 'forbiddenFlagFixtures',
  'deterministicDigestFixtures', 'noRuntimeSideEffectFixtures',
]);

/** Readiness classifications the plan can emit. */
export const IMPLEMENTATION_PLAN_READINESS_STATES = Object.freeze([
  'studio_dev_preview_isolated_runtime_implementation_plan_ready',
  'ready_for_future_isolated_runtime_implementation_slice_when_explicitly_authorized',
  'needs_runtime_shell_fix', 'needs_visual_contract_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN';
export const MAK_STUDIO_DEV_PREVIEW_IRIP_PHASES_FLAG = 'MAK_STUDIO_DEV_PREVIEW_IRIP_PHASES';
export const MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_IRIP_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_IRIP_COMPATIBILITY_CHECK';

/**
 * Immutable headless capability flags. The `*Only` capabilities are TRUE (contract-only / plan
 * capabilities); every real UI / DOM / CSS / runtime / side-effect / production capability is
 * FALSE. `runtimeImplemented` is FALSE — this slice implements no runtime.
 */
export const IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  planOnly: true,
  implementationPhasesOnly: true,
  isolationBoundaryPlanOnly: true,
  devOnlyExecutionPolicyOnly: true,
  runtimeAdapterPlanOnly: true,
  renderPipelinePlanOnly: true,
  lifecycleExecutionPlanOnly: true,
  eventHandlingPlanOnly: true,
  dataAccessBlockedPlanOnly: true,
  permissionEnforcementPlanOnly: true,
  testHarnessPlanOnly: true,
  rolloutRollbackPlanOnly: true,
  observabilityDiagnosticsPlanOnly: true,
  reactComponentCreated: false,
  jsxCreated: false,
  tsxCreated: false,
  domCreated: false,
  cssCreated: false,
  uiCreated: false,
  routeCreated: false,
  menuCreated: false,
  moduleGenerated: false,
  filesWrittenToModule: false,
  moduleRegistered: false,
  runtimeImplemented: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
  persistenceCreated: false,
  rewriteEmpresas: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function planDigest(value) {
  return createGenericModelChecksum({ value: value ?? null });
}

/** @returns {Record<string, unknown>} */
function resolveEnv() {
  /** @type {Record<string, unknown>} */
  let metaEnv = {};
  try {
    metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  } catch {
    metaEnv = {};
  }
  const proc = (typeof globalThis !== 'undefined' && globalThis.process) ? globalThis.process : undefined;
  const procEnv = proc && proc.env ? proc.env : {};
  return { ...procEnv, ...metaEnv };
}

/** @param {Record<string, unknown>} env @returns {boolean} */
function isProductionEnv(env) {
  if (env.DEV === true || env.DEV === 'true') return false;
  const label = String(env.MAK_ENV_LABEL || env.VITE_ENV_LABEL || '').toLowerCase();
  if (label === 'production') return true;
  if (label && label !== 'production') return false;
  const mode = String(env.MODE || '').toLowerCase();
  if (mode === 'production') return true;
  if (mode && mode !== 'production') return false;
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  if (nodeEnv === 'production') return true;
  if (env.PROD === true || env.PROD === 'true') return true;
  return false;
}

/** @param {Record<string, unknown>} env @param {string} flag @returns {boolean} */
function flagEnabled(env, flag) {
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIsolatedRuntimeImplementationPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_IMPLEMENTATION_PLAN_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIripPhasesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_IRIP_PHASES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIripVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_IRIP_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIripCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_IRIP_COMPATIBILITY_CHECK_FLAG);
}

export default {
  IMPLEMENTATION_PLAN_VERSION,
  IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES,
};
