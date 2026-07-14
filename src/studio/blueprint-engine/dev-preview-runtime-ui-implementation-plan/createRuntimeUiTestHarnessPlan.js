import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans a headless test harness for a future UI runtime. Metadata only; no test runtime created.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiTestHarnessPlan() {
  const suites = [
    { suite: 'boundary_invariants', planned: true },
    { suite: 'blocked_action_enforcement', planned: true },
    { suite: 'virtual_frame_pipeline_dry_run', planned: true },
    { suite: 'adapter_plan_metadata_only', planned: true },
    { suite: 'no_react_no_dom_no_css', planned: true },
    { suite: 'deterministic_digests', planned: true },
  ];
  const core = {
    kind: 'runtime-ui-test-harness-plan',
    suites,
    suiteCount: suites.length,
    harnessImplemented: false,
    headless: true,
    usesRealRuntime: false,
    usesRealData: false,
  };
  return safeCloneGenericModel({ ...core, testHarnessPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiTestHarnessPlan;
