import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_SHELL_HEADLESS_CAPABILITIES, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Emits RUNTIME SAFETY metadata — the invariant assertion that this runtime shell contract
 * produced no runtime side effect. Pure, metadata-only. Mirrors the frozen headless capability
 * flags and asserts every side-effect capability is false.
 *
 * @param {Object} [options]
 * @returns {Object} runtime safety metadata
 */
export function createDevPreviewRuntimeShellSafetyMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const caps = RUNTIME_SHELL_HEADLESS_CAPABILITIES;

  const sideEffectKeys = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
    'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas',
  ];
  const anySideEffect = sideEffectKeys.some((k) => caps[k] === true);

  const core = {
    kind: 'dev-preview-runtime-shell-safety-metadata',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    headless: true,
    contractOnly: true,
    anySideEffect,
    mountCreated: false,
    domCreated: false,
    cssCreated: false,
    backendAccessed: false,
    prismaAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceCreated: false,
    realDataRead: false,
    realDataWrite: false,
    reversibleByNonConsumption: true,
    sideEffectFlags: sideEffectKeys.reduce((acc, k) => { acc[k] = caps[k] === true; return acc; }, {}),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, safetyDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellSafetyMetadata;
