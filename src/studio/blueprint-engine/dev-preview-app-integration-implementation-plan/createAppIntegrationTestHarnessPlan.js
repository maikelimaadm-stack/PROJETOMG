import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Test harness PLAN — plans the future headless test suites. It implements NO harness and uses NO
 * real runtime or data. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationTestHarnessPlan() {
  const suites = [
    'app_touch_boundary_suite',
    'feature_flag_suite',
    'attachment_suite',
    'router_menu_exposure_suite',
    'runtime_ui_mount_suite',
    'failure_containment_suite',
    'manual_gate_suite',
  ];
  const core = {
    kind: 'app-integration-test-harness-plan',
    harnessImplemented: false,
    headless: true,
    usesRealRuntime: false,
    usesRealData: false,
    suiteCount: suites.length,
    suites,
  };
  return safeCloneGenericModel({ ...core, testHarnessPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationTestHarnessPlan;
