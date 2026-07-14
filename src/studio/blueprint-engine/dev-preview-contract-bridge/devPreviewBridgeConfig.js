/**
 * Config + headless flags for the STUDIO DEV PREVIEW CONTRACT BRIDGE.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it transforms the Module Preview Sandbox
 * metadata into deterministic dev-preview render/layout/screen/adapter CONTRACTS. It
 * renders NO UI, creates NO React component, NO `.jsx`/`.tsx`, NO route/menu, NO module,
 * writes NO file under `src/modules`, and never touches backend/Prisma/migration/network/
 * production/staging, never mutates, never persists, never rewrites Empresas. Default
 * disabled; headless only; nothing is auto-consumed by the app; reversible by
 * non-consumption.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a
 * bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const DEV_PREVIEW_BRIDGE_NAME = 'studio-dev-preview-contract-bridge';
export const DEV_PREVIEW_BRIDGE_SEMVER = '1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const DEV_PREVIEW_BRIDGE_MODE = 'headless_dev_preview_contract_bridge';
export const DEV_PREVIEW_BRIDGE_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** Component KINDS the bridge may reference as contractual placeholders (never real). */
export const ALLOWED_COMPONENT_KINDS = Object.freeze([
  'container', 'section', 'table', 'form', 'field', 'label', 'input-placeholder',
  'select-placeholder', 'date-placeholder', 'number-placeholder', 'text-placeholder',
  'boolean-placeholder', 'badge-placeholder', 'button-placeholder', 'empty-state-placeholder',
  'blocked-state-placeholder',
]);

/** Component kinds explicitly blocked (would imply real runtime/side effects). */
export const BLOCKED_COMPONENT_KINDS = Object.freeze([
  'react-component', 'jsx', 'tsx', 'router', 'route', 'menu', 'nav', 'iframe', 'script',
  'fetch-widget', 'mutation-button', 'real-input', 'live-datagrid',
]);

/** Readiness classifications the bridge can emit. */
export const DEV_PREVIEW_BRIDGE_READINESS_STATES = Object.freeze([
  'studio_dev_preview_contract_bridge_ready', 'ready_for_dev_preview_visual_contract_slice',
  'needs_preview_sandbox_fix', 'needs_reference_plan_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG = 'MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE';
export const MAK_STUDIO_DEV_PREVIEW_RENDER_SCHEMA_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RENDER_SCHEMA';
export const MAK_STUDIO_DEV_PREVIEW_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_COMPATIBILITY_CHECK';

/**
 * Immutable headless capability flags. `headless`/`contractOnly`/`previewMetadataOnly`/
 * `renderSchemaOnly`/`visualAdapterMetadataOnly`/`allowedComponentContractOnly`/
 * `routePlanMetadataOnly`/`menuPlanMetadataOnly` are TRUE (contract-only capabilities);
 * every real UI / side-effect / production capability is FALSE.
 */
export const DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  previewMetadataOnly: true,
  renderSchemaOnly: true,
  visualAdapterMetadataOnly: true,
  allowedComponentContractOnly: true,
  routePlanMetadataOnly: true,
  menuPlanMetadataOnly: true,
  reactComponentCreated: false,
  jsxCreated: false,
  tsxCreated: false,
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
export function bridgeDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewContractBridgeEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_CONTRACT_BRIDGE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRenderSchemaEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RENDER_SCHEMA_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_COMPATIBILITY_CHECK_FLAG);
}

export default {
  DEV_PREVIEW_BRIDGE_VERSION,
  DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES,
};
