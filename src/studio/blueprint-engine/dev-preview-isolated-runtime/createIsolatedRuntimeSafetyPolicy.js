import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_RUNTIME_CAPABILITIES, runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Emits the SAFETY POLICY for the isolated runtime — the invariant assertion that the runtime,
 * while implemented (`isolatedRuntimeImplemented: true`), produced no forbidden side effect.
 * Pure. Mirrors the frozen capability flags and asserts every forbidden capability is false.
 *
 * @param {Object} [options]
 * @returns {Object} safety policy descriptor
 */
export function createIsolatedRuntimeSafetyPolicy(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const caps = ISOLATED_RUNTIME_CAPABILITIES;

  const forbiddenKeys = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'visualRuntimeImplemented', 'reactRuntimeCreated', 'domRuntimeCreated', 'cssRuntimeCreated',
    'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed',
    'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed',
    'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas',
  ];
  const anyForbiddenSideEffect = forbiddenKeys.some((k) => caps[k] === true);

  const core = {
    kind: 'isolated-runtime-safety-policy',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    devOnly: true,
    isolated: true,
    failClosed: true,
    isolatedRuntimeImplemented: caps.isolatedRuntimeImplemented === true,
    visualRuntimeImplemented: false,
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    forbiddenFlags: forbiddenKeys.reduce((acc, k) => { acc[k] = caps[k] === true; return acc; }, {}),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, safetyPolicyDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeSafetyPolicy;
