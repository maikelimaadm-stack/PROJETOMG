import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  runtimeUiDigest,
} from './runtimeUiConfig.js';

/**
 * Loads the upstream contract references consumed by the runtime UI. Pure metadata: it records
 * WHICH contracts were consumed (by version), by relative pure import only. No fetch, no network,
 * no dynamic path resolution. Never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function createRuntimeUiContractLoader(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};

  const core = {
    kind: 'runtime-ui-contract-loader',
    loadedByRelativeImportOnly: true,
    usesFetch: false,
    usesNetwork: false,
    usesDynamicPath: false,
    loaded: {
      runtimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
      isolatedRuntime: ISOLATED_RUNTIME_VERSION,
      implementationPlan: IMPLEMENTATION_PLAN_VERSION,
      runtimeShellContract: RUNTIME_SHELL_CONTRACT_VERSION,
      visualContract: VISUAL_CONTRACT_VERSION,
      bridge: DEV_PREVIEW_BRIDGE_VERSION,
    },
    runtimeUiContractPresent: c.kind === 'studio-dev-preview-runtime-ui-contract',
  };
  return safeCloneGenericModel({ ...core, contractLoaderDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiContractLoader;
