import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_CONTRACT_CAPABILITIES, uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Emits the SAFETY POLICY for the runtime UI contract — the invariant assertion that no
 * forbidden side effect and no UI runtime were produced. Pure. Mirrors the frozen capability
 * flags and asserts every forbidden capability (including `visualRuntimeImplemented`) is false.
 *
 * @param {Object} [options]
 * @returns {Object} safety policy descriptor
 */
export function createRuntimeUiSafetyPolicy(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const caps = RUNTIME_UI_CONTRACT_CAPABILITIES;

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
    kind: 'runtime-ui-safety-policy',
    moduleId: String(o.frameMapping?.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    headless: true,
    contractOnly: true,
    failClosed: true,
    visualRuntimeImplemented: false,
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    forbiddenFlags: forbiddenKeys.reduce((acc, k) => { acc[k] = caps[k] === true; return acc; }, {}),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, safetyPolicyDigest: uiContractDigest(core) });
}

export default createRuntimeUiSafetyPolicy;
