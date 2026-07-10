import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../../shadow/pilots/tableFormProjection.js';
import { EmpresasGuardedReadUiOverlayError } from './errors.js';
import {
  isEmpresasGuardedReadUiOverlayEnabled,
  isEmpresasGuardedReadUiOverlayProductionBlocked,
  isEmpresasGuardedReadUiOverlayProductionEnv,
  EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG,
} from './empresasGuardedReadUiOverlayConfig.js';
import { BLOCKED_WRITE_OPERATIONS } from '../../empresas-readonly/empresasReadOnlyWriteGuard.js';

/** @param {string} code @param {string} message */
function diagError(code, message) {
  return new EmpresasGuardedReadUiOverlayError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas guarded read UI
 * overlay: flag/guarded-UI status, parity + difference counts, readiness/
 * rollback status, write guard status, limitations, warnings, and the no-side-
 * effects marker. Masks sensitive data and returns a safe deep copy. Executes
 * nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../../types/empresas-guarded-read-ui-slice.js').EmpresasGuardedReadUiModel|null} [options.guardedReadUi]
 * @param {boolean} [options.writeGuardActive]
 * @param {string[]} [options.warnings]
 * @returns {import('../../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayDiagnostics}
 */
export function createEmpresasGuardedReadUiOverlayDiagnostics(options = {}) {
  validateProjectionInput(options, 0, 'Empresas guarded read UI overlay diagnostics options', diagError);
  if (!isPlainObject(options)) {
    throw diagError('MAK-L3-EMP-OVERLAY-003', 'createEmpresasGuardedReadUiOverlayDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasGuardedReadUiOverlayEnabled(env);
  const productionBlocked = isEmpresasGuardedReadUiOverlayProductionBlocked(env);
  const production = isEmpresasGuardedReadUiOverlayProductionEnv(env);
  const guardedReadUi = isPlainObject(options.guardedReadUi) ? options.guardedReadUi : null;
  const parityStatus = guardedReadUi ? guardedReadUi.parityStatus : 'skipped';
  const summary = guardedReadUi && guardedReadUi.dualReadCompare ? guardedReadUi.dualReadCompare.summary : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — guarded read UI overlay skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — overlay fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-guarded-read-ui-overlay-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_GUARDED_READ_UI_OVERLAY_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    guardedReadUiStatus: guardedReadUi ? (guardedReadUi.enabled ? 'enabled' : 'skipped') : (enabled ? 'available' : 'skipped'),
    parityStatus,
    totalDifferences: summary ? summary.totalDifferences : 0,
    blockingCount: summary ? summary.blockingCount : 0,
    criticalCount: summary ? summary.criticalCount : 0,
    readinessStatus: summary ? (summary.parityStatus === 'blocked' ? 'drift-resolution-required' : 'ready-for-parity-hardening') : 'skipped',
    rollbackStatus: 'available',
    writeGuardStatus: options.writeGuardActive === false ? 'inactive' : 'active',
    blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    noSideEffects: true,
    limitations: [
      'dev-only overlay — a preview panel inside the runtime v2 dev preview, never the real screen',
      'read-only — never saves/edits/deletes',
      'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
      'reversible by feature flag off',
    ],
    warnings,
  };
  return /** @type {any} */ (redactSensitive(safeClone(model)));
}
