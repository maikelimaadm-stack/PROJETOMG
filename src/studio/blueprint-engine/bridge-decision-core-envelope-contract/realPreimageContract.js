import {
  REAL_DECISION_DIGEST_PREIMAGE_FIELDS, CORE_FIELD_COUNT, REQUIRED_CORE_FIELDS, SECURITY_CORE_FIELDS,
  VERSION_CORE_FIELDS, IDENTITY_CORE_FIELDS, STATUS_CORE_FIELDS, TARGET_CORE_FIELDS, ISSUE_CORE_FIELDS,
  ROLLBACK_CORE_FIELDS, DIAGNOSTIC_CORE_FIELDS, DIGEST_FIELD,
} from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Declares the REAL decision digest preimage, reflected READ-ONLY from the merged Envelope Identity Contract.
 * Counts are DERIVED (.length), never hardcoded. This is the exact set the v2 core must carry — no more, no less.
 */
export const REAL_PREIMAGE_CONTRACT = deepFreeze({
  kind: 'core-envelope-real-preimage-contract',
  realPreimageFields: [...REAL_DECISION_DIGEST_PREIMAGE_FIELDS],
  fieldCount: CORE_FIELD_COUNT, // derived
  requiredCoreFields: [...REQUIRED_CORE_FIELDS],
  identityCoreFields: [...IDENTITY_CORE_FIELDS],
  statusCoreFields: [...STATUS_CORE_FIELDS],
  versionCoreFields: [...VERSION_CORE_FIELDS],
  securityCoreFields: [...SECURITY_CORE_FIELDS],
  targetCoreFields: [...TARGET_CORE_FIELDS],
  issueCoreFields: [...ISSUE_CORE_FIELDS],
  rollbackCoreFields: [...ROLLBACK_CORE_FIELDS],
  diagnosticCoreFields: [...DIAGNOSTIC_CORE_FIELDS],
  digestFieldExcludedFromPreimage: DIGEST_FIELD,
  digestNotInPreimage: !REAL_DECISION_DIGEST_PREIMAGE_FIELDS.includes(DIGEST_FIELD),
  declaredEqualsRealDerived: true, fieldCountHardcoded: false, aliasesUsed: false,
});
export default REAL_PREIMAGE_CONTRACT;
