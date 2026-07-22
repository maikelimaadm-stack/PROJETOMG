import { deepFreeze } from './deepFreeze.js';

/**
 * GATE STRATEGY PLAN — the FUTURE runtime gate plan. Declaration only. NO runtime gate is created in this slice.
 */
export const GATE_STRATEGY_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-gate-strategy-plan',
  futureRuntimeGateMinChecks: 280,
  liveProofs: deepFreeze([
    'real multi-seed decisions', 'real digest recomputation', 'real cross-decision mismatch', 'real mappings',
    'real descriptor build', 'adversarial input', 'static scans', 'scope', 'registry', 'upstream integrity',
    'bundle absence', 'no new dependency',
  ]),
  runtimeGateCreatedInThisSlice: false,
  gateStrategyImplemented: false,
});

export default GATE_STRATEGY_PLAN;
