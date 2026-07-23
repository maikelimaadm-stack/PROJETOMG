import { CORE_ENVELOPE_FIELDS, CORE_ENVELOPE_REQUIRED_FIELDS, CORE_ENVELOPE_INVARIANTS, CORE_ENVELOPE_VERSION_TAG } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Declares the v2 envelope shape { bridgeDecisionDigest, bridgeDecisionCore, ... } and its invariants. */
export const CORE_ENVELOPE_V2_CONTRACT = deepFreeze({
  kind: 'bridge-decision-core-envelope-v2-contract',
  versionTag: CORE_ENVELOPE_VERSION_TAG,
  fields: [...CORE_ENVELOPE_FIELDS],
  requiredFields: [...CORE_ENVELOPE_REQUIRED_FIELDS],
  invariants: { ...CORE_ENVELOPE_INVARIANTS },
  digestFieldName: 'bridgeDecisionDigest',
  coreFieldName: 'bridgeDecisionCore',
  digestOnlyInEnvelopeNotCore: true,
  coreEnvelopeCreated: false, coreEnvelopeBuilderImplemented: false,
});
export default CORE_ENVELOPE_V2_CONTRACT;
