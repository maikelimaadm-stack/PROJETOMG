/**
 * Config + feature flags for the ModeloBase2 OPERATIONAL PROTOTYPE (headless).
 *
 * These flags exist for diagnostics/tests/prototype only — NO real UI depends on
 * them in this slice. Dev-only, off by default; only `'true'` enables. Fail-closed
 * in production unless the matching `*_ALLOW_PROD` override is set. Enabling a flag
 * NEVER enables any backend/Prisma/storage/fetch write — the prototype is pure and
 * its dangerous capabilities stay false. Reversible by non-consumption.
 *
 * File lives under `src/ModeloBase2/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. Self-contained env resolution (no
 * `src/runtime` import) so the prototype stays decoupled.
 */

export const MODELOBASE2_MODEL_FAMILY = 'modeloBase2';
export const MODELOBASE2_MODEL_TYPE = 'operacional';
export const MODELOBASE2_SOURCE = 'modeloBase2-prototype';
export const MODELOBASE2_MODEL_ID = 'modelobase2';

/** Deterministic default clock for prototype events/versions (no Date.now). */
export const MODELOBASE2_DEFAULT_CREATED_AT = '2025-01-01T00:00:00.000Z';

/** Operational draft statuses (no real workflow status yet). */
export const MODELOBASE2_DRAFT_STATUSES = ['draft', 'valid', 'invalid', 'submitted_simulated', 'reset'];

/** Local event types the operational prototype appends. */
export const MODELOBASE2_EVENT_TYPES = [
  'draft.created',
  'draft.updated',
  'entry.added',
  'entry.updated',
  'entry.removed',
  'draft.saved',
  'draft.submitted.simulated',
  'draft.reset',
];

/** Operational mutations, mapped onto generic local write operations. */
export const MODELOBASE2_ALLOWED_OPERATIONS = [
  'createOperationalDraft',
  'updateOperationalDraft',
  'validateOperationalDraft',
  'appendLocalEvent',
  'amendLocalEvent',
  'discardLocalEvent',
  'saveOperationalDraft',
  'submitOperationalDraft',
  'resetOperationalDraft',
  'simulateOperationalCommit',
];

/** Operations that leave the local sandbox — always blocked. */
export const MODELOBASE2_BLOCKED_OPERATIONS = [
  'backendCreate',
  'backendUpdate',
  'backendDelete',
  'backendCommit',
  'prismaCreate',
  'prismaUpdate',
  'prismaDelete',
  'fetchWrite',
  'directDatabaseWrite',
  'persistStorageAutomatically',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
  'mutateRuntimeBridge',
  'mutateGlobalRuntime',
  'replaceProductionUi',
];

export const MODELOBASE2_PROTOTYPE_FLAG = 'MAK_MODELOBASE2_PROTOTYPE';
export const MODELOBASE2_OPERATIONAL_ADAPTER_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_ADAPTER';
export const MODELOBASE2_LOCAL_EVENT_DRAFT_FLAG = 'MAK_MODELOBASE2_LOCAL_EVENT_DRAFT';

export const MODELOBASE2_PROTOTYPE_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_PROTOTYPE_ALLOW_PROD';
export const MODELOBASE2_OPERATIONAL_ADAPTER_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_OPERATIONAL_ADAPTER_ALLOW_PROD';
export const MODELOBASE2_LOCAL_EVENT_DRAFT_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_LOCAL_EVENT_DRAFT_ALLOW_PROD';

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
  const requested = env[flag] === 'true' || env[MODELOBASE2_PROTOTYPE_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[MODELOBASE2_PROTOTYPE_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2PrototypeEnabled(env) {
  const e = env ?? resolveEnv();
  return e[MODELOBASE2_PROTOTYPE_FLAG] === 'true'
    && (!isProductionEnv(e) || e[MODELOBASE2_PROTOTYPE_ALLOW_PROD_FLAG] === 'true');
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2OperationalAdapterEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MODELOBASE2_OPERATIONAL_ADAPTER_FLAG, MODELOBASE2_OPERATIONAL_ADAPTER_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2LocalEventDraftEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MODELOBASE2_LOCAL_EVENT_DRAFT_FLAG, MODELOBASE2_LOCAL_EVENT_DRAFT_ALLOW_PROD_FLAG);
}

/**
 * Resolves the headless prototype config for diagnostics/tests. No UI depends on
 * this. Pure and side-effect-free.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {{ moduleId: string, modelId: string, modelFamily: string, modelType: string, source: string, prototypeEnabled: boolean, operationalAdapterEnabled: boolean, localEventDraftEnabled: boolean }}
 */
export function resolveModeloBase2PrototypeConfig(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const env = o.env;
  return {
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype',
    modelId: MODELOBASE2_MODEL_ID,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    source: MODELOBASE2_SOURCE,
    prototypeEnabled: isModeloBase2PrototypeEnabled(env),
    operationalAdapterEnabled: isModeloBase2OperationalAdapterEnabled(env),
    localEventDraftEnabled: isModeloBase2LocalEventDraftEnabled(env),
  };
}

export default resolveModeloBase2PrototypeConfig;
