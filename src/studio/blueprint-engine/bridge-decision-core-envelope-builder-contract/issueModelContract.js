import { BUILDER_ISSUE_CODES, BUILDER_ISSUE_SEVERITIES } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Issue model (declared). Deterministic ordering; no silent correction/fallback. */
export const ISSUE_MODEL_CONTRACT = deepFreeze({
  kind: 'builder-issue-model-contract',
  issueCodes: [...BUILDER_ISSUE_CODES],
  severities: [...BUILDER_ISSUE_SEVERITIES],
  issueShapeFields: deepFreeze([
    'issueCode', 'severity', 'stage', 'path', 'message', 'deterministic', 'blocksBuilder', 'blocksEnvelope',
    'blocksRuntime', 'blocksPreviewSandbox',
  ]),
  deterministicOrdering: true, silentCorrectionAllowed: false, permissiveFallbackAllowed: false,
  issueModelImplemented: false,
});
export default ISSUE_MODEL_CONTRACT;
