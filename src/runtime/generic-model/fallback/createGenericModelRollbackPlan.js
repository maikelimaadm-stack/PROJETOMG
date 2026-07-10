import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';

/**
 * Builds a Generic Model ROLLBACK PLAN — a declarative description of how to
 * revert, NOT an executor. It lists strategy/steps/flags/reset targets. Pure and
 * passive; it never performs a rollback and never touches a backend/Prisma/
 * runtime bridge. Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {'flag-off'|'reset-draft'|'clear-snapshots'|'revert-pr'} [options.strategy]
 * @param {string[]} [options.flags] Flags to turn off.
 * @param {string[]} [options.resetTargets]
 * @returns {Object}
 */
export function createGenericModelRollbackPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const strategy = ['flag-off', 'reset-draft', 'clear-snapshots', 'revert-pr'].includes(o.strategy) ? o.strategy : 'flag-off';
  const flags = Array.isArray(o.flags) ? o.flags.map(String) : [];
  const resetTargets = Array.isArray(o.resetTargets) ? o.resetTargets.map(String) : [];

  const steps = [];
  if (strategy === 'flag-off') steps.push('disable the feature flag(s)', 'engine falls back to legacy/previous behavior');
  if (strategy === 'reset-draft') steps.push('discard the local draft', 'rehydrate from the original read model');
  if (strategy === 'clear-snapshots') steps.push('clear in-memory snapshots for the module', 'no persisted state to undo');
  if (strategy === 'revert-pr') steps.push('git revert the PR', 'the additive layer is removed cleanly');

  return safeCloneGenericModel({
    kind: 'generic-model-rollback-plan',
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    rollbackAvailable: true,
    strategy,
    steps,
    flags,
    resetTargets,
    safety: {
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistenceReal: false,
      executesRollback: false, // this is a PLAN, not an executor
    },
    diagnostics: { noSideEffects: true },
  });
}

export default createGenericModelRollbackPlan;
