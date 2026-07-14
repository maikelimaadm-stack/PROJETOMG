import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Emits SAFETY plan metadata — the invariant assertion that this implementation plan produced
 * no runtime and no side effect. Pure, metadata-only. Mirrors the frozen headless capability
 * flags and asserts every side-effect capability (and `runtimeImplemented`) is false.
 *
 * @param {Object} [options]
 * @returns {Object} safety plan metadata
 */
export function createIsolatedRuntimeSafetyPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const caps = IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES;

  const sideEffectKeys = [
    'runtimeImplemented', 'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated',
    'cssCreated', 'uiCreated', 'routeCreated', 'menuCreated', 'moduleGenerated',
    'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed',
    'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated',
    'rewriteEmpresas',
  ];
  const anySideEffect = sideEffectKeys.some((k) => caps[k] === true);

  const core = {
    kind: 'isolated-runtime-safety-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    headless: true,
    contractOnly: true,
    runtimeImplemented: false,
    anySideEffect,
    realDataRead: false,
    realDataWrite: false,
    domCreated: false,
    cssCreated: false,
    reversibleByNonConsumption: true,
    sideEffectFlags: sideEffectKeys.reduce((acc, k) => { acc[k] = caps[k] === true; return acc; }, {}),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, safetyPlanDigest: planDigest(core) });
}

export default createIsolatedRuntimeSafetyPlan;
