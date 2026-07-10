import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadSlotError } from './errors.js';
import {
  isEmpresasReadSlotEnabled,
  isEmpresasReadSlotProductionBlocked,
  isEmpresasReadSlotProductionEnv,
  EMPRESAS_READ_SLOT_FLAG,
} from './empresasRuntimeBridgeReadSlotConfig.js';
import { BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas runtime bridge
 * read slot candidate. Masks sensitive data and returns a safe deep copy.
 * Executes nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasReadUiRuntimeBridgeDryRunModel|null} [options.dryRun]
 * @param {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotContract|null} [options.contract]
 * @param {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotPayloadValidation|null} [options.payloadValidation]
 * @param {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotMountPlan|null} [options.mountPlan]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @param {boolean} [options.writeGuardActive]
 * @returns {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotDiagnostics}
 */
export function createEmpresasRuntimeBridgeReadSlotDiagnostics(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasReadSlotError('MAK-L3-EMP-READ-SLOT-003', 'createEmpresasRuntimeBridgeReadSlotDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasReadSlotEnabled(env);
  const productionBlocked = isEmpresasReadSlotProductionBlocked(env);
  const production = isEmpresasReadSlotProductionEnv(env);
  const dryRun = isPlainObject(options.dryRun) ? options.dryRun : null;
  const contract = isPlainObject(options.contract) ? options.contract : null;
  const validation = isPlainObject(options.payloadValidation) ? options.payloadValidation : null;
  const mountPlan = isPlainObject(options.mountPlan) ? options.mountPlan : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — read slot candidate skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — read slot candidate fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-runtime-bridge-read-slot-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_READ_SLOT_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    bridgeDryRunStatus: dryRun ? (dryRun.enabled ? dryRun.readinessStatus : 'skipped') : (enabled ? 'available' : 'skipped'),
    hardeningStatus: dryRun && dryRun.hardening ? (dryRun.hardening.readinessStatus ?? 'available') : 'skipped',
    overlayStatus: dryRun && dryRun.overlay ? (dryRun.overlay.enabled ? 'enabled' : 'skipped') : 'skipped',
    guardedReadUiStatus: dryRun && dryRun.guardedReadUi ? (dryRun.guardedReadUi.enabled ? 'enabled' : 'skipped') : 'skipped',
    readOnlyCandidateStatus: dryRun && dryRun.readOnlyCandidate ? (dryRun.readOnlyCandidate.enabled ? 'enabled' : 'skipped') : 'skipped',
    readSlotContractStatus: contract ? 'built' : (enabled ? 'available' : 'skipped'),
    payloadValidationStatus: validation ? (validation.valid ? 'valid' : 'invalid') : (enabled ? 'available' : 'skipped'),
    mountPlanStatus: mountPlan ? (mountPlan.safeToProceed ? 'safe-to-proceed' : 'blocked') : (enabled ? 'available' : 'skipped'),
    writeGuardStatus: options.writeGuardActive === false ? 'inactive' : 'active',
    rollbackStatus: 'available',
    blockers: Array.isArray(options.blockers) ? [...options.blockers] : [],
    warnings,
    limitations: [
      'candidate only — a controlled future read slot, never mounted in the real screen',
      'read-only — never saves/edits/deletes',
      'mock/controlled data only — no real data as primary source, no backend, no Prisma/MMM',
      'never alters the real runtime bridge / makBootstrap',
      'reversible by feature flag off',
    ],
    writeBlocked: true,
    blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    noSideEffects: true,
  };
  return /** @type {any} */ (redactSensitive(safeClone(model)));
}
