/**
 * Config + headless flags for the MAK Studio BLUEPRINT CONTRACT CERTIFICATION layer.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it certifies the hardened foundation
 * contracts as a canonical, versioned, verifiable and compatible reference. Enabling
 * any flag NEVER enables UI/route/menu/module registration/backend/Prisma/migration/
 * fetch/production/staging/mutation. Default disabled; headless only; reversible by
 * non-consumption.
 *
 * File lives under `src/studio/` → browser eslint globals → uses `globalThis.process`,
 * never a bare `process`. NO React import (pure config).
 */

export const STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME = 'studio-blueprint-contract-certification';
export const STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_SEMVER = '1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION = 'studio-blueprint-contract-certification@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_NAME = 'studio-blueprint-contract';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT = 'local_contract';
/** Upstream references. */
export const STUDIO_FOUNDATION_CONTRACT_VERSION = 'studio-foundation-contracts@1.0.0';
export const STUDIO_BLUEPRINT_HARDENING_VERSION = 'studio-blueprint-contract-hardening@1.0.0';

export const MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG = 'MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION';
export const MAK_STUDIO_BLUEPRINT_CERTIFICATION_VERIFY_FLAG = 'MAK_STUDIO_BLUEPRINT_CERTIFICATION_VERIFY';
export const MAK_STUDIO_BLUEPRINT_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_BLUEPRINT_COMPATIBILITY_CHECK';
export const MAK_STUDIO_BLUEPRINT_CANONICAL_DIGEST_FLAG = 'MAK_STUDIO_BLUEPRINT_CANONICAL_DIGEST';

/** Immutable headless capability flags — ALL false except headless. */
export const STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES = Object.freeze({
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

/** Minimum hardening baseline required for certification to hold. */
export const STUDIO_CERTIFICATION_HARDENING_BASELINE = Object.freeze({
  invalidCaseScenarios: 22,
  dangerousScenarios: 27,
  fieldScenarios: 35,
  screenScenarios: 22,
  validationScenarios: 26,
  permissionScenarios: 26,
  routeMenuScenarios: 19,
  persistenceTransitionScenarios: 17,
  runtimeBindingScenarios: 14,
  compatibilityScenarios: 22,
  digestScenarios: 16,
  verifierScenarios: 19,
  safetyInvariants: 20,
  performanceScenarios: 165,
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintContractCertificationEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintCertificationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_CERTIFICATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_COMPATIBILITY_CHECK_FLAG);
}

export default {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
};
