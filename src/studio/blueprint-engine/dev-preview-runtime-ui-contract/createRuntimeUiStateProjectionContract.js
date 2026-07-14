import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the STATE PROJECTION contract — metadata-only projection of the states a future UI
 * would present. Pure. No React state, no hooks, no storage, no persistence, no DOM.
 *
 * @param {Object} [options]
 * @returns {Object} state projection contract
 */
export function createRuntimeUiStateProjectionContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mapping = isGenericModelPlainObject(o.frameMapping) ? o.frameMapping : {};

  const states = ['idle', 'loading', 'empty', 'ready', 'blocked', 'error', 'validationError', 'permissionDenied'].map((state) => ({
    state,
    terminal: state === 'error' || state === 'blocked' || state === 'permissionDenied',
    metadataOnly: true,
  }));

  const core = {
    kind: 'runtime-ui-state-projection-contract',
    moduleId: String(mapping.moduleId ?? 'plannedModule'),
    states,
    initialState: typeof mapping.state === 'string' ? mapping.state : 'ready',
    reactState: false,
    hooks: false,
    storage: false,
    persistence: false,
    dom: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, stateProjectionDigest: uiContractDigest(core) });
}

export default createRuntimeUiStateProjectionContract;
