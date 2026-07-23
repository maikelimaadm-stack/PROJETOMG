import {
  REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS, SOURCE_IDENTITY_FIELDS,
  SOURCE_SECURITY_FIELDS, SOURCE_TARGET_FIELDS, SOURCE_VERSION_FIELDS, SOURCE_SUCCESS_ELIGIBILITY_FIELDS,
  SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS, SOURCE_DIGEST_FIELD,
} from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** The real hardened bridgeDecision shape (READ-ONLY, from #488 envelope contract). Input is the COMPLETE decision. */
export const REAL_SOURCE_BRIDGE_DECISION_SHAPE = deepFreeze({
  kind: 'builder-real-source-bridge-decision-shape',
  decisionKind: SOURCE_DECISION_KIND,
  successStatus: SOURCE_DECISION_SUCCESS_STATUS,
  digestField: SOURCE_DIGEST_FIELD,
  fields: [...REAL_SOURCE_BRIDGE_DECISION_FIELDS],
  fieldCount: REAL_SOURCE_BRIDGE_DECISION_FIELDS.length, // 33
  requiredFields: [...REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS],
  identityFields: [...SOURCE_IDENTITY_FIELDS],
  securityFields: [...SOURCE_SECURITY_FIELDS],
  targetFields: [...SOURCE_TARGET_FIELDS],
  versionFields: [...SOURCE_VERSION_FIELDS],
  successEligibilityFields: [...SOURCE_SUCCESS_ELIGIBILITY_FIELDS],
  inputIsCompleteDecision: true, inputIsIsolatedDescriptorOrDigest: false,
  declaredEqualsRealDerived: true, fieldCountHardcoded: false,
});
export default REAL_SOURCE_BRIDGE_DECISION_SHAPE;
