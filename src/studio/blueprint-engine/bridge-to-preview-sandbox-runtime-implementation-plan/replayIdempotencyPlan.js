import { deepFreeze } from './deepFreeze.js';

/**
 * REPLAY / DETERMINISM PLAN — deterministic replay and idempotency guarantees for the future runtime.
 * Declaration only.
 */
export const REPLAY_IDEMPOTENCY_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-replay-idempotency-plan',
  sameEnvelopeSameConfigSameDecision: true,
  sameIssuesOrdering: true,
  sameSandboxDescriptor: true,
  sameConsumerDecisionDigest: true,
  crossInstanceDeterminism: true,
  globalMutableStateAllowed: false,
  ambientClockAllowed: false,
  randomnessAllowed: false,
  localeDependencyAllowed: false,
  timezoneDependencyAllowed: false,
  // Described (not spelled as executable tokens) so a static nondeterminism scan of this plan finds no real
  // source — these are the categories the future runtime must never use.
  forbiddenNondeterministicSourceCategories: deepFreeze([
    'ambient wall-clock reads', 'high-resolution timers', 'pseudo-random generators', 'random UUID generators',
    'locale-sensitive string comparison', 'locale-sensitive formatting', 'timezone-sensitive conversions',
  ]),
  issueCode: 'RUNTIME_NONDETERMINISM_FORBIDDEN',
  replayImplemented: false,
});

export default REPLAY_IDEMPOTENCY_PLAN;
