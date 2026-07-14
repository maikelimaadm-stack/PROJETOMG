import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_CONTRACT_NAME,
  RUNTIME_UI_CONTRACT_VERSION,
  RUNTIME_UI_CONTRACT_MODE,
  RUNTIME_UI_CONTRACT_CAPABILITIES,
  ISOLATED_RUNTIME_VERSION,
  VISUAL_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  uiContractDigest,
} from './runtimeUiContractConfig.js';

/**
 * Builds the runtime UI contract MANIFEST — a self-describing, deterministic summary of the
 * produced parts plus the capability flags. Pure, metadata-only.
 *
 * @param {Object} [options]
 * @returns {Object} runtime UI contract manifest
 */
export function createRuntimeUiManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'runtime-ui-contract-manifest',
    runtimeUiContractName: RUNTIME_UI_CONTRACT_NAME,
    runtimeUiContractVersion: RUNTIME_UI_CONTRACT_VERSION,
    mode: RUNTIME_UI_CONTRACT_MODE,
    moduleId: String(o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    upstream: {
      isolatedRuntime: ISOLATED_RUNTIME_VERSION,
      visualContract: VISUAL_CONTRACT_VERSION,
      engineContract: STUDIO_BLUEPRINT_ENGINE_VERSION,
    },
    parts: {
      session: digestOf(parts.session, 'sessionDigest'),
      frameMapping: digestOf(parts.frameMapping, 'frameMappingDigest'),
      nodeContract: digestOf(parts.nodeContract, 'nodeContractDigest'),
      layoutContract: digestOf(parts.layoutContract, 'layoutContractDigest'),
      componentBinding: digestOf(parts.componentBinding, 'componentBindingDigest'),
      interactionBinding: digestOf(parts.interactionBinding, 'interactionBindingDigest'),
      renderBoundary: digestOf(parts.renderBoundary, 'renderBoundaryDigest'),
      stateProjection: digestOf(parts.stateProjection, 'stateProjectionDigest'),
      accessibilityProjection: digestOf(parts.accessibilityProjection, 'accessibilityProjectionDigest'),
      themeProjection: digestOf(parts.themeProjection, 'themeProjectionDigest'),
      blockedAction: digestOf(parts.blockedAction, 'blockedActionDigest'),
      safetyPolicy: digestOf(parts.safetyPolicy, 'safetyPolicyDigest'),
      readiness: digestOf(parts.readiness, 'readinessDigest'),
    },
    capabilities: { ...RUNTIME_UI_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: uiContractDigest(core) });
}

export default createRuntimeUiManifest;
