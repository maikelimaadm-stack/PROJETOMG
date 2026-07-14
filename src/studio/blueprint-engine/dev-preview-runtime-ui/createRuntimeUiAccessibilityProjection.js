import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * A pure, local accessibility projection for the isolated UI. Labels/roles are metadata passed as
 * props to local components; no real DOM ARIA mutation, no window/document. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiAccessibilityProjection() {
  const core = {
    kind: 'runtime-ui-accessibility-projection',
    labelsProvided: true,
    rolesProvided: true,
    keyboardHintsProvided: true,
    realAriaMutationInDom: false,
    usesWindow: false,
    usesDocument: false,
    cssRuntime: false,
  };
  return safeCloneGenericModel({ ...core, accessibilityProjectionDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiAccessibilityProjection;
