import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the RUNTIME ADAPTER plan. Pure, metadata-only. Describes the adapter surface a
 * future isolated runtime WOULD implement, as metadata only. No adapter is implemented: react/
 * dom/css/route/menu/module/backend adapters are all `false`.
 *
 * @param {Object} [options]
 * @returns {Object} runtime adapter plan
 */
export function createIsolatedRuntimeAdapterPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-adapter-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    adapterKind: 'planned_metadata_only',
    adapterImplemented: false,
    reactAdapter: false,
    domAdapter: false,
    cssAdapter: false,
    routeAdapter: false,
    menuAdapter: false,
    moduleAdapter: false,
    backendAdapter: false,
    plannedInputs: ['runtimeShellContract', 'visualContract'],
    plannedOutputs: ['plannedRenderRequest'],
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, adapterPlanDigest: planDigest(core) });
}

export default createIsolatedRuntimeAdapterPlan;
