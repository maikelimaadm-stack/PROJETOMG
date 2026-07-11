/**
 * Feature flags for the EMPRESAS/CADCPS GENERIC KERNEL CONSUMPTION through
 * ModeloBase1.
 *
 * When ON, the applied ModeloBase1 runtime read state (beta) is routed through
 * the ModeloBase1 → generic-model kernel adapter (mapReadToGeneric → generic
 * validation → generic safety/fallback/diagnostics → mapGenericToRead) BEFORE
 * being handed to the ModeloBase1 engine. When OFF, the current ModeloBase1 flow
 * is used verbatim. Any failure falls back to the current ModeloBase1 flow.
 *
 * Dev-only opt-in. Off by default; only `'true'` enables. Fail-closed in
 * production unless the matching `*_ALLOW_PROD` override is set. Enabling
 * consumption NEVER enables any backend/Prisma/storage/fetch write — the generic
 * kernel is pure and its dangerous capabilities stay false.
 *
 * Self-contained env resolution (no `src/runtime` import) so the ModeloBase1
 * engine stays decoupled. File lives under `src/ModeloBase1/` → browser eslint
 * globals → uses `globalThis.process`, never a bare `process`.
 */

/** Umbrella flag — enables generic kernel consumption for both screens. */
export const MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG = 'MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION';
/** Per-module flag — Empresas generic kernel consumption. */
export const EMPRESAS_GENERIC_KERNEL_FLAG = 'MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL';
/** Per-module flag — Campos Personalizados (cadcps) generic kernel consumption. */
export const CADCPS_GENERIC_KERNEL_FLAG = 'MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL';

export const MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_ALLOW_PROD';
export const EMPRESAS_GENERIC_KERNEL_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL_ALLOW_PROD';
export const CADCPS_GENERIC_KERNEL_ALLOW_PROD_FLAG = 'MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL_ALLOW_PROD';

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

/**
 * Local production detector (mirrors the runtime's env-label logic without
 * importing it).
 * @param {Record<string, unknown>} env
 * @returns {boolean}
 */
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

/**
 * @param {Record<string, unknown>} env
 * @param {string} moduleFlag
 * @param {string} moduleAllowProdFlag
 * @returns {boolean}
 */
function consumptionRequested(env, moduleFlag, moduleAllowProdFlag) {
  const requested = env[moduleFlag] === 'true' || env[MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[moduleAllowProdFlag] === 'true' || env[MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isEmpresasGenericKernelConsumptionRequested(env) {
  return consumptionRequested(env ?? resolveEnv(), EMPRESAS_GENERIC_KERNEL_FLAG, EMPRESAS_GENERIC_KERNEL_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isCadcpsGenericKernelConsumptionRequested(env) {
  return consumptionRequested(env ?? resolveEnv(), CADCPS_GENERIC_KERNEL_FLAG, CADCPS_GENERIC_KERNEL_ALLOW_PROD_FLAG);
}

/**
 * Whether generic kernel consumption is REQUESTED for a module (respecting prod
 * fail-closed). Does NOT check the beta precondition — see
 * `resolveModeloBase1GenericKernelConsumption`.
 * @param {string} moduleId
 * @param {Record<string, unknown>} [env]
 * @returns {boolean}
 */
export function isModeloBase1GenericKernelConsumptionRequested(moduleId, env) {
  const e = env ?? resolveEnv();
  if (moduleId === 'empresas') return isEmpresasGenericKernelConsumptionRequested(e);
  if (moduleId === 'cadcps') return isCadcpsGenericKernelConsumptionRequested(e);
  return e[MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG] === 'true'
    && (!isProductionEnv(e) || e[MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_ALLOW_PROD_FLAG] === 'true');
}

/**
 * Resolves whether generic kernel consumption is ACTIVE for a module. Requires
 * BOTH the consumption flag AND the beta read model applied — consumption can
 * never turn on standalone. Pure and side-effect-free.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.readState] Applied runtime read state (needs betaApplied).
 * @param {Record<string, unknown>} [options.env]
 * @returns {{ moduleId: string, consumptionRequested: boolean, betaApplied: boolean, consumptionEnabled: boolean, legacyFallback: boolean, reason: string|null }}
 */
export function resolveModeloBase1GenericKernelConsumption(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const readState = o.readState && typeof o.readState === 'object' ? o.readState : null;
  const moduleId = typeof o.moduleId === 'string'
    ? o.moduleId
    : (readState && typeof readState.moduleId === 'string' ? readState.moduleId : 'unknown');
  const env = o.env;

  const requested = isModeloBase1GenericKernelConsumptionRequested(moduleId, env);
  const betaApplied = Boolean(readState && readState.betaApplied === true);
  const consumptionEnabled = requested && betaApplied;

  let reason = null;
  if (!consumptionEnabled) {
    if (!requested) reason = 'consumption-flag-off';
    else if (!betaApplied) reason = 'beta-read-model-off';
  }

  return {
    moduleId,
    consumptionRequested: requested,
    betaApplied,
    consumptionEnabled,
    legacyFallback: !consumptionEnabled,
    reason,
  };
}

export default resolveModeloBase1GenericKernelConsumption;
