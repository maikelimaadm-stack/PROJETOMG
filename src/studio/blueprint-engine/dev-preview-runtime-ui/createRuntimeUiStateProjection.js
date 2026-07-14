import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * A pure, local state projection for the isolated UI. No global React hooks state, no window /
 * document, no storage, no persistence. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiStateProjection() {
  const core = {
    kind: 'runtime-ui-state-projection',
    pure: true,
    localOnly: true,
    globalHooksState: false,
    usesWindow: false,
    usesDocument: false,
    usesStorage: false,
    persistence: false,
    realDataRead: false,
    realDataWrite: false,
  };
  return safeCloneGenericModel({ ...core, stateProjectionDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiStateProjection;
