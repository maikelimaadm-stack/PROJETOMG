import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasGuardedReadUiError } from './errors.js';
import {
  isEmpresasGuardedReadUiEnabled,
  isEmpresasGuardedReadUiProductionBlocked,
  isEmpresasGuardedReadUiProductionEnv,
  EMPRESAS_GUARDED_READ_UI_FLAG,
} from './empresasGuardedReadUiConfig.js';
import { BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';

/** @param {string} code @param {string} message */
function diagError(code, message) {
  return new EmpresasGuardedReadUiError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas guarded read UI
 * slice: flag/view-model/compare status, parity status + difference summary,
 * readiness/rollback status, write guard status, limitations, warnings, and the
 * no-side-effects marker. Masks sensitive data and returns a safe deep copy.
 * Executes nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel|null} [options.viewModel]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').DualReadSummary|null} [options.summary]
 * @param {boolean} [options.writeGuardActive]
 * @param {string[]} [options.warnings]
 * @returns {import('../../types/empresas-guarded-read-ui-slice.js').EmpresasGuardedReadUiDiagnostics}
 */
export function createEmpresasGuardedReadUiDiagnostics(options = {}) {
  validateProjectionInput(options, 0, 'Empresas guarded read UI diagnostics options', diagError);
  if (!isPlainObject(options)) {
    throw diagError('MAK-L3-EMP-GUARDED-UI-003', 'createEmpresasGuardedReadUiDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasGuardedReadUiEnabled(env);
  const productionBlocked = isEmpresasGuardedReadUiProductionBlocked(env);
  const production = isEmpresasGuardedReadUiProductionEnv(env);
  const viewModel = isPlainObject(options.viewModel) ? options.viewModel : null;
  const summary = isPlainObject(options.summary) ? options.summary : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — guarded read UI skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — guarded read UI fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-guarded-read-ui-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_GUARDED_READ_UI_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    viewModelStatus: viewModel ? 'built' : (enabled ? 'available' : 'skipped'),
    compareStatus: summary ? 'compared' : (enabled ? 'available' : 'skipped'),
    parityStatus: summary ? summary.parityStatus : 'skipped',
    totalDifferences: summary ? summary.totalDifferences : 0,
    blockingCount: summary ? summary.blockingCount : 0,
    criticalCount: summary ? summary.criticalCount : 0,
    readinessStatus: summary ? (summary.parityStatus === 'blocked' ? 'drift-resolution-required' : 'ready-for-overlay') : 'skipped',
    rollbackStatus: 'available',
    writeGuardStatus: options.writeGuardActive === false ? 'inactive' : 'active',
    blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    noSideEffects: true,
    limitations: [
      'read-only UI — never saves/edits/deletes',
      'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
      'dev-only — never in the real screen or the main menu',
      'reversible by feature flag off',
    ],
    warnings,
  };
  return /** @type {any} */ (redactSensitive(safeClone(model)));
}
