import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VISUAL_STATE_KINDS, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Declares the VISUAL STATE contract. Pure, metadata-only. It describes the visual states a
 * future preview could present (idle/loading/empty/ready/blocked/error/validationError/
 * permissionDenied) as metadata only. No real runtime state, no React state, no hooks.
 *
 * @param {Object} [options]
 * @returns {Object} visual state contract
 */
export function createDevPreviewVisualStateContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const states = VISUAL_STATE_KINDS.map((state) => ({
    state,
    terminal: state === 'error' || state === 'blocked' || state === 'permissionDenied',
    blocking: state === 'blocked' || state === 'permissionDenied',
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-visual-state-contract',
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    states,
    stateKinds: [...VISUAL_STATE_KINDS],
    initialState: 'idle',
    usesReactState: false,
    usesHooks: false,
    usesRuntimeState: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, visualStateDigest: visualDigest(core) });
}

export default createDevPreviewVisualStateContract;
