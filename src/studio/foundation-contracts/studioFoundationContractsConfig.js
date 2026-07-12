/**
 * Config + headless flags for the MAK Studio FOUNDATION CONTRACTS. Flags are for
 * diagnostics/tests only — enabling one NEVER enables UI/route/menu/module
 * registration/backend/Prisma/migration/fetch/production/staging/mutation. Default
 * disabled; headless only; reversible by non-consumption.
 *
 * File lives under `src/studio/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. NO React import (pure config).
 */

export const STUDIO_FOUNDATION_CONTRACT_NAME = 'studio-foundation-contracts';
export const STUDIO_FOUNDATION_CONTRACT_VERSION = '1.0.0';
export const STUDIO_FOUNDATION_CONTRACTS_VERSION = 'studio-foundation-contracts@1.0.0';
export const STUDIO_FOUNDATION_ENVIRONMENT = 'local_contract';

export const MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG = 'MAK_STUDIO_FOUNDATION_CONTRACTS';
export const MAK_STUDIO_CONTRACT_VERIFY_FLAG = 'MAK_STUDIO_CONTRACT_VERIFY';
export const MAK_STUDIO_BLUEPRINT_VALIDATE_FLAG = 'MAK_STUDIO_BLUEPRINT_VALIDATE';
export const MAK_STUDIO_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_COMPATIBILITY_CHECK';

/**
 * The immutable headless capability flags — ALL false. These are the invariants the
 * whole layer preserves; nothing here ever flips them on.
 */
export const STUDIO_HEADLESS_CAPABILITIES = Object.freeze({
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG] === 'true';
  if (!requested) return false;
  // Headless/local: fails closed in production, no escape.
  return !isProductionEnv(env);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioFoundationContractsEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioContractVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_CONTRACT_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintValidateEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_VALIDATE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_COMPATIBILITY_CHECK_FLAG);
}

export default {
  STUDIO_FOUNDATION_CONTRACTS_VERSION,
  STUDIO_HEADLESS_CAPABILITIES,
};
