import {
  isGenericModelPlainObject,
  createGenericModelFallback,
  createGenericModelRollbackPlan,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_FLAG,
  MODELOBASE2_OPERATIONAL_SESSION_FLAG,
  MODELOBASE2_OPERATIONAL_EVENT_LOG_FLAG,
  MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_FLAG,
} from './modeloBase2OperationalRuntimeConfig.js';

/**
 * Builds a generic FALLBACK + ROLLBACK PLAN for an operational runtime scenario.
 * Passive — never executes a rollback, never touches a backend/Prisma/runtime
 * bridge. Covers: flag off, runtime disabled, invalid command, invalid payload,
 * invalid state transition, invalid snapshot, adapter failure, event log failure.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {'flag-off'|'runtime-disabled'|'invalid-command'|'invalid-payload'|'invalid-transition'|'invalid-snapshot'|'adapter-failure'|'event-log-failure'} [options.reason]
 * @returns {{ fallback: Object, rollbackPlan: Object }}
 */
export function createModeloBase2OperationalRuntimeFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime';
  const reason = typeof o.reason === 'string' ? o.reason : 'flag-off';

  const fallback = createGenericModelFallback({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    operation: typeof o.operation === 'string' ? o.operation : 'operationalRuntime',
    reason,
    source: 'legacy',
  });
  const rollbackPlan = createGenericModelRollbackPlan({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    strategy: reason === 'flag-off' || reason === 'runtime-disabled' ? 'flag-off' : 'reset-draft',
    flags: [
      MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_FLAG,
      MODELOBASE2_OPERATIONAL_SESSION_FLAG,
      MODELOBASE2_OPERATIONAL_EVENT_LOG_FLAG,
      MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_FLAG,
    ],
    resetTargets: ['operational-session', 'operational-draft', 'operational-event-log'],
  });

  return { fallback, rollbackPlan };
}

export default createModeloBase2OperationalRuntimeFallback;
