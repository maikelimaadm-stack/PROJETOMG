import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES, bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Emits RUNTIME SAFETY metadata — the invariant assertion that this bridge produced no
 * runtime side effect. Pure, metadata-only. Mirrors the frozen headless capability flags
 * and asserts every side-effect capability is false.
 *
 * @param {Object} [options]
 * @returns {Object} runtime safety metadata
 */
export function createDevPreviewRuntimeSafetyMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const caps = DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES;

  const sideEffectKeys = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'uiCreated', 'routeCreated',
    'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed',
    'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas',
  ];
  const anySideEffect = sideEffectKeys.some((k) => caps[k] === true);

  const core = {
    kind: 'dev-preview-runtime-safety-metadata',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    headless: true,
    contractOnly: true,
    anySideEffect,
    usesStorage: false,
    usesFetch: false,
    usesNetwork: false,
    usesPersistence: false,
    touchesBackend: false,
    touchesPrisma: false,
    touchesProduction: false,
    touchesStaging: false,
    mutates: false,
    reversibleByNonConsumption: true,
    sideEffectFlags: sideEffectKeys.reduce((acc, k) => { acc[k] = caps[k] === true; return acc; }, {}),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, runtimeSafetyDigest: bridgeDigest(core) });
}

export default createDevPreviewRuntimeSafetyMetadata;
