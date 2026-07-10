import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadOnlyError } from './errors.js';
import {
  isEmpresasReadOnlyEnabled,
  isEmpresasReadOnlyProductionBlocked,
  isEmpresasReadOnlyProductionEnv,
  EMPRESAS_READONLY_FLAG,
} from './empresasReadOnlyConfig.js';
import { BLOCKED_WRITE_OPERATIONS } from './empresasReadOnlyWriteGuard.js';

/** @param {string} code @param {string} message */
function diagError(code, message) {
  return new EmpresasReadOnlyError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas read-only
 * candidate: flag/readiness/source/projection/dataset/shadow status, blocked
 * operations, limitations, warnings, differences, and rollback status. It
 * masks sensitive data and returns a safe deep copy. It executes nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel|null} [options.viewModel]
 * @param {Array<{path: string}>} [options.differences]
 * @param {string[]} [options.warnings]
 * @returns {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyDiagnostics}
 */
export function createEmpresasReadOnlyDiagnostics(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read-only diagnostics options', diagError);
  if (!isPlainObject(options)) {
    throw diagError('MAK-L3-EMP-READONLY-004', 'createEmpresasReadOnlyDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasReadOnlyEnabled(env);
  const productionBlocked = isEmpresasReadOnlyProductionBlocked(env);
  const production = isEmpresasReadOnlyProductionEnv(env);
  const viewModel = isPlainObject(options.viewModel) ? options.viewModel : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — read-only candidate skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — candidate fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-readonly-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_READONLY_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    readinessStatus: 'read_only_candidate',
    sourceStatus: enabled ? (viewModel ? viewModel.source : 'not-built') : 'skipped',
    projectionStatus: viewModel ? 'built' : (enabled ? 'available' : 'skipped'),
    datasetStatus: viewModel && viewModel.datasetDiagnostics ? 'available' : (enabled ? 'available' : 'skipped'),
    shadowStatus: 'available',
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    differences: Array.isArray(options.differences) ? safeClone(options.differences) : [],
    limitations: [
      'read-only — never saves/edits/deletes',
      'mock/controlled data only — no real data, no backend, no Prisma',
      'never replaces the real Empresas screen',
      'never becomes the source of truth',
      'reversible by feature flag off',
    ],
    warnings,
    rollbackStatus: 'available',
  };
  return /** @type {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyDiagnostics} */ (redactSensitive(safeClone(model)));
}
