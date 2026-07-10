import { isPlainObject, safeClone } from '../safety.js';
import { createModeloBase1LocalWriteContract } from './createModeloBase1LocalWriteContract.js';
import { createModeloBase1LocalWriteController } from './createModeloBase1LocalWriteController.js';
import { createModeloBase1LocalWriteDiagnostics } from './modeloBase1LocalWriteDiagnostics.js';
import { isModeloBase1LocalWritePlanEnabled } from './modeloBase1LocalWriteConfig.js';
import { localWriteError } from './errors.js';

/**
 * Top-level CONTROLLED LOCAL WRITE PLAN for a ModeloBase1 beta screen. It ties
 * together the contract, the in-memory controller (only when the plan flag is
 * on) and diagnostics. It is PLAN-ONLY / LOCAL-ONLY in this slice: no backend,
 * no Prisma, no fetch, no storage, no runtime bridge. The runtime read model
 * beta remains the read base; local mutations run against a safe copy.
 *
 * @param {Object} options
 * @param {string} [options.moduleId]
 * @param {Object} [options.readState] The applied runtime read state (read base).
 * @param {Object} [options.runtimeReadModel] Alternative read source.
 * @param {Record<string, unknown>} [options.env] Explicit env (for testing).
 * @returns {Object}
 */
export function createModeloBase1ControlledLocalWritePlan(options = {}) {
  if (!isPlainObject(options)) {
    throw localWriteError('MAK-MB1-LW-001', 'createModeloBase1ControlledLocalWritePlan() options must be a plain object');
  }
  const source = isPlainObject(options.readState)
    ? options.readState
    : (isPlainObject(options.runtimeReadModel) ? options.runtimeReadModel : {});
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (typeof source.moduleId === 'string' ? source.moduleId : 'unknown');
  const enabled = isModeloBase1LocalWritePlanEnabled(moduleId, options.env);

  const contract = createModeloBase1LocalWriteContract({ moduleId, enabled });
  // The controller only exists when the plan flag is on (rollback = flag off).
  const controller = enabled
    ? createModeloBase1LocalWriteController({ readState: source, moduleId })
    : null;
  const diagnostics = createModeloBase1LocalWriteDiagnostics({ moduleId, enabled, ready: enabled });

  const plan = {
    kind: 'modelobase1-controlled-local-write-plan',
    moduleId,
    enabled,
    localWriteReady: enabled,
    contract,
    diagnostics,
    fallbackAvailable: true,
    rollbackAvailable: true,
    localOnly: true,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistence: 'none',
    noSideEffects: true,
    nextAllowedStep: 'ModeloBase1 Controlled Local Write Activation',
  };
  // safeClone the plain plan, then re-attach the live controller (its methods
  // are dropped by the JSON clone).
  const cloned = /** @type {any} */ (safeClone(plan));
  cloned.controller = controller;
  return cloned;
}

export default createModeloBase1ControlledLocalWritePlan;
