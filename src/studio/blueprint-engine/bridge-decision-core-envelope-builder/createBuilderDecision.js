import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import { STATUS_READY } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Success builder decision. builderDecision.identityVerified=true records the PRODUCER-side verification OUTSIDE the
 * immutable envelope (which keeps identityVerified=false). Deep-frozen; builderDecisionDigest deterministic.
 */
export function createBuilderDecision(coreEnvelope) {
  const base = {
    ok: true,
    status: STATUS_READY,
    sourceAccepted: true,
    coreExtracted: true,
    identityVerified: true,               // builder (producer) verification — outside the envelope
    coreEnvelopeCreated: true,
    coreEnvelope,
    issues: deepFreeze([]),
    sourceMutated: false,
    sideEffects: false,
    rollbackByNonEmission: false,
  };
  const builderDecisionDigest = createDeterministicDigest({
    ok: base.ok, status: base.status, envelopeDigest: coreEnvelope.bridgeDecisionDigest,
    coreEnvelopeCreated: true, identityVerified: true, issueCodes: [],
  });
  return deepFreeze({ ...base, builderDecisionDigest });
}
export default createBuilderDecision;
