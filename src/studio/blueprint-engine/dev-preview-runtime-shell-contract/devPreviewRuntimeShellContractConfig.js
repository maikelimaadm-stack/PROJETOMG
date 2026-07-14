/**
 * Config + headless flags for the STUDIO DEV PREVIEW RUNTIME SHELL CONTRACT.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it consumes the Dev Preview Visual Contract and
 * produces the deterministic CONTRACT of a future dev-preview runtime shell — its lifecycle,
 * mount boundary, events, render request, state / error / permission / data boundaries,
 * isolation and policy. It renders NO UI, creates NO React component, NO `.jsx`/`.tsx`, NO
 * DOM, NO runtime CSS, NO route/menu, NO module, mounts NOTHING, writes NO file under
 * `src/modules`, and never touches backend/Prisma/migration/network/production/staging, never
 * mutates, never persists, never rewrites Empresas. Default disabled; headless only; nothing
 * is auto-consumed by the app; reversible by non-consumption. It authorizes NO runtime
 * implementation — only a future, separately-approved slice may.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a
 * bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const RUNTIME_SHELL_CONTRACT_NAME = 'studio-dev-preview-runtime-shell-contract';
export const RUNTIME_SHELL_CONTRACT_SEMVER = '1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const RUNTIME_SHELL_CONTRACT_MODE = 'headless_dev_preview_runtime_shell_contract';
export const RUNTIME_SHELL_CONTRACT_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** Lifecycle phases the shell contract can describe (metadata-only; no real runtime). */
export const RUNTIME_SHELL_LIFECYCLE_PHASES = Object.freeze([
  'created', 'configured', 'validated', 'ready', 'blocked', 'failed', 'disposed',
]);

/** Contractual event kinds (metadata-only; no real EventEmitter / listener / handler). */
export const RUNTIME_SHELL_EVENT_KINDS = Object.freeze([
  'previewRequested', 'previewValidated', 'previewBlocked', 'previewFailed', 'previewDisposed',
  'interactionRequested', 'interactionBlocked', 'permissionDenied',
]);

/** Mount targets the shell WOULD accept (as metadata) vs. permanently blocked ones. */
export const ALLOWED_MOUNT_TARGET_KINDS = Object.freeze([
  'headlessPreviewHost', 'contractInspector', 'metadataSnapshotSink',
]);
export const BLOCKED_MOUNT_TARGET_KINDS = Object.freeze([
  'domNode', 'reactRoot', 'documentBody', 'iframe', 'routerOutlet', 'menuContainer',
  'productionShell', 'stagingShell',
]);

/** State kinds the state boundary permits (read-only, metadata) vs. blocked ones. */
export const ALLOWED_STATE_KINDS = Object.freeze([
  'idle', 'loading', 'empty', 'ready', 'blocked', 'error', 'validationError', 'permissionDenied',
]);
export const BLOCKED_STATE_KINDS = Object.freeze([
  'reactState', 'hookState', 'mutableRuntimeState', 'persistedState', 'storageState',
]);

/** Readiness classifications the runtime shell contract can emit. */
export const RUNTIME_SHELL_READINESS_STATES = Object.freeze([
  'studio_dev_preview_runtime_shell_contract_ready',
  'ready_for_future_dev_preview_runtime_implementation_contract',
  'needs_visual_contract_fix', 'needs_bridge_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_LIFECYCLE_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_LIFECYCLE';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_COMPATIBILITY_CHECK';

/**
 * Immutable headless capability flags. The `*Only` capabilities are TRUE (contract-only
 * capabilities); every real UI / DOM / CSS / runtime / side-effect / production capability is
 * FALSE.
 */
export const RUNTIME_SHELL_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  runtimeShellOnly: true,
  lifecycleContractOnly: true,
  mountBoundaryMetadataOnly: true,
  eventContractOnly: true,
  renderRequestMetadataOnly: true,
  stateBoundaryContractOnly: true,
  errorBoundaryContractOnly: true,
  permissionBoundaryContractOnly: true,
  dataBoundaryContractOnly: true,
  isolationContractOnly: true,
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
export function shellDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeShellContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeShellLifecycleEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_LIFECYCLE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeShellVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeShellCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_SHELL_COMPATIBILITY_CHECK_FLAG);
}

export default {
  RUNTIME_SHELL_CONTRACT_VERSION,
  RUNTIME_SHELL_HEADLESS_CAPABILITIES,
};
