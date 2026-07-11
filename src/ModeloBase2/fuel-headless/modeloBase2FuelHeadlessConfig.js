/**
 * Config + headless feature flags for the ModeloBase2 FUEL HEADLESS CANDIDATE.
 * Flags exist for diagnostics/tests/headless candidate only — NO real UI/module
 * depends on them. Dev-only, off by default; fail-closed in production unless the
 * matching `*_ALLOW_PROD` override is set. Enabling a flag NEVER enables a backend/
 * Prisma/storage/fetch write. Reversible by non-consumption.
 *
 * File lives under `src/ModeloBase2/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`.
 */
import {
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from '../prototype-adapter/modeloBase2PrototypeConfig.js';

export {
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
};

export const FUEL_DOMAIN = 'fuel';
export const FUEL_OPERATION_TYPE = 'fuel_entry';
export const FUEL_HEADLESS_MODE = 'fuel_headless_candidate';
export const FUEL_MODULE_ID = 'combustivel';
export const FUEL_DEFAULT_FUEL_TYPE = 'diesel';

/** Fuel entry statuses. */
export const FUEL_ENTRY_STATUSES = ['draft', 'valid', 'invalid', 'saved_local', 'submitted_simulated', 'removed'];

/** Fuel commands (domain), each mapped onto a ModeloBase2 operational command. */
export const FUEL_COMMAND_TYPES = [
  'createFuelDraft',
  'appendFuelEntry',
  'updateFuelEntry',
  'removeFuelEntry',
  'validateFuelDraft',
  'saveFuelDraft',
  'submitFuelDraft',
  'createFuelSnapshot',
  'restoreFuelSnapshot',
  'resetFuelDraft',
  'inspectFuelDiagnostics',
];

/** Fuel events (domain), each mapped from a ModeloBase2 operational event. */
export const FUEL_EVENT_TYPES = [
  'fuel.draft.created',
  'fuel.entry.added',
  'fuel.entry.updated',
  'fuel.entry.removed',
  'fuel.draft.validated',
  'fuel.draft.saved',
  'fuel.draft.submitted.simulated',
  'fuel.snapshot.created',
  'fuel.snapshot.restored',
  'fuel.draft.reset',
  'fuel.command.blocked',
  'fuel.fallback.applied',
];

export const FUEL_HEADLESS_CANDIDATE_FLAG = 'MAK_MODELOBASE2_FUEL_HEADLESS_CANDIDATE';
export const FUEL_OPERATIONAL_ADAPTER_FLAG = 'MAK_MODELOBASE2_FUEL_OPERATIONAL_ADAPTER';
export const FUEL_LOCAL_EVENT_DRAFT_FLAG = 'MAK_MODELOBASE2_FUEL_LOCAL_EVENT_DRAFT';
export const FUEL_SNAPSHOT_VALIDATION_FLAG = 'MAK_MODELOBASE2_FUEL_SNAPSHOT_VALIDATION';

export const FUEL_HEADLESS_CANDIDATE_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_HEADLESS_CANDIDATE_ALLOW_PROD';
export const FUEL_OPERATIONAL_ADAPTER_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_OPERATIONAL_ADAPTER_ALLOW_PROD';
export const FUEL_LOCAL_EVENT_DRAFT_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_LOCAL_EVENT_DRAFT_ALLOW_PROD';
export const FUEL_SNAPSHOT_VALIDATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_SNAPSHOT_VALIDATION_ALLOW_PROD';

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

/** @param {Record<string, unknown>} env @param {string} flag @param {string} allowProd @returns {boolean} */
function flagEnabled(env, flag, allowProd) {
  const requested = env[flag] === 'true' || env[FUEL_HEADLESS_CANDIDATE_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[FUEL_HEADLESS_CANDIDATE_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelHeadlessCandidateEnabled(env) {
  const e = env ?? resolveEnv();
  return e[FUEL_HEADLESS_CANDIDATE_FLAG] === 'true'
    && (!isProductionEnv(e) || e[FUEL_HEADLESS_CANDIDATE_ALLOW_PROD_FLAG] === 'true');
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelOperationalAdapterEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_OPERATIONAL_ADAPTER_FLAG, FUEL_OPERATIONAL_ADAPTER_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelLocalEventDraftEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_LOCAL_EVENT_DRAFT_FLAG, FUEL_LOCAL_EVENT_DRAFT_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelSnapshotValidationEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_SNAPSHOT_VALIDATION_FLAG, FUEL_SNAPSHOT_VALIDATION_ALLOW_PROD_FLAG);
}

/**
 * Resolves the headless fuel candidate config for diagnostics/tests.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function resolveModeloBase2FuelHeadlessConfig(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const env = o.env;
  return {
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : FUEL_MODULE_ID,
    modelId: MODELOBASE2_MODEL_ID,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    domain: FUEL_DOMAIN,
    operationType: FUEL_OPERATION_TYPE,
    mode: FUEL_HEADLESS_MODE,
    candidateEnabled: isModeloBase2FuelHeadlessCandidateEnabled(env),
    operationalAdapterEnabled: isModeloBase2FuelOperationalAdapterEnabled(env),
    localEventDraftEnabled: isModeloBase2FuelLocalEventDraftEnabled(env),
    snapshotValidationEnabled: isModeloBase2FuelSnapshotValidationEnabled(env),
  };
}

export default resolveModeloBase2FuelHeadlessConfig;
