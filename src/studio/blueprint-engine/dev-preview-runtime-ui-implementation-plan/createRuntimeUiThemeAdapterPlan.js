import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans a theme adapter as metadata only. No real CSS, stylesheet, DOM or css runtime. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRuntimeUiThemeAdapterPlan() {
  const core = {
    kind: 'runtime-ui-theme-adapter-plan',
    themeAdapterKind: 'planned_metadata_only',
    themeAdapterImplemented: false,
    reactState: false,
    hooks: false,
    storage: false,
    persistence: false,
    cssRuntime: false,
    stylesheetCreated: false,
    domAttributesSet: false,
    realAriaSet: false,
  };
  return safeCloneGenericModel({ ...core, themeAdapterPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiThemeAdapterPlan;
