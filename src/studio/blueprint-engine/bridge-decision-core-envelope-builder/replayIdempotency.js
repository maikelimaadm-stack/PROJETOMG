import { deepFreeze } from './deepFreeze.js';
/**
 * Replay / idempotency declaration for the builder. The builder uses NO clock, random, locale, timezone, global
 * counter or mutable singleton — every `build` over the same source (and config) yields the same decision, on the
 * same or a different instance. This module documents that guarantee; it holds no mutable state.
 */
export const REPLAY_IDEMPOTENCY = deepFreeze({
  kind: 'builder-replay-idempotency',
  sameSourceSameConfigSameDecision: true,
  crossInstanceDeterministic: true,
  ambientClockUsed: false,
  randomnessUsed: false,
  localeDependencyUsed: false,
  timezoneDependencyUsed: false,
  globalMutableStateUsed: false,
});
export default REPLAY_IDEMPOTENCY;
