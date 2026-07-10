import {
  isPlainObject,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadSlotError } from './errors.js';

/** The dev-only flags a read slot mount would require to even be considered. */
export const SLOT_MOUNT_REQUIRED_FLAGS = [
  'MAK_RUNTIME_V2_EMPRESAS_READONLY',
  'MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE',
  'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI',
  'MAK_RUNTIME_V2_EMPRESAS_GUARDED_READ_UI_OVERLAY',
  'MAK_RUNTIME_V2_EMPRESAS_READ_UI_PARITY_HARDENING',
  'MAK_RUNTIME_V2_EMPRESAS_READ_UI_BRIDGE_DRY_RUN',
  'MAK_RUNTIME_V2_EMPRESAS_READ_SLOT_CANDIDATE',
];

/** Stable, deterministic mount plan id — a pure function of its inputs. */
const MOUNT_PLAN_ID = 'empresas-runtime-bridge-read-slot-mount-plan';

/**
 * Builds the deterministic READ SLOT MOUNT PLAN — it MOUNTS NOTHING. It
 * evaluates preconditions from the bridge dry run, the slot contract, and the
 * payload validation, and reports whether a FUTURE dev activation WOULD be safe.
 * It never renders, never touches `src/App.jsx`, the real Empresas screen, or the
 * real runtime bridge; it never calls the backend, never writes.
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasReadUiRuntimeBridgeDryRunModel} [options.dryRun]
 * @param {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotContract} [options.contract]
 * @param {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotPayloadValidation} [options.payloadValidation]
 * @returns {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotMountPlan}
 */
export function createEmpresasRuntimeBridgeReadSlotMountPlan(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasReadSlotError('MAK-L3-EMP-READ-SLOT-003', 'createEmpresasRuntimeBridgeReadSlotMountPlan() options must be a plain object');
  }
  const dryRun = isPlainObject(options.dryRun) ? options.dryRun : null;
  const contract = isPlainObject(options.contract) ? options.contract : null;
  const validation = isPlainObject(options.payloadValidation) ? options.payloadValidation : null;

  /** @type {Array<{ id: string, ok: boolean, detail: string }>} */
  const preconditions = [];
  const check = (id, ok, detail) => preconditions.push({ id, ok: Boolean(ok), detail: String(detail) });

  check('dryRun.enabled', dryRun && dryRun.enabled === true, `dryRun.enabled=${dryRun ? dryRun.enabled : 'n/a'}`);
  check('dryRun.bridgeReady', dryRun && dryRun.bridgeReady === true, `bridgeReady=${dryRun ? dryRun.bridgeReady : 'n/a'}`);
  check('dryRun.ready', dryRun && dryRun.readinessStatus === 'ready_for_next_slice', `readinessStatus=${dryRun ? dryRun.readinessStatus : 'n/a'}`);
  check('dryRun.mountSafe', dryRun && dryRun.mountSimulation && dryRun.mountSimulation.safeToProceed === true, `mount.safeToProceed=${dryRun && dryRun.mountSimulation ? dryRun.mountSimulation.safeToProceed : 'n/a'}`);
  check('dryRun.noBlockers', dryRun && Array.isArray(dryRun.blockers) && dryRun.blockers.length === 0, `blockers=${dryRun && Array.isArray(dryRun.blockers) ? dryRun.blockers.length : 'n/a'}`);
  check('contract.readOnly', contract && contract.mode === 'read_only' && contract.safety && contract.safety.writeImpossible === true, `contract.mode=${contract ? contract.mode : 'n/a'}`);
  check('payload.valid', validation && validation.valid === true && validation.safeToProceed === true, `payload.valid=${validation ? validation.valid : 'n/a'}`);

  const blockedReasons = preconditions.filter((p) => !p.ok).map((p) => `${p.id}: ${p.detail}`);
  const allOk = blockedReasons.length === 0;
  /** @type {string[]} */
  const warnings = [];
  if (dryRun && Array.isArray(dryRun.warnings) && dryRun.warnings.length > 0) warnings.push(`dry run has ${dryRun.warnings.length} warning(s)`);

  const model = {
    kind: 'empresas-runtime-bridge-read-slot-mount-plan',
    mountPlanId: MOUNT_PLAN_ID,
    slotId: contract ? contract.slotId : 'empresas-runtime-bridge-read-slot',
    dryRunVerified: Boolean(dryRun && dryRun.enabled === true),
    wouldMount: allOk,
    mountTarget: 'dev_preview_only',
    futureMountTarget: 'runtime_bridge_read_slot',
    requiredFlags: [...SLOT_MOUNT_REQUIRED_FLAGS],
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
    evidence: 'plan only — no render, no mount, no runtime bridge access',
  };
  return /** @type {any} */ (safeClone(model));
}
