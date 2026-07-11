import {
  isGenericModelPlainObject,
  createGenericModelFallback,
  createGenericModelRollbackPlan,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_PROTOTYPE_FLAG,
  MODELOBASE2_OPERATIONAL_ADAPTER_FLAG,
  MODELOBASE2_LOCAL_EVENT_DRAFT_FLAG,
} from './modeloBase2PrototypeConfig.js';

/**
 * Builds a generic FALLBACK + ROLLBACK PLAN for a ModeloBase2 operational scenario.
 * Passive — it never executes a rollback and never touches a backend/Prisma/
 * runtime bridge. Covers: flag off, invalid read model, invalid event, invalid
 * payload, invalid mutation, invalid snapshot, adapter failure.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {'flag-off'|'invalid-read-model'|'invalid-event'|'invalid-payload'|'invalid-mutation'|'invalid-snapshot'|'adapter-failure'} [options.reason]
 * @returns {{ fallback: Object, rollbackPlan: Object }}
 */
export function createModeloBase2OperationalFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype';
  const reason = typeof o.reason === 'string' ? o.reason : 'flag-off';

  const fallback = createGenericModelFallback({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    operation: typeof o.operation === 'string' ? o.operation : 'operationalPrototype',
    reason,
    source: 'legacy',
  });
  const rollbackPlan = createGenericModelRollbackPlan({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    strategy: reason === 'flag-off' ? 'flag-off' : 'reset-draft',
    flags: [MODELOBASE2_PROTOTYPE_FLAG, MODELOBASE2_OPERATIONAL_ADAPTER_FLAG, MODELOBASE2_LOCAL_EVENT_DRAFT_FLAG],
    resetTargets: ['operational-draft', 'local-event-timeline'],
  });

  return { fallback, rollbackPlan };
}

export default createModeloBase2OperationalFallback;
