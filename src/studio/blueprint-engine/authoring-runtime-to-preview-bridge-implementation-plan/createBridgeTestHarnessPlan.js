import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * TEST HARNESS PLAN — plans the deterministic, synthetic-only test harness for the future bridge. No real
 * data, no network, no persistence, no snapshots of production. Metadata only. @returns {Object}
 */
export function createBridgeTestHarnessPlan() {
  const core = {
    kind: 'bridge-test-harness-plan',
    testHarnessPlanned: true,
    testHarnessImplemented: false,
    deterministic: true,
    syntheticOnly: true,
    usesRealData: false,
    usesNetwork: false,
    usesPersistence: false,
    plannedCategories: [
      'source_shape', 'strict_draft_identity', 'source_version', 'source_digest', 'source_boundary',
      'field_mapping', 'target_descriptor', 'target_version', 'canonicalization', 'extensibility',
      'validation_pipeline', 'replay_idempotency', 'resource_limits', 'failure_containment',
      'ssot_boundary', 'certification_boundary', 'security_safety', 'prototype_prohibition',
    ],
    plannedMinimumScenarios: 560,
  };
  return safeCloneGenericModel({ ...core, testHarnessPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeTestHarnessPlan;
