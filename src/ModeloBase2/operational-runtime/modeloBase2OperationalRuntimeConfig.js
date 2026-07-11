/**
 * Config + headless feature flags for the ModeloBase2 OPERATIONAL RUNTIME
 * FOUNDATION. Flags exist for diagnostics/tests/headless runtime only — NO real
 * UI/route/module depends on them. Dev-only, off by default; fail-closed in
 * production unless the matching `*_ALLOW_PROD` override is set. Enabling a flag
 * NEVER enables a backend/Prisma/storage/fetch write. Reversible by non-consumption.
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

export const MODELOBASE2_OPERATIONAL_SOURCE = 'modeloBase2-operational-runtime';
export const MODELOBASE2_OPERATIONAL_RUNTIME_MODE = 'operational_runtime_foundation';

/** Operational runtime states (local state machine — NOT a real workflow). */
export const MODELOBASE2_RUNTIME_STATES = [
  'idle',
  'draft',
  'dirty',
  'valid',
  'invalid',
  'saved_local',
  'submitted_simulated',
  'reset',
  'blocked',
  'fallback',
];

/** Command types the operational runtime resolves. */
export const MODELOBASE2_COMMAND_TYPES = [
  'createDraft',
  'updateDraft',
  'appendEntry',
  'updateEntry',
  'removeEntry',
  'validateDraft',
  'saveDraft',
  'submitDraft',
  'resetDraft',
  'createSnapshot',
  'restoreSnapshot',
  'inspectDiagnostics',
];

/** Event types the operational event log records (superset of the prototype's). */
export const MODELOBASE2_RUNTIME_EVENT_TYPES = [
  'draft.created',
  'draft.updated',
  'entry.added',
  'entry.updated',
  'entry.removed',
  'draft.validated',
  'draft.saved',
  'draft.submitted.simulated',
  'snapshot.created',
  'snapshot.restored',
  'draft.reset',
  'command.blocked',
  'fallback.applied',
];

export const MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION';
export const MODELOBASE2_OPERATIONAL_SESSION_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_SESSION';
export const MODELOBASE2_OPERATIONAL_EVENT_LOG_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_EVENT_LOG';
export const MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE';

export const MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_ALLOW_PROD';
export const MODELOBASE2_OPERATIONAL_SESSION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_SESSION_ALLOW_PROD';
export const MODELOBASE2_OPERATIONAL_EVENT_LOG_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_EVENT_LOG_ALLOW_PROD';
export const MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_ALLOW_PROD';

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
  const requested = env[flag] === 'true' || env[MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2OperationalRuntimeFoundationEnabled(env) {
  const e = env ?? resolveEnv();
  return e[MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_FLAG] === 'true'
    && (!isProductionEnv(e) || e[MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_ALLOW_PROD_FLAG] === 'true');
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2OperationalSessionEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MODELOBASE2_OPERATIONAL_SESSION_FLAG, MODELOBASE2_OPERATIONAL_SESSION_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2OperationalEventLogEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MODELOBASE2_OPERATIONAL_EVENT_LOG_FLAG, MODELOBASE2_OPERATIONAL_EVENT_LOG_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2OperationalSnapshotBridgeEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_FLAG, MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_ALLOW_PROD_FLAG);
}

/**
 * Resolves the headless operational runtime config for diagnostics/tests.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {{ moduleId: string, modelId: string, modelFamily: string, modelType: string, mode: string, foundationEnabled: boolean, sessionEnabled: boolean, eventLogEnabled: boolean, snapshotBridgeEnabled: boolean }}
 */
export function resolveModeloBase2OperationalRuntimeConfig(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const env = o.env;
  return {
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime',
    modelId: MODELOBASE2_MODEL_ID,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    mode: MODELOBASE2_OPERATIONAL_RUNTIME_MODE,
    foundationEnabled: isModeloBase2OperationalRuntimeFoundationEnabled(env),
    sessionEnabled: isModeloBase2OperationalSessionEnabled(env),
    eventLogEnabled: isModeloBase2OperationalEventLogEnabled(env),
    snapshotBridgeEnabled: isModeloBase2OperationalSnapshotBridgeEnabled(env),
  };
}

export default resolveModeloBase2OperationalRuntimeConfig;
