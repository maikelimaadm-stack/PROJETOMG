/**
 * Config + headless flags for EMPRESAS STUDIO COMPATIBILITY SLICE 1 — CONTRACT-ONLY
 * ALIGNMENT.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it turns the gaps found by the Empresas
 * blueprint mirror into formal compatibility contracts and alignment plans. It NEVER
 * changes Empresas, renders UI, registers a route/menu/module, touches backend/Prisma/
 * migration/network/production/staging, or performs any mutation. Default disabled;
 * headless only; reversible by non-consumption.
 *
 * File lives under `src/studio/` → browser eslint globals → uses `globalThis.process`,
 * never a bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../../runtime/generic-model/index.js';

export const EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME = 'empresas-studio-compatibility-slice-1';
export const EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_SEMVER = '1.0.0';
export const EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION = 'empresas-studio-compatibility-slice-1@1.0.0';
export const EMPRESAS_MIRROR_VERSION = 'empresas-certified-blueprint-mirror@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const EMPRESAS_READ_CONTRACT_VERSION = 'empresas-local-read-contract@1.0.0';
export const EMPRESAS_COMPAT_ENVIRONMENT = 'local_contract';
export const EMPRESAS_COMPAT_MODULE_ID = 'empresas';
export const EMPRESAS_COMPAT_MODEL_TYPE = 'cadastro';
export const EMPRESAS_COMPAT_MODEL_FAMILY = 'ModeloBase1';
export const EMPRESAS_COMPAT_MODE = 'contract_only_alignment';

export const MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG = 'MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1';
export const MAK_EMPRESAS_GAP_REGISTRY_FLAG = 'MAK_EMPRESAS_GAP_REGISTRY';
export const MAK_EMPRESAS_PERSISTENCE_ALIGNMENT_BRIDGE_FLAG = 'MAK_EMPRESAS_PERSISTENCE_ALIGNMENT_BRIDGE';
export const MAK_EMPRESAS_FUTURE_ALIGNMENT_PLAN_FLAG = 'MAK_EMPRESAS_FUTURE_ALIGNMENT_PLAN';

/**
 * Immutable contract-only capability flags. `headless: true`; every side-effecting or
 * production capability is false, including `empresasCodeChanged` and `rewriteEmpresas`.
 */
export const EMPRESAS_COMPAT_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  empresasCodeChanged: false,
  uiCreated: false,
  routeCreated: false,
  menuCreated: false,
  moduleRegistered: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
  rewriteEmpresas: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function compatDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasStudioCompatibilitySlice1Enabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasGapRegistryEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_EMPRESAS_GAP_REGISTRY_FLAG);
}

export default {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
};
