/**
 * Config + dev-only feature flags for the ModeloBase2 FUEL MODULE SHELL READINESS
 * layer. Flags exist for diagnostics/tests/readiness only — enabling one NEVER
 * registers a real module/route/menu and NEVER enables a backend/Prisma/storage/
 * fetch write. Dev-only, off by default; fail-closed in production unless the
 * matching `*_ALLOW_PROD` override is set. Reversible by non-consumption.
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
import {
  FUEL_DOMAIN,
  FUEL_COMMAND_TYPES,
  FUEL_EVENT_TYPES,
} from '../fuel-headless/modeloBase2FuelHeadlessConfig.js';
import { MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH } from '../fuel-ui-sandbox/dev-preview/modeloBase2FuelDevPreviewConfig.js';

export {
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
  FUEL_DOMAIN,
  FUEL_COMMAND_TYPES,
  FUEL_EVENT_TYPES,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
};

/** Readiness mode + module identity (the FUTURE real module id/name). */
export const FUEL_MODULE_SHELL_READINESS_MODE = 'fuel_module_shell_readiness';
export const FUEL_MODULE_SHELL_MODULE_ID = 'modelobase2-fuel';
export const FUEL_MODULE_SHELL_MODULE_NAME = 'Combustível';
export const FUEL_MODULE_SHELL_STATUS = 'beta_shell_readiness';
export const FUEL_MODULE_SHELL_VERSION = '0.1.0-shell-readiness';
export const FUEL_MODULE_SHELL_CATEGORY = 'Operacional';
export const FUEL_MODULE_SHELL_ICON_NAME = 'Fuel';
export const FUEL_MODULE_SHELL_OWNER = 'MAK Gestão';
export const FUEL_MODULE_SHELL_RISK_LEVEL = 'controlled_beta';

/** Planned (NOT registered) production route + menu placement. */
export const FUEL_MODULE_PLANNED_ROUTE_PATH = '/operacional/combustivel';
export const FUEL_MODULE_PLANNED_MENU_GROUP = 'Operacional';
export const FUEL_MODULE_PLANNED_MENU_LABEL = 'Combustível';
export const FUEL_MODULE_PLANNED_MENU_ORDER = 50;
export const FUEL_MODULE_PLANNED_MENU_ICON = 'Fuel';

/** Local/safe permissions the future module PLANS to expose (never registered here). */
export const FUEL_MODULE_ALLOWED_PERMISSIONS = [
  'fuel.read',
  'fuel.create_local',
  'fuel.update_local',
  'fuel.delete_local',
  'fuel.submit_simulated',
  'fuel.snapshot',
  'fuel.restore',
  'fuel.diagnostics',
];

/** Dangerous permissions that stay BLOCKED (fail-closed) in the plan. */
export const FUEL_MODULE_BLOCKED_PERMISSIONS = [
  'fuel.backend_write',
  'fuel.sync',
  'fuel.export',
  'fuel.approve',
  'fuel.connector',
  'fuel.workflow',
];

/** The next controlled step — NEVER "backend write". */
export const FUEL_MODULE_NEXT_STEPS = [
  'Fuel Controlled Module Registration',
  'Fuel Beta Module Shell Candidate',
];

export const FUEL_MODULE_SHELL_READINESS_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_SHELL_READINESS';
export const FUEL_MODULE_SHELL_PREVIEW_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_SHELL_PREVIEW';
export const FUEL_MODULE_ROUTE_PLAN_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_ROUTE_PLAN';
export const FUEL_MODULE_MENU_PLAN_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_MENU_PLAN';

export const FUEL_MODULE_SHELL_READINESS_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_SHELL_READINESS_ALLOW_PROD';
export const FUEL_MODULE_SHELL_PREVIEW_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_SHELL_PREVIEW_ALLOW_PROD';
export const FUEL_MODULE_ROUTE_PLAN_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_ROUTE_PLAN_ALLOW_PROD';
export const FUEL_MODULE_MENU_PLAN_ALLOW_PROD_FLAG = 'MAK_MODELOBASE2_FUEL_MODULE_MENU_PLAN_ALLOW_PROD';

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
  const requested = env[flag] === 'true' || env[FUEL_MODULE_SHELL_READINESS_FLAG] === 'true';
  if (!requested) return false;
  if (!isProductionEnv(env)) return true;
  return env[allowProd] === 'true' || env[FUEL_MODULE_SHELL_READINESS_ALLOW_PROD_FLAG] === 'true';
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelModuleShellReadinessEnabled(env) {
  const e = env ?? resolveEnv();
  return e[FUEL_MODULE_SHELL_READINESS_FLAG] === 'true'
    && (!isProductionEnv(e) || e[FUEL_MODULE_SHELL_READINESS_ALLOW_PROD_FLAG] === 'true');
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelModuleShellPreviewEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_MODULE_SHELL_PREVIEW_FLAG, FUEL_MODULE_SHELL_PREVIEW_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelModuleRoutePlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_MODULE_ROUTE_PLAN_FLAG, FUEL_MODULE_ROUTE_PLAN_ALLOW_PROD_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isModeloBase2FuelModuleMenuPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), FUEL_MODULE_MENU_PLAN_FLAG, FUEL_MODULE_MENU_PLAN_ALLOW_PROD_FLAG);
}

/**
 * Resolves the module shell readiness config for diagnostics/tests. Never registers.
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function resolveModeloBase2FuelModuleShellConfig(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const env = o.env;
  return {
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : FUEL_MODULE_SHELL_MODULE_ID,
    moduleName: FUEL_MODULE_SHELL_MODULE_NAME,
    modelId: MODELOBASE2_MODEL_ID,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    domain: FUEL_DOMAIN,
    mode: FUEL_MODULE_SHELL_READINESS_MODE,
    readinessEnabled: isModeloBase2FuelModuleShellReadinessEnabled(env),
    previewEnabled: isModeloBase2FuelModuleShellPreviewEnabled(env),
    routePlanEnabled: isModeloBase2FuelModuleRoutePlanEnabled(env),
    menuPlanEnabled: isModeloBase2FuelModuleMenuPlanEnabled(env),
    // Structural invariants — this layer never registers/mounts anything.
    moduleRegistered: false,
    routeRegistered: false,
    menuRegistered: false,
  };
}

export default resolveModeloBase2FuelModuleShellConfig;
