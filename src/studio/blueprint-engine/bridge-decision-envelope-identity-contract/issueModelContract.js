import { ENVELOPE_ISSUE_SEVERITIES, ENVELOPE_ISSUE_CODES } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const ISSUE_MODEL_CONTRACT = deepFreeze({
  kind: 'envelope-issue-model-contract',
  fields: ['issueCode', 'severity', 'stage', 'path', 'message', 'deterministic', 'blocksEnvelope', 'blocksConsumer', 'blocksPreviewSandbox'],
  severities: [...ENVELOPE_ISSUE_SEVERITIES], issueCodes: [...ENVELOPE_ISSUE_CODES],
  orderingKeys: ['stage', 'path', 'issueCode', 'message'], silentCorrectionAllowed: false, permissiveFallbackAllowed: false,
});
export default ISSUE_MODEL_CONTRACT;
