/**
 * Config + headless flags for the MAK Studio BLUEPRINT CONTRACT HARDENING layer.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it hardens the foundation contracts
 * against invalid/dangerous/breaking/incompatible cases. Enabling any flag NEVER
 * enables UI/route/menu/module registration/backend/Prisma/migration/fetch/
 * production/staging/mutation. Default disabled; headless only; reversible by
 * non-consumption.
 *
 * File lives under `src/studio/` → browser eslint globals → uses `globalThis.process`,
 * never a bare `process`. NO React import (pure config).
 */

import { STUDIO_FOUNDATION_CONTRACT_VERSION } from '../studioFoundationContractsConfig.js';

export const STUDIO_BLUEPRINT_CONTRACT_HARDENING_NAME = 'studio-blueprint-contract-hardening';
export const STUDIO_BLUEPRINT_CONTRACT_HARDENING_SEMVER = '1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION = 'studio-blueprint-contract-hardening@1.0.0';
export const STUDIO_BLUEPRINT_HARDENING_ENVIRONMENT = 'local_contract';
/** The base foundation contract this hardening layer targets. */
export const STUDIO_BASE_CONTRACT_VERSION = 'studio-foundation-contracts@1.0.0';
export { STUDIO_FOUNDATION_CONTRACT_VERSION };

export const MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG = 'MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING';
export const MAK_STUDIO_FIELD_MATRIX_FLAG = 'MAK_STUDIO_FIELD_MATRIX';
export const MAK_STUDIO_SCREEN_MATRIX_FLAG = 'MAK_STUDIO_SCREEN_MATRIX';
export const MAK_STUDIO_VALIDATION_MATRIX_FLAG = 'MAK_STUDIO_VALIDATION_MATRIX';
export const MAK_STUDIO_PERMISSION_MATRIX_FLAG = 'MAK_STUDIO_PERMISSION_MATRIX';
export const MAK_STUDIO_ROUTE_MENU_BLOCKER_MATRIX_FLAG = 'MAK_STUDIO_ROUTE_MENU_BLOCKER_MATRIX';
export const MAK_STUDIO_PERSISTENCE_TRANSITION_MATRIX_FLAG = 'MAK_STUDIO_PERSISTENCE_TRANSITION_MATRIX';
export const MAK_STUDIO_COMPATIBILITY_BREAKING_MATRIX_FLAG = 'MAK_STUDIO_COMPATIBILITY_BREAKING_MATRIX';

/** Immutable headless capability flags — ALL false except headless. */
export const STUDIO_HARDENING_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  uiEnabled: false,
  routeEnabled: false,
  menuEnabled: false,
  moduleRegistrationEnabled: false,
  backendEnabled: false,
  prismaEnabled: false,
  migrationEnabled: false,
  productionEnabled: false,
  stagingEnabled: false,
  fetchEnabled: false,
  mutationAllowed: false,
  generatedModuleAllowed: false,
  marketplaceEnabled: false,
});

/** A safe local limit for blueprint size, so an oversized blueprint fails closed. */
export const STUDIO_HARDENING_MAX_BLUEPRINT_KEYS = 512;
/** Max nesting depth before a layout/blueprint is considered too deep. */
export const STUDIO_HARDENING_MAX_DEPTH = 12;

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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintContractHardeningEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioFieldMatrixEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_FIELD_MATRIX_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioPermissionMatrixEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_PERMISSION_MATRIX_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioCompatibilityBreakingMatrixEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_COMPATIBILITY_BREAKING_MATRIX_FLAG);
}

export default {
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
  STUDIO_HARDENING_HEADLESS_CAPABILITIES,
};
