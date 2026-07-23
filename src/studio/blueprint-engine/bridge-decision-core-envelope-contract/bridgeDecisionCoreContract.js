import { REAL_DECISION_DIGEST_PREIMAGE_FIELDS, TARGET_CORE_FIELDS, DIGEST_FIELD } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Declares the BridgeDecisionCore: EXACTLY the real preimage fields. targetDescriptor lives ONLY inside the core;
 * bridgeDecisionDigest is NEVER inside the core. No extra/missing/alias/default/coercion. Definition only.
 */
export const BRIDGE_DECISION_CORE_CONTRACT = deepFreeze({
  kind: 'bridge-decision-core-contract',
  coreFields: [...REAL_DECISION_DIGEST_PREIMAGE_FIELDS],
  targetDescriptorInsideCore: TARGET_CORE_FIELDS.includes('targetDescriptor'),
  digestFieldInsideCore: REAL_DECISION_DIGEST_PREIMAGE_FIELDS.includes(DIGEST_FIELD), // must be false
  coreExtraFieldsAllowed: false,
  coreMissingFieldsAllowed: false,
  coreAliasesAllowed: false,
  coreDefaultsAllowed: false,
  coreFieldCoercionAllowed: false,
  coreIsExactRealPreimage: true,
});
export default BRIDGE_DECISION_CORE_CONTRACT;
