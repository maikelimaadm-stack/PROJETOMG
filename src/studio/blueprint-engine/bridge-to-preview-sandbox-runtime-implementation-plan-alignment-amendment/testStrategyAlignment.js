import { deepFreeze } from './deepFreeze.js';
/** Aligns the FUTURE runtime test strategy to Core Envelope v2. No runtime test is created here. */
export const TEST_STRATEGY_ALIGNMENT = deepFreeze({
  kind: 'test-strategy-alignment',
  futureRuntimeTestMinAsserts: 900,
  futureRuntimeGateMinChecks: 280,
  coverage: deepFreeze([
    'Core Envelope v2 real multi-seed', 'digest(core) equivalence', 'partial core', 'extra core field',
    'v1 rejection', 'unknown v2 version', 'cross-decision core mix', 'deep target tamper',
    'status/issues/source/version/security tamper', 'key-order invariance', 'array-order sensitivity',
  ]),
  runtimeTestCreatedInThisSlice: false,
});
export default TEST_STRATEGY_ALIGNMENT;
