/**
 * Config + flags for the STUDIO DEV PREVIEW RUNTIME UI IMPLEMENTATION PLAN.
 *
 * Despite the name containing "implementation", this layer is HEADLESS, CONTRACT-ONLY and
 * PLAN-ONLY: it consumes the Dev Preview Runtime UI Contract and produces the deterministic
 * PLAN for a future UI runtime implementation — implementation phases, UI runtime boundary
 * plan, dev-only execution policy, virtual-frame-to-UI pipeline plan, renderer / component /
 * interaction / state / theme / accessibility adapter plans, blocked-action enforcement plan,
 * test harness plan, manual enablement gate plan, rollout/rollback plan and
 * observability/diagnostics plan. It IMPLEMENTS NO UI. It creates NO React component, NO
 * `.jsx`/`.tsx`/`.css`, NO DOM, NO runtime CSS, NO route/placement, NO module, writes NO file
 * under `src/modules`, never touches backend/Prisma/migration/network/production/staging, never
 * mutates, never persists, never reads/writes real data, never rewrites Empresas. Default
 * disabled; headless only; fails closed in production; nothing is auto-consumed by the app;
 * reversible by non-consumption. It authorizes NO UI runtime implementation and NO
 * route/placement integration — only a future, separately-approved slice (after an enterprise
 * checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const RUNTIME_UI_IMPLEMENTATION_PLAN_NAME = 'studio-dev-preview-runtime-ui-implementation-plan';
export const RUNTIME_UI_IMPLEMENTATION_PLAN_SEMVER = '1.0.0';
export const RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0';
export const RUNTIME_UI_IMPLEMENTATION_PLAN_MODE = 'headless_dev_preview_runtime_ui_implementation_plan';
export const RUNTIME_UI_IMPLEMENTATION_PLAN_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const RUNTIME_UI_CONTRACT_VERSION = 'studio-dev-preview-runtime-ui-contract@1.0.0';
export const ISOLATED_RUNTIME_VERSION = 'studio-dev-preview-isolated-runtime@1.0.0';
export const IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The planned implementation phases (planned metadata only — none implemented). */
export const RUNTIME_UI_IMPLEMENTATION_PHASE_IDS = Object.freeze([
  'phase_0_preflight',
  'phase_1_contract_validation',
  'phase_2_ui_runtime_boundary',
  'phase_3_dev_only_ui_policy',
  'phase_4_virtual_frame_pipeline',
  'phase_5_renderer_adapter_plan',
  'phase_6_component_adapter_plan',
  'phase_7_interaction_adapter_plan',
  'phase_8_state_theme_accessibility_projection',
  'phase_9_test_harness',
  'phase_10_manual_enablement_gate',
  'phase_11_rollout_blocked',
]);

/** Planned virtual-frame-to-UI pipeline steps (planned metadata only — none executed). */
export const VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS = Object.freeze([
  'loadVirtualFrame',
  'validateRuntimeUiContract',
  'normalizeUiNodes',
  'resolveMetadataBindings',
  'prepareRenderBoundary',
  'blockRealRender',
  'emitSafeDiagnostics',
]);

/** Action kinds the plan permanently blocks (enforcement plan, metadata only). */
export const BLOCKED_ACTION_KINDS = Object.freeze([
  'create', 'update', 'delete', 'submit', 'save', 'export', 'navigate', 'openRoute',
  'registerModule', 'readRealData', 'writeRealData',
]);

/** Readiness classifications the plan can emit. */
export const RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES = Object.freeze([
  'studio_dev_preview_runtime_ui_implementation_plan_ready',
  'ready_for_future_runtime_ui_implementation_slice_after_enterprise_checkpoint',
  'needs_runtime_ui_contract_fix', 'needs_isolated_runtime_fix', 'blocked', 'invalid',
]);

/** The manual checkpoint a future real implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_runtime_ui_implementation_enterprise_checkpoint';

export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PHASES_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PHASES';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every `*Only` PLAN capability is TRUE; every real UI / DOM / CSS /
 * route / placement / module / backend / production / mutation / real-data capability is FALSE.
 * `runtimeUiImplemented` and `visualRuntimeImplemented` are FALSE — this is a plan, not an
 * implementation.
 */
export const RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  planOnly: true,
  implementationPhasesOnly: true,
  uiRuntimeBoundaryPlanOnly: true,
  devOnlyUiExecutionPolicyOnly: true,
  virtualFrameToUiPipelinePlanOnly: true,
  rendererAdapterPlanOnly: true,
  componentAdapterPlanOnly: true,
  interactionAdapterPlanOnly: true,
  stateAdapterPlanOnly: true,
  themeAdapterPlanOnly: true,
  accessibilityAdapterPlanOnly: true,
  blockedActionEnforcementPlanOnly: true,
  testHarnessPlanOnly: true,
  manualEnablementGatePlanOnly: true,
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
  runtimeUiImplemented: false,
  visualRuntimeImplemented: false,
  reactRuntimeCreated: false,
  domRuntimeCreated: false,
  cssRuntimeCreated: false,
  routeRuntimeCreated: false,
  menuRuntimeCreated: false,
  moduleRuntimeCreated: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
  persistenceCreated: false,
  realDataRead: false,
  realDataWrite: false,
  rewriteEmpresas: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function uiPlanDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiImplementationPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PLAN_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiImplementationPhasesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_PHASES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiImplementationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiImplementationCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG);
}

export default {
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_CAPABILITIES,
};
