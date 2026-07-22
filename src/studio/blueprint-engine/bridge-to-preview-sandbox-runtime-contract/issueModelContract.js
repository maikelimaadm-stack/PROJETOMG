import { CONTRACT_ISSUE_SEVERITIES, CONTRACT_ISSUE_CODES } from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Issue model contract: deterministic ordering, no silent correction, no permissive fallback. */
export const ISSUE_MODEL_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-issue-model-contract',
  fields: ['issueCode', 'severity', 'stage', 'path', 'message', 'deterministic', 'blocksConsumer', 'blocksPreviewSandbox'],
  severities: [...CONTRACT_ISSUE_SEVERITIES], issueCodes: [...CONTRACT_ISSUE_CODES],
  orderingKeys: ['stage', 'path', 'issueCode', 'message'],
  silentCorrectionAllowed: false, permissiveFallbackAllowed: false,
});
export default ISSUE_MODEL_CONTRACT;
