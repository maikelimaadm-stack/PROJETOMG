import {
  isPlainObject,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasBridgeDryRunError } from './errors.js';

/**
 * The dev-only flags a read mount would require to even be considered.
 */
export const MOUNT_REQUIRED_FLAGS = [
  'MAK_RUNTIME_V2_EMPRESAS_READONLY',
  'MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE',
  'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI',
  'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY',
  'MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING',
  'MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN',
];

/** Stable, deterministic simulation id — the simulation is a pure function of its inputs. */
const SIMULATION_ID = 'empresas-runtime-bridge-mount-simulation';

/**
 * SIMULATES how the Empresas read UI could be mounted in a FUTURE dev-only read
 * slot — it MOUNTS NOTHING. It evaluates preconditions from the parity hardening
 * model and the read-only bridge contract and reports whether it WOULD be safe to
 * proceed. It never renders, never touches `src/App.jsx`, the real Empresas
 * screen, or the real runtime bridge; it never calls the backend, never writes.
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-read-ui-parity-hardening.js').EmpresasReadUiParityHardeningModel} [options.hardeningModel]
 * @param {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeReadContract} [options.contract]
 * @returns {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeMountSimulation}
 */
export function simulateEmpresasRuntimeBridgeReadMount(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasBridgeDryRunError('MAK-L3-EMP-BRIDGE-DRY-003', 'simulateEmpresasRuntimeBridgeReadMount() options must be a plain object');
  }
  const h = isPlainObject(options.hardeningModel) ? options.hardeningModel : null;
  const contract = isPlainObject(options.contract) ? options.contract : null;

  /** @type {Array<{ id: string, ok: boolean, detail: string }>} */
  const preconditions = [];
  const check = (id, ok, detail) => preconditions.push({ id, ok: Boolean(ok), detail: String(detail) });

  check('hardening.enabled', h && h.enabled === true, `hardening.enabled=${h ? h.enabled : 'n/a'}`);
  check('hardening.ready', h && h.readinessStatus === 'ready_for_next_slice', `readinessStatus=${h ? h.readinessStatus : 'n/a'}`);
  check('hardening.noBlockers', h && Array.isArray(h.blockers) && h.blockers.length === 0, `blockers=${h && Array.isArray(h.blockers) ? h.blockers.length : 'n/a'}`);
  check('score.noBlocking', h && h.parityScore && h.parityScore.blockingCount === 0, `blockingCount=${h && h.parityScore ? h.parityScore.blockingCount : 'n/a'}`);
  check('score.noCritical', h && h.parityScore && h.parityScore.criticalCount === 0, `criticalCount=${h && h.parityScore ? h.parityScore.criticalCount : 'n/a'}`);
  check('writeBlocked', h && h.writeBlocked === true, `writeBlocked=${h ? h.writeBlocked : 'n/a'}`);
  check('contract.readOnly', contract && contract.mode === 'read_only' && contract.safety && contract.safety.writeImpossible === true, `contract.mode=${contract ? contract.mode : 'n/a'}`);
  check('rollback.available', h && h.diagnostics && h.diagnostics.rollbackStatus === 'available', `rollbackStatus=${h && h.diagnostics ? h.diagnostics.rollbackStatus : 'n/a'}`);

  const blockedReasons = preconditions.filter((p) => !p.ok).map((p) => `${p.id}: ${p.detail}`);
  const allOk = blockedReasons.length === 0;
  /** @type {string[]} */
  const warnings = [];
  if (h && Array.isArray(h.warnings) && h.warnings.length > 0) warnings.push(`hardening has ${h.warnings.length} warning(s)`);

  const model = {
    kind: 'empresas-runtime-bridge-mount-simulation',
    simulationId: SIMULATION_ID,
    dryRun: true,
    wouldMount: allOk,
    mountTarget: 'dev_preview_only',
    futureMountTarget: 'future_guarded_slot',
    requiredFlags: [...MOUNT_REQUIRED_FLAGS],
    preconditions,
    blockedReasons,
    warnings,
    safeToProceed: allOk,
    rollback: { strategy: 'flag-off reversal', featureFlagDefault: 'off', destructive: false },
    noSideEffects: true,
    mountedAnythingReal: false,
    touchedAppJsx: false,
    touchedRealScreen: false,
    touchedRuntimeBridge: false,
    evidence: 'simulation only — no render, no mount, no runtime bridge access',
  };
  return /** @type {any} */ (safeClone(model));
}
