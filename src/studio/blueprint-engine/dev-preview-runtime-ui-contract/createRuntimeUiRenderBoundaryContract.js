import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the RENDER BOUNDARY contract — metadata-only. Real render is permanently blocked; only
 * a virtual render contract is produced. `renderAllowed: false`, `realRenderProduced: false`,
 * `virtualRenderContractProduced: true`.
 *
 * @param {Object} [options]
 * @returns {Object} render boundary contract
 */
export function createRuntimeUiRenderBoundaryContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'runtime-ui-render-boundary-contract',
    moduleId: String(o.frameMapping?.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    renderAllowed: false,
    realRenderProduced: false,
    virtualRenderContractProduced: true,
    reactElementProduced: false,
    domProduced: false,
    cssProduced: false,
    reason: 'requires future explicit UI runtime implementation slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, renderBoundaryDigest: uiContractDigest(core) });
}

export default createRuntimeUiRenderBoundaryContract;
