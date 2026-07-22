import {
  REAL_BRIDGE_DECISION_FIELDS, REAL_BRIDGE_DECISION_REQUIRED_FIELDS, REAL_BRIDGE_DECISION_IDENTITY_FIELDS,
  REAL_BRIDGE_DECISION_SECURITY_FIELDS, REAL_BRIDGE_DECISION_TARGET_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS,
} from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Declares the REAL hardened bridge DECISION shape + target descriptor shape (reflected read-only). */
export const SOURCE_DECISION_CONTRACT = deepFreeze({
  kind: 'envelope-source-decision-contract',
  sourceDecisionKind: 'bridge-decision',
  realDecisionFields: [...REAL_BRIDGE_DECISION_FIELDS],
  requiredDecisionFields: [...REAL_BRIDGE_DECISION_REQUIRED_FIELDS],
  identityFields: [...REAL_BRIDGE_DECISION_IDENTITY_FIELDS],
  securityFields: [...REAL_BRIDGE_DECISION_SECURITY_FIELDS],
  targetFields: [...REAL_BRIDGE_DECISION_TARGET_FIELDS],
  realTargetDescriptorFields: [...REAL_TARGET_DESCRIPTOR_FIELDS],
  aliasesForbidden: true, inventedFieldsForbidden: true, metadataOnly: true, syntheticOnly: true,
  expectedDecisionStatus: 'bridge_ready',
});
export default SOURCE_DECISION_CONTRACT;
