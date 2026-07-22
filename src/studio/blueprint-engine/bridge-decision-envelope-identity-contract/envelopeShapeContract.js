import {
  ENVELOPE_FIELDS, ENVELOPE_REQUIRED_FIELDS, ENVELOPE_SECURITY_FIELDS, ENVELOPE_INVARIANTS, ENVELOPE_KIND,
  ENVELOPE_CONTRACT_VERSION,
} from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Declares the {bridgeDecisionDigest, targetDescriptor} identity envelope shape (NO envelope built here). */
export const ENVELOPE_SHAPE_CONTRACT = deepFreeze({
  kind: 'envelope-shape-contract',
  envelopeKind: ENVELOPE_KIND,
  envelopeVersion: ENVELOPE_CONTRACT_VERSION,
  fields: [...ENVELOPE_FIELDS],
  requiredFields: [...ENVELOPE_REQUIRED_FIELDS],
  securityFields: [...ENVELOPE_SECURITY_FIELDS],
  invariants: { ...ENVELOPE_INVARIANTS },
  everyFieldDerivedFromRealOrClassifiedMetadata: true,
  envelopeBuilderImplemented: false,
});
export default ENVELOPE_SHAPE_CONTRACT;
