/**
 * Config + headless flags for the MAK Studio BLUEPRINT ENGINE FOUNDATION.
 *
 * This layer is the first pure, deterministic engine of MAK Studio: given a DRAFT
 * blueprint (a plain description of a would-be module), it normalizes, validates
 * (structure + safety + against the certified hardening baseline), builds a manifest,
 * verifies it, compares two blueprints, checks compatibility, produces diagnostics,
 * a fail-closed fallback, headless preview metadata, a readiness verdict, and a next
 * decision. It is HEADLESS and CONTRACT-ONLY: no flag ever enables UI/route/menu/
 * module registration/backend/Prisma/migration/fetch/production/staging/mutation, and
 * it never rewrites Empresas (consumed only as a reference). Default disabled; headless
 * only; nothing is auto-consumed by the app; reversible by non-consumption.
 *
 * File lives under `src/studio/` → browser eslint globals → uses `globalThis.process`,
 * never a bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../runtime/generic-model/index.js';

export const STUDIO_BLUEPRINT_ENGINE_NAME = 'studio-blueprint-engine';
export const STUDIO_BLUEPRINT_ENGINE_SEMVER = '1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_MODE = 'headless_engine_foundation';
export const STUDIO_BLUEPRINT_ENGINE_ENVIRONMENT = 'local_contract';

/** Upstream certified references (consumed read-only, never rewritten). */
export const STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION = 'studio-blueprint-contract-certification@1.0.0';
export const STUDIO_BLUEPRINT_HARDENING_VERSION = 'studio-blueprint-contract-hardening@1.0.0';
export const STUDIO_FOUNDATION_CONTRACT_VERSION = 'studio-foundation-contracts@1.0.0';
export const EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION = 'empresas-certified-blueprint-mirror@1.0.0';
export const EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION = 'empresas-studio-compatibility-slice-1@1.0.0';

/** Draft blueprint lifecycle states (pure metadata; no side effects). */
export const STUDIO_BLUEPRINT_ENGINE_STATES = Object.freeze([
  'draft', 'normalized', 'validated', 'rejected', 'reference',
]);

/** Compatibility classifications produced by the engine's compatibility checker. */
export const STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY = Object.freeze([
  'compatible', 'backward_compatible', 'breaking', 'invalid',
]);

export const MAK_STUDIO_BLUEPRINT_ENGINE_FLAG = 'MAK_STUDIO_BLUEPRINT_ENGINE';
export const MAK_STUDIO_BLUEPRINT_ENGINE_VALIDATE_FLAG = 'MAK_STUDIO_BLUEPRINT_ENGINE_VALIDATE';
export const MAK_STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY_FLAG = 'MAK_STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY';
export const MAK_STUDIO_BLUEPRINT_ENGINE_MANIFEST_FLAG = 'MAK_STUDIO_BLUEPRINT_ENGINE_MANIFEST';
export const MAK_STUDIO_BLUEPRINT_ENGINE_PREVIEW_METADATA_FLAG = 'MAK_STUDIO_BLUEPRINT_ENGINE_PREVIEW_METADATA';

/**
 * Immutable headless capability flags. Every `can*` engine capability is TRUE (the
 * engine may compute, in memory, purely), while every side-effecting / production
 * capability is FALSE, including `rewriteEmpresas` and `persistenceEnabled`.
 */
export const STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  // pure in-memory engine capabilities (allowed)
  canCreateDraft: true,
  canNormalize: true,
  canValidate: true,
  canValidateSafety: true,
  canValidateAgainstHardening: true,
  canBuildManifest: true,
  canVerify: true,
  canCompare: true,
  canCheckCompatibility: true,
  canDiagnose: true,
  canFallback: true,
  canPreviewMetadata: true,
  canDecideReadiness: true,
  canDecideNext: true,
  // side-effecting / production capabilities (always false)
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
  persistenceEnabled: false,
  generatedModuleAllowed: false,
  rewriteEmpresas: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function engineDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_BLUEPRINT_ENGINE_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintEngineEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_ENGINE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintEngineValidateEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_ENGINE_VALIDATE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintEngineCompatibilityEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintEngineManifestEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_ENGINE_MANIFEST_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioBlueprintEnginePreviewMetadataEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_BLUEPRINT_ENGINE_PREVIEW_METADATA_FLAG);
}

export default {
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
};
