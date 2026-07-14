import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans the UI runtime boundary. Every boundary flag asserts a forbidden real capability stays
 * off. Metadata only. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiBoundaryPlan() {
  const core = {
    kind: 'runtime-ui-boundary-plan',
    noReact: true,
    noJSX: true,
    noTSX: true,
    noDOM: true,
    noCSSRuntime: true,
    noRouteRuntime: true,
    noMenuRuntime: true,
    noModuleRuntime: true,
    noBackend: true,
    noPrisma: true,
    noProduction: true,
    noStaging: true,
    boundaryImplemented: false,
    enforcedByFutureSliceOnly: true,
  };
  return safeCloneGenericModel({ ...core, boundaryPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiBoundaryPlan;
