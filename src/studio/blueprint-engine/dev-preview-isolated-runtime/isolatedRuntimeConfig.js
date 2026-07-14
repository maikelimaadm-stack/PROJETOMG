/**
 * Config + flags for the STUDIO DEV PREVIEW ISOLATED RUNTIME.
 *
 * This layer is a DEV-ONLY, HEADLESS, ISOLATED runtime. It IS the isolated runtime the prior
 * plan described (`isolatedRuntimeImplemented: true`), but it renders NO UI: it consumes the
 * upstream contracts (implementation plan → runtime shell → visual → bridge → sandbox) and
 * produces a deterministic VIRTUAL PREVIEW FRAME in pure JSON/metadata, from synthetic data
 * only. It creates NO React component, NO `.jsx`/`.tsx`/`.css`, NO DOM, NO runtime CSS, NO
 * route/menu, NO module, writes NO file under `src/modules`, and never touches backend/Prisma/
 * migration/network/production/staging, never mutates, never persists, never reads/writes real
 * data, never rewrites Empresas. Default disabled; dev-only; fails closed in production;
 * nothing is auto-consumed by the app; reversible by non-consumption. It authorizes NO UI
 * runtime and NO route/menu integration — only a future, separately-approved slice may.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const ISOLATED_RUNTIME_NAME = 'studio-dev-preview-isolated-runtime';
export const ISOLATED_RUNTIME_SEMVER = '1.0.0';
export const ISOLATED_RUNTIME_VERSION = 'studio-dev-preview-isolated-runtime@1.0.0';
export const ISOLATED_RUNTIME_MODE = 'headless_dev_preview_isolated_runtime';
export const ISOLATED_RUNTIME_ENVIRONMENT = 'local_dev_only';

/** Upstream references (consumed read-only). */
export const IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The name + status of the manual gate that authorized this dev-only isolated runtime. */
export const MANUAL_GATE_NAME = 'fable-pre-runtime-enterprise-checkpoint';
export const MANUAL_GATE_STATUS = 'approved_for_dev_only_isolated_runtime';

/** Runtime lifecycle steps (metadata-only transitions; no real timers/event-loop/DOM). */
export const ISOLATED_RUNTIME_LIFECYCLE_STEPS = Object.freeze([
  'created', 'preflighted', 'contractsLoaded', 'syntheticDataPrepared', 'framePrepared',
  'blockedForUIRuntime', 'disposed',
]);

/** Event kinds the dispatcher returns as metadata (no real EventEmitter/listener/handler). */
export const ISOLATED_RUNTIME_EVENT_KINDS = Object.freeze([
  'previewRequested', 'renderRequested', 'renderBlocked', 'interactionRequested',
  'interactionBlocked', 'permissionDenied', 'diagnosticEmitted', 'disposed',
]);

/** Readiness classifications the runtime can emit. */
export const ISOLATED_RUNTIME_READINESS_STATES = Object.freeze([
  'studio_dev_preview_isolated_runtime_ready',
  'ready_for_future_dev_preview_runtime_ui_contract_when_explicitly_authorized',
  'needs_implementation_plan_fix', 'needs_runtime_shell_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME';
export const MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FRAME_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FRAME';
export const MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. `isolatedRuntimeImplemented` is TRUE (this slice implements the
 * dev-only isolated runtime). Every real UI / DOM / CSS / route / menu / module / backend /
 * production / mutation / real-data capability is FALSE. `visualRuntimeImplemented` is FALSE —
 * no UI runtime.
 */
export const ISOLATED_RUNTIME_CAPABILITIES = Object.freeze({
  headless: true,
  devOnly: true,
  isolated: true,
  contractDriven: true,
  syntheticDataOnly: true,
  metadataOutputOnly: true,
  virtualFrameOnly: true,
  isolatedRuntimeImplemented: true,
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
export function runtimeDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // dev-only: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIsolatedRuntimeEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIsolatedRuntimeFrameEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_FRAME_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIsolatedRuntimeVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewIsolatedRuntimeCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ISOLATED_RUNTIME_COMPATIBILITY_CHECK_FLAG);
}

export default {
  ISOLATED_RUNTIME_VERSION,
  ISOLATED_RUNTIME_CAPABILITIES,
};
