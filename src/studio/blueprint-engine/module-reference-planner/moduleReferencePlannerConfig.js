/**
 * Config + headless flags for the STUDIO BLUEPRINT MODULE REFERENCE PLANNER.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it receives a blueprint validated by the
 * Studio Blueprint Engine and turns it into a REFERENCE PLAN for a module — identity,
 * files, screens, fields/table/form, permissions, route/menu, persistence, runtime
 * binding, tests/gates, evidence, risks, readiness — but everything stays a PLAN. It
 * NEVER generates a module, writes any file under `src/modules`, renders UI, registers a
 * route/menu/module, touches backend/Prisma/migration/network/production/staging,
 * mutates, persists, or rewrites Empresas. Default disabled; headless only; reversible
 * by non-consumption.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never
 * a bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const MODULE_REFERENCE_PLANNER_NAME = 'studio-blueprint-module-reference-planner';
export const MODULE_REFERENCE_PLANNER_SEMVER = '1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const MODULE_REFERENCE_PLANNER_MODE = 'contract_only_reference_planning';
export const MODULE_REFERENCE_PLANNER_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only, never rewritten). */
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION = 'studio-blueprint-contract-certification@1.0.0';
export const EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION = 'empresas-certified-blueprint-mirror@1.0.0';

/** Persistence boundary states a module could progress through (planned only). */
export const MODULE_PERSISTENCE_STATES = Object.freeze([
  'noPersistence', 'memoryOnly', 'localReadOnly', 'localWriteDraft',
  'stagingReadOnly', 'stagingWriteControlled', 'productionRead', 'productionWriteControlled',
]);

/** Readiness classifications the planner can emit. */
export const MODULE_READINESS_STATES = Object.freeze([
  'module_reference_plan_ready', 'ready_for_preview_sandbox', 'needs_blueprint_fix',
  'needs_empresas_alignment', 'needs_registry', 'blocked', 'invalid',
]);

export const MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG = 'MAK_STUDIO_MODULE_REFERENCE_PLANNER';
export const MAK_STUDIO_MODULE_PLAN_VERIFY_FLAG = 'MAK_STUDIO_MODULE_PLAN_VERIFY';
export const MAK_STUDIO_MODULE_PLAN_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_MODULE_PLAN_COMPATIBILITY_CHECK';
export const MAK_STUDIO_MODULE_PLAN_PREVIEW_READINESS_FLAG = 'MAK_STUDIO_MODULE_PLAN_PREVIEW_READINESS';

/**
 * Immutable headless capability flags. `headless: true`; every side-effecting /
 * production / generation capability is FALSE — the planner only PLANS.
 */
export const MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  moduleGenerated: false,
  filesWrittenToModule: false,
  routeCreated: false,
  menuCreated: false,
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
export function plannerDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleReferencePlannerEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePlanVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PLAN_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePlanCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PLAN_COMPATIBILITY_CHECK_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePlanPreviewReadinessEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PLAN_PREVIEW_READINESS_FLAG);
}

export default {
  MODULE_REFERENCE_PLANNER_VERSION,
  MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
};
