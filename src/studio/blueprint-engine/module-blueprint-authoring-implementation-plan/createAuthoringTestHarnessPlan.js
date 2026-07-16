import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Test harness PLAN — plans a deterministic, synthetic, headless test harness for the future runtime.
 * No real data, no network, no persistence. Metadata only.
 * @returns {Object}
 */
export function createAuthoringTestHarnessPlan() {
  const core = {
    kind: 'authoring-test-harness-plan',
    testHarnessPlanned: true,
    testHarnessImplemented: false,
    deterministic: true,
    syntheticDataOnly: true,
    headless: true,
    networkAllowed: false,
    persistenceAllowed: false,
    realDataAllowed: false,
    coversLifecycle: true,
    coversOperations: true,
    coversInvariants: true,
    coversValidationPipeline: true,
  };
  return safeCloneGenericModel({ ...core, testHarnessPlanDigest: authoringPlanDigest(core) });
}

export default createAuthoringTestHarnessPlan;
