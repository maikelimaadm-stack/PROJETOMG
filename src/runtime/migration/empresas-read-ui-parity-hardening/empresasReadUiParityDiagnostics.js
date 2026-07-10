import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadUiParityError } from './errors.js';
import {
  isEmpresasReadUiParityEnabled,
  isEmpresasReadUiParityProductionBlocked,
  isEmpresasReadUiParityProductionEnv,
  EMPRESAS_READ_UI_PARITY_FLAG,
} from './empresasReadUiParityConfig.js';
import { BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';

/** @param {string} code @param {string} message */
function diagError(code, message) {
  return new EmpresasReadUiParityError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas read UI parity
 * hardening: flag/overlay/guarded-UI/dual-read/read-only status, parity score,
 * readiness, blockers, warnings, limitations, rollback/write-guard status, and
 * the no-side-effects marker. Masks sensitive data and returns a safe deep copy.
 * Executes nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-guarded-read-ui-overlay.js').EmpresasGuardedReadUiOverlayModel|null} [options.overlayModel]
 * @param {import('../../types/empresas-read-ui-parity-hardening.js').ParityScore|null} [options.score]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @param {boolean} [options.writeGuardActive]
 * @returns {import('../../types/empresas-read-ui-parity-hardening.js').EmpresasReadUiParityDiagnostics}
 */
export function createEmpresasReadUiParityDiagnostics(options = {}) {
  // Inputs (overlayModel/score) are trusted internal models — read specific fields, no deep scan.
  if (!isPlainObject(options)) {
    throw diagError('MAK-L3-EMP-PARITY-003', 'createEmpresasReadUiParityDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasReadUiParityEnabled(env);
  const productionBlocked = isEmpresasReadUiParityProductionBlocked(env);
  const production = isEmpresasReadUiParityProductionEnv(env);
  const ovl = isPlainObject(options.overlayModel) ? options.overlayModel : null;
  const g = ovl && isPlainObject(ovl.guardedReadUi) ? ovl.guardedReadUi : null;
  const score = isPlainObject(options.score) ? options.score : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — parity hardening skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — hardening fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-read-ui-parity-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_READ_UI_PARITY_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    overlayStatus: ovl ? (ovl.enabled ? 'enabled' : 'skipped') : (enabled ? 'available' : 'skipped'),
    guardedReadUiStatus: g ? (g.enabled ? 'enabled' : 'skipped') : (enabled ? 'available' : 'skipped'),
    dualReadStatus: g && g.dualReadCompare ? g.dualReadCompare.parityStatus : 'skipped',
    readOnlyCandidateStatus: g && g.readOnlyCandidate ? (g.readOnlyCandidate.enabled ? 'enabled' : 'skipped') : 'skipped',
    parityScore: score ? safeClone(score) : null,
    readinessStatus: score ? score.readinessStatus : 'skipped',
    blockers: Array.isArray(options.blockers) ? [...options.blockers] : [],
    warnings,
    limitations: [
      'dev-only hardening — a passive checklist/score inside the runtime v2 dev preview',
      'read-only — never saves/edits/deletes',
      'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
      'reversible by feature flag off',
    ],
    rollbackStatus: 'available',
    writeGuardStatus: options.writeGuardActive === false ? 'inactive' : 'active',
    writeBlocked: true,
    blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    noSideEffects: true,
  };
  return /** @type {any} */ (redactSensitive(safeClone(model)));
}
