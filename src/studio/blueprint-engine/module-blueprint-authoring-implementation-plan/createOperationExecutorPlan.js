import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_OPERATION_IDS, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Operation executor PLAN — plans future execution of ONLY the allow-listed operations from the
 * foundation contract; unknown operations fail closed. No side-effects/persistence/module writes.
 * Metadata only.
 * @returns {Object}
 */
export function createOperationExecutorPlan() {
  const operations = AUTHORING_OPERATION_IDS.map((id) => ({
    operationId: id,
    planned: true,
    implemented: false,
    sideEffectsAllowed: false,
    persistenceAllowed: false,
    moduleWriteAllowed: false,
  }));

  const core = {
    kind: 'authoring-operation-executor-plan',
    operationExecutorPlanned: true,
    operationExecutorImplemented: false,
    allowlistOnly: true,
    allowlist: [...AUTHORING_OPERATION_IDS],
    unknownOperationsFailClosed: true,
    operations,
    operationCount: operations.length,
    anyImplemented: false,
    sideEffectsAllowed: false,
    persistenceAllowed: false,
    moduleWriteAllowed: false,
  };
  return safeCloneGenericModel({ ...core, operationExecutorPlanDigest: authoringPlanDigest(core) });
}

export default createOperationExecutorPlan;
