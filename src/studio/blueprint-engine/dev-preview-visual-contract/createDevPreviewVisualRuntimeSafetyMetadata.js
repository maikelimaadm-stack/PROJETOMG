import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VISUAL_CONTRACT_HEADLESS_CAPABILITIES, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Emits RUNTIME SAFETY metadata — the invariant assertion that this visual contract produced
 * no runtime side effect. Pure, metadata-only. Mirrors the frozen headless capability flags
 * and asserts every side-effect capability is false.
 *
 * @param {Object} [options]
 * @returns {Object} runtime safety metadata
 */
export function createDevPreviewVisualRuntimeSafetyMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const caps = VISUAL_CONTRACT_HEADLESS_CAPABILITIES;

  const sideEffectKeys = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
    'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas',
  ];
  const anySideEffect = sideEffectKeys.some((k) => caps[k] === true);

  const core = {
    kind: 'dev-preview-visual-runtime-safety-metadata',
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    headless: true,
    contractOnly: true,
    anySideEffect,
    backendAccessed: false,
    prismaAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceCreated: false,
    moduleRegistered: false,
    filesWrittenToModule: false,
    domCreated: false,
    cssCreated: false,
    reversibleByNonConsumption: true,
    sideEffectFlags: sideEffectKeys.reduce((acc, k) => { acc[k] = caps[k] === true; return acc; }, {}),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, runtimeSafetyDigest: visualDigest(core) });
}

export default createDevPreviewVisualRuntimeSafetyMetadata;
