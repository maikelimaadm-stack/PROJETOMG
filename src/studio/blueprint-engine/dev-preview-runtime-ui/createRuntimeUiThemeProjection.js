import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * A pure, local theme projection for the isolated UI. Theme tokens are metadata (inline style
 * objects only, passed as props); no CSS runtime, no stylesheet, no window/document. Pure and
 * deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiThemeProjection() {
  const groups = ['color', 'spacing', 'typography', 'radius', 'border', 'state', 'elevation'];
  const core = {
    kind: 'runtime-ui-theme-projection',
    groups,
    groupCount: groups.length,
    inlineStyleTokensOnly: true,
    cssRuntime: false,
    stylesheetCreated: false,
    realCss: false,
    usesWindow: false,
    usesDocument: false,
  };
  return safeCloneGenericModel({ ...core, themeProjectionDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiThemeProjection;
