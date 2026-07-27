import { FUTURE_IMPLEMENTATION_MIN_TEST_SCENARIOS, FUTURE_IMPLEMENTATION_MIN_GATE_CHECKS } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Test + gate strategy the FUTURE implementation must satisfy. */
export const PLAN_TEST_STRATEGY = deepFreeze({
  kind: 'builder-implementation-plan-test-strategy',
  minScenarios: FUTURE_IMPLEMENTATION_MIN_TEST_SCENARIOS,
  usesRealUpstreamsInCoreProofs: true,
  coverage: deepFreeze([
    'multi-seed success + failure', 'adversarial normalization (cycles/depth/accessors/pollution)',
    'eligibility (kind/ok/status/target/digest)', 'version + shape drift', 'exact allowlist extraction',
    'all-field tamper breaks digest', 'cross-decision mixing rejected', 'output envelope exact',
    'ARCHITECTURE 1 identity lifecycle', 'rejection + emergency rejection', 'resource limit boundaries',
    'replay/idempotency cross-instance', 'immutability + no source mutation', 'SSOT/security boundary',
    'bundle absence',
  ]),
});
export const PLAN_GATE_STRATEGY = deepFreeze({
  kind: 'builder-implementation-plan-gate-strategy',
  minChecks: FUTURE_IMPLEMENTATION_MIN_GATE_CHECKS,
  liveProofs: deepFreeze([
    'source shape', 'allowlist == real preimage', 'LIVE digest(core)==realDigest', 'build success + rejection',
    'all-field tamper', 'same-decision atomicity', 'adversarial input', 'envelope shape', 'identity lifecycle',
    'failure containment', 'resource limits', 'replay determinism', 'upstream integrity', 'scope', 'bundle absence',
  ]),
});
export default PLAN_TEST_STRATEGY;
