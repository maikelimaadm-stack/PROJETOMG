import { OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS, OUTPUT_CORE_ENVELOPE_KIND, OUTPUT_CORE_ENVELOPE_VERSION_TAG } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** The future output must be a Core Envelope v2 (real fields/invariants, read-only). identityVerified per §15. */
export const OUTPUT_ENVELOPE_CONTRACT = deepFreeze({
  kind: 'builder-output-envelope-contract',
  envelopeKind: OUTPUT_CORE_ENVELOPE_KIND,
  envelopeVersionTag: OUTPUT_CORE_ENVELOPE_VERSION_TAG, // v2
  fields: [...OUTPUT_CORE_ENVELOPE_FIELDS],
  invariants: { ...OUTPUT_CORE_ENVELOPE_INVARIANTS },
  bridgeDecisionDigestAppearsOnce: true,
  bridgeDecisionCoreAppearsOnce: true,
  targetDescriptorOnlyInsideCore: true,
  syntheticTrue: OUTPUT_CORE_ENVELOPE_INVARIANTS.synthetic === true,
  immutableTrue: OUTPUT_CORE_ENVELOPE_INVARIANTS.immutable === true,
  metadataOnlyTrue: OUTPUT_CORE_ENVELOPE_INVARIANTS.metadataOnly === true,
  coreConsumedFalse: OUTPUT_CORE_ENVELOPE_INVARIANTS.coreConsumed === false,
  previewMountedFalse: OUTPUT_CORE_ENVELOPE_INVARIANTS.previewMounted === false,
  productExposedFalse: OUTPUT_CORE_ENVELOPE_INVARIANTS.productExposed === false,
  coreEnvelopeCreated: false, builderExecuted: false,
});
export default OUTPUT_ENVELOPE_CONTRACT;
