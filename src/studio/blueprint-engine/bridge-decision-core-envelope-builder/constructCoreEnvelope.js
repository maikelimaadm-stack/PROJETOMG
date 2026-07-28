import { ENVELOPE_KIND, ENVELOPE_VERSION_TAG, ENVELOPE_INVARIANTS } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Constructs the immutable Core Envelope v2 — exactly the 12 real fields. identityVerified stays false (consumer-
 * owned lifecycle flag). The core is embedded as an independent deep-frozen clone; the digest appears once, outside
 * the core; the target descriptor appears only inside the core. The whole envelope is deep-frozen.
 */
export function constructCoreEnvelope(core, digest) {
  const envelope = {
    envelopeKind: ENVELOPE_KIND,
    envelopeVersion: ENVELOPE_VERSION_TAG,
    bridgeDecisionDigest: digest,
    bridgeDecisionCore: core,
    synthetic: ENVELOPE_INVARIANTS.synthetic,
    immutable: ENVELOPE_INVARIANTS.immutable,
    metadataOnly: ENVELOPE_INVARIANTS.metadataOnly,
    identityVerified: ENVELOPE_INVARIANTS.identityVerified,          // false — ARCHITECTURE 1
    coreConsumed: ENVELOPE_INVARIANTS.coreConsumed,                  // false
    consumerRuntimeInvoked: ENVELOPE_INVARIANTS.consumerRuntimeInvoked, // false
    previewMounted: ENVELOPE_INVARIANTS.previewMounted,             // false
    productExposed: ENVELOPE_INVARIANTS.productExposed,             // false
  };
  return deepFreeze(envelope);
}
export default constructCoreEnvelope;
