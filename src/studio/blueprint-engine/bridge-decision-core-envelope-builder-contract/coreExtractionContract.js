import { DIGEST_PREIMAGE_ALLOWLIST, REQUIRED_CORE_FIELDS_REF, CORE_FIELD_COUNT_REF, SOURCE_DIGEST_FIELD } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Core extraction contract. bridgeDecisionCore = exactly (decision minus bridgeDecisionDigest) via the REAL
 * allowlist DECISION_DIGEST_PREIMAGE_FIELDS. No aliases/defaults/coercion/partial. Unknown source fields (beyond
 * the allowlist + bridgeDecisionDigest) are REJECTED as version drift, never silently ignored.
 */
export const CORE_EXTRACTION_CONTRACT = deepFreeze({
  kind: 'builder-core-extraction-contract',
  coreExtractionMode: 'exact_allowlist_pick',
  coreFieldAllowlistSource: 'DECISION_DIGEST_PREIMAGE_FIELDS',
  coreFieldAllowlist: [...DIGEST_PREIMAGE_ALLOWLIST],
  requiredCoreFields: [...REQUIRED_CORE_FIELDS_REF],
  requiredCoreFieldCount: CORE_FIELD_COUNT_REF, // 32
  onlyExtraSourceFieldIgnored: SOURCE_DIGEST_FIELD, // only bridgeDecisionDigest is excluded from the core
  unknownSourceFieldsRejected: true,
  unknownSourceFieldsSilentlyIgnored: false,
  coreAliasesAllowed: false, coreDefaultsAllowed: false, coreCoercionAllowed: false, partialCoreAllowed: false,
  targetDescriptorInsideCore: true, digestInsideCore: false, duplicationAllowed: false,
  semanticOrderPreserved: true,
  versionDriftFailsClosed: true,
  coreExtractionImplemented: false,
});
export default CORE_EXTRACTION_CONTRACT;
