import {
  isGenericModelPlainObject,
  createGenericModelFallback,
  createGenericModelRollbackPlan,
} from '../../runtime/generic-model/index.js';
import { MODELOBASE1_MODEL_ID } from './mapModeloBase1RuntimeReadToGenericModel.js';

/**
 * Builds a generic FALLBACK state + ROLLBACK PLAN for a ModeloBase1 scenario.
 * Pure and passive — it never executes a rollback and never touches a backend/
 * Prisma/runtime bridge. Covers: runtime read absent/invalid, generic read
 * validation failure, write validation failure, snapshot validation failure,
 * adapter failure.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operation]
 * @param {'runtime-read-model-absent'|'invalid-read-model'|'write-validation-failed'|'snapshot-validation-failed'|'adapter-failure'} [options.reason]
 * @returns {{ fallback: Object, rollbackPlan: Object }}
 */
export function createModeloBase1GenericFallbackBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const reason = typeof o.reason === 'string' ? o.reason : 'runtime-read-model-absent';

  const fallback = createGenericModelFallback({
    modelId: MODELOBASE1_MODEL_ID,
    moduleId,
    operation: typeof o.operation === 'string' ? o.operation : 'adapter',
    reason,
    source: 'legacy',
  });
  const rollbackPlan = createGenericModelRollbackPlan({
    modelId: MODELOBASE1_MODEL_ID,
    moduleId,
    strategy: 'flag-off',
    flags: ['MAK_MODELOBASE1_EMPRESAS_BETA', 'MAK_MODELOBASE1_CADCPS_BETA'],
    resetTargets: ['local-draft', 'generic-adapter'],
  });

  return { fallback, rollbackPlan };
}

export default createModeloBase1GenericFallbackBridge;
