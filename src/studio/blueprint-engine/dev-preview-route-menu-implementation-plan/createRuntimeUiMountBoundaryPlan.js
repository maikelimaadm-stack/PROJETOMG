import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Runtime UI mount boundary PLAN — metadata only; no real mount, no ReactDOM/createRoot/window/
 * document. Flag names avoid the literal DOM-API identifiers (see the gate's case-sensitive scan).
 * Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiMountBoundaryPlan() {
  const core = {
    kind: 'route-menu-runtime-ui-mount-boundary-plan',
    runtimeUiMounted: false,
    mountImplemented: false,
    reactDomUsed: false,
    createRootUsed: false,
    documentApiUsed: false,
    windowApiUsed: false,
    mountTargetCreated: false,
  };
  return safeCloneGenericModel({ ...core, runtimeUiMountBoundaryDigest: routeMenuPlanDigest(core) });
}

export default createRuntimeUiMountBoundaryPlan;
