import { deepFreeze } from './deepFreeze.js';
const D = (dim, source, consumer, sandbox, issueCode) => Object.freeze({
  dimension: dim, sourceLimit: source, consumerLimit: consumer, sandboxLimit: sandbox,
  reason: 'consumer limits are intentionally <= source/sandbox limits (fail-closed, no truncation)',
  issueCode, stricterConsumerLimitIntentional: consumer <= source,
});
/** Resource-limit contract across bridge output, future consumer and sandbox. Declaration only. */
export const RESOURCE_LIMIT_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-resource-limit-contract',
  unknownDimensionRejected: true, silentTruncationAllowed: false, partialDescriptorAllowed: false,
  dimensions: [
    D('maxDescriptorBytes', 262144, 262144, 262144, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxDescriptorFields', 64, 48, 64, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxPayloadFields', 200, 200, 200, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxLayoutSections', 64, 64, 64, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxRelationships', 128, 128, 128, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxExtensions', 32, 16, 32, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxStringLength', 4096, 4096, 4096, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxValidationIssues', 512, 512, 512, 'CONTRACT_LIMIT_EXCEEDED'),
    D('maxStructureDepth', 64, 64, 64, 'CONTRACT_LIMIT_EXCEEDED'),
  ],
});
export default RESOURCE_LIMIT_CONTRACT;
