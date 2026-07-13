/**
 * Config + headless flags for the EMPRESAS CERTIFIED BLUEPRINT MIRROR & ALIGNMENT
 * AUDIT.
 *
 * This layer is HEADLESS and AUDIT/MIRROR-ONLY: it mirrors the REAL Cadastro de
 * Empresas against the certified Studio blueprint contract and audits alignment. It
 * NEVER rewrites Empresas, renders UI, registers a route/menu/module, touches backend/
 * Prisma/migration/network/production/staging, or performs any mutation. Default
 * disabled; headless only; reversible by non-consumption.
 *
 * File lives under `src/studio/` → browser eslint globals → uses `globalThis.process`,
 * never a bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME = 'empresas-certified-blueprint-mirror';
export const EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_SEMVER = '1.0.0';
export const EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION = 'empresas-certified-blueprint-mirror@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const EMPRESAS_READ_CONTRACT_VERSION = 'empresas-local-read-contract@1.0.0';
export const EMPRESAS_MIRROR_ENVIRONMENT = 'local_contract';
export const EMPRESAS_MIRROR_SOURCE_MODULE = 'empresas';
export const EMPRESAS_MIRROR_MODEL_TYPE = 'cadastro';
export const EMPRESAS_MIRROR_MODEL_FAMILY = 'ModeloBase1';
export const EMPRESAS_MIRROR_MODE = 'audit_only';

export const MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG = 'MAK_EMPRESAS_BLUEPRINT_MIRROR';
export const MAK_EMPRESAS_BLUEPRINT_ALIGNMENT_AUDIT_FLAG = 'MAK_EMPRESAS_BLUEPRINT_ALIGNMENT_AUDIT';
export const MAK_EMPRESAS_STUDIO_COMPATIBILITY_PLAN_FLAG = 'MAK_EMPRESAS_STUDIO_COMPATIBILITY_PLAN';

/**
 * Immutable audit/mirror capability flags. `headless: true`; every side-effecting or
 * production capability is false, including `rewriteEmpresas`.
 */
export const EMPRESAS_MIRROR_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
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

/** Deterministic digest for the mirror (FNV-1a via the runtime helper). Never mutates input. */
export function mirrorDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasBlueprintMirrorEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasBlueprintAlignmentAuditEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_EMPRESAS_BLUEPRINT_ALIGNMENT_AUDIT_FLAG);
}

export default {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
};
