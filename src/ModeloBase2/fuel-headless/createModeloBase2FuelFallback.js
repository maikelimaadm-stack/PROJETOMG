import {
  isGenericModelPlainObject,
  createGenericModelFallback,
  createGenericModelRollbackPlan,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  FUEL_HEADLESS_CANDIDATE_FLAG,
  FUEL_OPERATIONAL_ADAPTER_FLAG,
  FUEL_LOCAL_EVENT_DRAFT_FLAG,
  FUEL_SNAPSHOT_VALIDATION_FLAG,
} from './modeloBase2FuelHeadlessConfig.js';

/**
 * Builds a generic FALLBACK + ROLLBACK PLAN for a fuel-headless scenario. Passive —
 * never executes a rollback, never touches a backend/Prisma/runtime bridge.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {'flag-off'|'candidate-disabled'|'invalid-command'|'invalid-payload'|'runtime-unavailable'|'invalid-snapshot'|'adapter-failure'|'unsafe-payload'} [options.reason]
 * @returns {{ fallback: Object, rollbackPlan: Object }}
 */
export function createModeloBase2FuelFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';
  const reason = typeof o.reason === 'string' ? o.reason : 'flag-off';

  const fallback = createGenericModelFallback({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    operation: typeof o.operation === 'string' ? o.operation : 'fuelHeadlessCandidate',
    reason,
    source: 'legacy',
  });
  const rollbackPlan = createGenericModelRollbackPlan({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    strategy: reason === 'flag-off' || reason === 'candidate-disabled' ? 'flag-off' : 'reset-draft',
    flags: [FUEL_HEADLESS_CANDIDATE_FLAG, FUEL_OPERATIONAL_ADAPTER_FLAG, FUEL_LOCAL_EVENT_DRAFT_FLAG, FUEL_SNAPSHOT_VALIDATION_FLAG],
    resetTargets: ['fuel-draft', 'fuel-event-log', 'operational-session'],
  });

  return { fallback, rollbackPlan };
}

export default createModeloBase2FuelFallback;
