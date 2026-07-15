import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Test harness PLAN for a future route/menu wiring. Metadata only; no test runtime created. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createRouteMenuTestHarnessPlan() {
  const suites = [
    { suite: 'app_wiring_boundary_invariants', planned: true },
    { suite: 'router_wiring_boundary_invariants', planned: true },
    { suite: 'blocked_navigation_enforcement', planned: true },
    { suite: 'runtime_ui_mount_boundary', planned: true },
    { suite: 'dev_only_access_policy', planned: true },
    { suite: 'no_prototype_relink', planned: true },
    { suite: 'deterministic_digests', planned: true },
  ];
  const core = {
    kind: 'route-menu-test-harness-plan',
    suites,
    suiteCount: suites.length,
    harnessImplemented: false,
    headless: true,
    usesRealRuntime: false,
    usesRealData: false,
  };
  return safeCloneGenericModel({ ...core, testHarnessDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuTestHarnessPlan;
