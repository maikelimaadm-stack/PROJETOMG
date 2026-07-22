import { deepFreeze } from './deepFreeze.js';

/**
 * TEST STRATEGY PLAN — the FUTURE runtime test suite plan. Declaration only. NO runtime test is created in this
 * slice. The current plan slice ships its OWN plan test separately; this describes the future RUNTIME test.
 */
export const TEST_STRATEGY_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-test-strategy-plan',
  futureRuntimeTestMinAsserts: 900,
  futureRuntimeGateMinChecks: 280,
  coverage: deepFreeze([
    'real bridgeDecision envelope', 'same-decision success', 'cross-decision mix', 'digest recompute',
    'deep target tamper', 'status/issues/source identity tamper', 'version mismatches',
    'cycles/depth/types/accessors/proxies', 'resource boundaries', 'mapping execution', 'sandbox descriptor',
    'failure containment', 'emergency rejection', 'replay', 'determinism', 'manifest/verifier', 'SSOT/security',
    'zero UI/App/mount/storage/backend/module/product',
  ]),
  runtimeTestCreatedInThisSlice: false,
  testStrategyImplemented: false,
});

export default TEST_STRATEGY_PLAN;
