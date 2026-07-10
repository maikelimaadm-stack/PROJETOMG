import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasBridgeDryRunError } from './errors.js';
import {
  isEmpresasBridgeDryRunEnabled,
  isEmpresasBridgeDryRunProductionBlocked,
  isEmpresasBridgeDryRunProductionEnv,
  EMPRESAS_BRIDGE_DRY_RUN_FLAG,
} from './empresasRuntimeBridgeDryRunConfig.js';
import { BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';

/**
 * Builds the deterministic, plain DIAGNOSTICS for the Empresas read UI runtime
 * bridge dry run: flag/hardening/overlay/guarded-UI/dual-read/read-only status,
 * bridge-contract + mount-simulation status, write-guard/rollback status,
 * blockers, warnings, limitations, and the no-side-effects marker. Masks
 * sensitive data and returns a safe deep copy. Executes nothing.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/empresas-read-ui-parity-hardening.js').EmpresasReadUiParityHardeningModel|null} [options.hardeningModel]
 * @param {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeReadContract|null} [options.contract]
 * @param {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeMountSimulation|null} [options.mountSimulation]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @param {boolean} [options.writeGuardActive]
 * @returns {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeDryRunDiagnostics}
 */
export function createEmpresasRuntimeBridgeDryRunDiagnostics(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasBridgeDryRunError('MAK-L3-EMP-BRIDGE-DRY-003', 'createEmpresasRuntimeBridgeDryRunDiagnostics() options must be a plain object');
  }
  const env = options.env;
  const enabled = isEmpresasBridgeDryRunEnabled(env);
  const productionBlocked = isEmpresasBridgeDryRunProductionBlocked(env);
  const production = isEmpresasBridgeDryRunProductionEnv(env);
  const h = isPlainObject(options.hardeningModel) ? options.hardeningModel : null;
  const contract = isPlainObject(options.contract) ? options.contract : null;
  const sim = isPlainObject(options.mountSimulation) ? options.mountSimulation : null;

  /** @type {string[]} */
  const warnings = [];
  if (!enabled && !productionBlocked) warnings.push('flag off — bridge dry run skipped (no side effects)');
  if (productionBlocked) warnings.push('production blocked — dry run fails closed without explicit override');
  for (const w of Array.isArray(options.warnings) ? options.warnings : []) {
    if (typeof w === 'string' && w.trim()) warnings.push(w.trim());
  }

  const model = {
    kind: 'empresas-runtime-bridge-dry-run-diagnostics',
    moduleId: 'empresas',
    flag: EMPRESAS_BRIDGE_DRY_RUN_FLAG,
    flagStatus: enabled ? 'on' : (productionBlocked ? 'blocked-in-production' : 'off'),
    enabled,
    production,
    productionBlocked,
    hardeningStatus: h ? (h.enabled ? h.readinessStatus : 'skipped') : (enabled ? 'available' : 'skipped'),
    overlayStatus: h && h.overlay ? (h.overlay.enabled ? 'enabled' : 'skipped') : 'skipped',
    guardedReadUiStatus: h && h.guardedReadUi ? (h.guardedReadUi.enabled ? 'enabled' : 'skipped') : 'skipped',
    readOnlyCandidateStatus: h && h.readOnlyCandidate ? (h.readOnlyCandidate.enabled ? 'enabled' : 'skipped') : 'skipped',
    dualReadStatus: h && h.dualReadCompare ? h.dualReadCompare.parityStatus : 'skipped',
    bridgeContractStatus: contract ? 'built' : (enabled ? 'available' : 'skipped'),
    mountSimulationStatus: sim ? (sim.safeToProceed ? 'safe-to-proceed' : 'blocked') : (enabled ? 'available' : 'skipped'),
    writeGuardStatus: options.writeGuardActive === false ? 'inactive' : 'active',
    rollbackStatus: 'available',
    blockers: Array.isArray(options.blockers) ? [...options.blockers] : [],
    warnings,
    limitations: [
      'dry run only — simulates a future read-only bridge, mounts nothing real',
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
