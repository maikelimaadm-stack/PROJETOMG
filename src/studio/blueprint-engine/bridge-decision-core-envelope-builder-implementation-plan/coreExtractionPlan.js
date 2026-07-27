import { DIGEST_PREIMAGE_ALLOWLIST, SOURCE_DIGEST_FIELD } from '../bridge-decision-core-envelope-builder-contract/index.js';
import { DECISION_DIGEST_PREIMAGE_FIELDS } from '../bridge-decision-envelope-identity-contract/index.js';
import { deepFreeze } from './deepFreeze.js';
/** Core extraction plan — allowlist derived from the real upstream; no local divergent list. */
export const CORE_EXTRACTION_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-core-extraction',
  mode: 'exact_allowlist_pick',
  allowlistSource: 'DECISION_DIGEST_PREIMAGE_FIELDS',
  allowlistMatchesUpstream: JSON.stringify([...DIGEST_PREIMAGE_ALLOWLIST].sort()) === JSON.stringify([...DECISION_DIGEST_PREIMAGE_FIELDS].sort()),
  allowlistFieldCount: DIGEST_PREIMAGE_ALLOWLIST.length,
  expectedSourceFields: 'allowlist + bridgeDecisionDigest',
  digestField: SOURCE_DIGEST_FIELD,
  unknownSourceFieldFailsClosed: true,
  missingForbidden: true, extraForbidden: true, aliasForbidden: true, defaultForbidden: true, coercionForbidden: true,
  targetDescriptorOnlyInsideCore: true, digestOnlyOutsideCore: true,
  coreExtractionImplemented: false,
});
export default CORE_EXTRACTION_PLAN;
