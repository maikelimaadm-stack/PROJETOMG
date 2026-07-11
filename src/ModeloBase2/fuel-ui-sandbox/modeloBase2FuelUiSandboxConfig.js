/**
 * Config + dev-only feature flags for the ModeloBase2 FUEL BETA UI SANDBOX. Flags
 * exist for diagnostics/tests/sandbox only — the sandbox is NEVER mounted in the
 * app, registers NO route/menu. Dev-only, off by default; fail-closed in production
 * unless the matching `*_ALLOW_PROD` override is set. Enabling a flag NEVER enables
 * a backend/Prisma/storage/fetch write. Reversible by non-consumption.
 *
 * File lives under `src/ModeloBase2/` → browser eslint globals → uses
 * `globalThis.process`, never a bare `process`. NO React import (pure config).
 */
import {
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from '../prototype-adapter/modeloBase2PrototypeConfig.js';
import { FUEL_DOMAIN, FUEL_MODULE_ID } from '../fuel-headless/modeloBase2FuelHeadlessConfig.js';

export {
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
  FUEL_DOMAIN,
  FUEL_MODULE_ID,
};

export const FUEL_UI_SANDBOX_MODE = 'fuel_beta_ui_sandbox';
export const FUEL_UI_SANDBOX_TITLE = 'Lançamento de Combustível';
export const FUEL_UI_SANDBOX_SUBTITLE = 'Sandbox beta local — offline-first, sem backend';

/** Sandbox actions, each mapped onto a fuel headless command. */
export const FUEL_SANDBOX_ACTIONS = [
  'newDraft',
  'addFuelEntry',
  'editFuelEntry',
  'removeFuelEntry',
  'validate',
  'saveLocal',
  'submitSimulated',
  'snapshot',
  'restore',
  'reset',
  'inspectDiagnostics',
];

export const FUEL_BETA_UI_SANDBOX_FLAG = 'MAK_MODELOBASE2_FUEL_BETA_UI_SANDBOX';
export const FUEL_SANDBOX_ACTIONS_FLAG = 'MAK_MODELOBASE2_FUEL_SANDBOX_ACTIONS';
export const FUEL_SANDBOX_DIAGNOSTICS_FLAG = 'MAK_MODELOBASE2_FUEL_SANDBOX_DIAGNOSTICS';

export const FUEL_BETA_UI_SANDBOX_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_BETA_UI_SANDBOX_ALLOW_PROD';
export const FUEL_SANDBOX_ACTIONS_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_SANDBOX_ACTIONS_ALLOW_PROD';
export const FUEL_SANDBOX_DIAGNOSTICS_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_SANDBOX_DIAGNOSTICS_ALLOW_PROD';

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
  const requested = env[flag] === 'true' || env[FUEL_BETA_UI_SANDBOX_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[FUEL_BETA_UI_SANDBOX_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelBetaUiSandboxEnabled(env) {
  const e = env ?? resolveEnv();
  return e[FUEL_BETA_UI_SANDBOX_FLAG] === 'true'
    && (!isProductionEnv(e) || e[FUEL_BETA_UI_SANDBOX_ALLOW_PROD_FLAG] === 'true');
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelSandboxActionsEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_SANDBOX_ACTIONS_FLAG, FUEL_SANDBOX_ACTIONS_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelSandboxDiagnosticsEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_SANDBOX_DIAGNOSTICS_FLAG, FUEL_SANDBOX_DIAGNOSTICS_ALLOW_PROD_FLAG);
}

/**
 * Resolves the sandbox config for diagnostics/tests. The sandbox is NEVER mounted.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function resolveModeloBase2FuelUiSandboxConfig(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const env = o.env;
  return {
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : FUEL_MODULE_ID,
    modelId: MODELOBASE2_MODEL_ID,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    domain: FUEL_DOMAIN,
    mode: FUEL_UI_SANDBOX_MODE,
    sandboxEnabled: isModeloBase2FuelBetaUiSandboxEnabled(env),
    actionsEnabled: isModeloBase2FuelSandboxActionsEnabled(env),
    diagnosticsEnabled: isModeloBase2FuelSandboxDiagnosticsEnabled(env),
    // Structural invariants — the sandbox never mounts / registers.
    uiMountedInApp: false,
    routeRegistered: false,
    menuRegistered: false,
  };
}

export default resolveModeloBase2FuelUiSandboxConfig;
