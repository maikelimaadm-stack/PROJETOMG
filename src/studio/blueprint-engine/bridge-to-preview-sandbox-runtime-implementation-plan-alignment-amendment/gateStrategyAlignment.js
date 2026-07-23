import { deepFreeze } from './deepFreeze.js';
/** Aligns the FUTURE runtime gate strategy to Core Envelope v2. No runtime gate is created here. */
export const GATE_STRATEGY_ALIGNMENT = deepFreeze({
  kind: 'gate-strategy-alignment',
  futureRuntimeGateMinChecks: 280,
  liveProofs: deepFreeze([
    'real bridgeDecision', 'real core extraction', 'real Core Envelope v2', 'digest recompute from core',
    'v1 rejection', 'cross-decision mismatch', 'partial/extra core', 'upstream contract compatibility', 'bundle absence',
  ]),
  runtimeGateCreatedInThisSlice: false,
});
export default GATE_STRATEGY_ALIGNMENT;
