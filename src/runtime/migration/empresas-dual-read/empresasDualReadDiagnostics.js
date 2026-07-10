import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasDualReadError } from './errors.js';
import {
  isEmpresasDualReadEnabled,
  isEmpresasDualReadProductionBlocked,
  isEmpresasDualReadProductionEnv,
  EMPRESAS_DUAL_READ_FLAG,
} from './empresasDualReadConfig.js';

/** @param {string} code @param {string} message */
function diagError(code, message) {
  return new EmpresasDualReadError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas dual-read
 * compare: flag/snapshot/compare status, difference summary, readiness/rollback
 * status, write guard status, limitations, warnings, and the no-side-effects
 * marker. Masks sensitive data and returns a safe deep copy. Executes nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot|null} [options.legacySnapshot]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot|null} [options.runtimeV2Snapshot]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').DualReadSummary|null} [options.summary]
 * @param {boolean} [options.writeGuardActive]
 * @param {string[]} [options.warnings]
 * @returns {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasDualReadDiagnostics}
 */
export function createEmpresasDualReadDiagnostics(options = {}) {
  validateProjectionInput(options, 0, 'Empresas dual-read diagnostics options', diagError);
  if (!isPlainObject(options)) {
    throw diagError('MAK-L3-EMP-DUALREAD-003', 'createEmpresasDualReadDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasDualReadEnabled(env);
  const productionBlocked = isEmpresasDualReadProductionBlocked(env);
  const production = isEmpresasDualReadProductionEnv(env);
  const summary = isPlainObject(options.summary) ? options.summary : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — dual-read compare skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — compare fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-dual-read-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_DUAL_READ_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    legacySnapshotStatus: options.legacySnapshot ? 'built' : (enabled ? 'available' : 'skipped'),
    runtimeV2SnapshotStatus: options.runtimeV2Snapshot ? 'built' : (enabled ? 'available' : 'skipped'),
    compareStatus: summary ? 'compared' : (enabled ? 'available' : 'skipped'),
    differenceSummary: summary ? safeClone(summary) : null,
    parityStatus: summary ? summary.parityStatus : 'skipped',
    readinessStatus: summary ? (summary.parityStatus === 'blocked' ? 'drift-resolution-required' : 'ready-for-guarded-read-ui') : 'skipped',
    rollbackStatus: 'available',
    writeGuardStatus: options.writeGuardActive === false ? 'inactive' : 'active',
    noSideEffects: true,
    limitations: [
      'read-only compare — never saves/edits/deletes',
      'mock/controlled data only — no real data, no backend, no Prisma/MMM',
      'never replaces the real Empresas screen',
      'reversible by feature flag off',
    ],
    warnings,
  };
  return /** @type {any} */ (redactSensitive(safeClone(model)));
}
