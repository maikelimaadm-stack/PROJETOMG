# Replay / Idempotency Plan

- sameEnvelopeSameConfigSameDecision: true
- sameIssuesOrdering: true
- sameSandboxDescriptor: true
- sameConsumerDecisionDigest: true
- crossInstanceDeterminism: true
- globalMutableStateAllowed: false
- ambientClockAllowed: false
- randomnessAllowed: false
- localeDependencyAllowed: false
- timezoneDependencyAllowed: false
- issueCode: RUNTIME_NONDETERMINISM_FORBIDDEN
- replayImplemented: false

Forbidden nondeterministic source categories:
- ambient wall-clock reads
- high-resolution timers
- pseudo-random generators
- random UUID generators
- locale-sensitive string comparison
- locale-sensitive formatting
- timezone-sensitive conversions
