import { deepFreeze } from './deepFreeze.js';
const D = (dim, source, envelope, consumer, issueCode) => Object.freeze({
  dimension: dim, sourceLimit: source, envelopeLimit: envelope, consumerLimit: consumer,
  reason: 'envelope/consumer limits <= source (fail-closed; no truncation; derived from bridge/sandbox limits)', issueCode,
});
export const RESOURCE_LIMIT_CONTRACT = deepFreeze({
  kind: 'envelope-resource-limit-contract',
  unknownDimensionRejected: true, silentTruncationAllowed: false, partialEnvelopeAllowed: false,
  dimensions: [
    D('maxEnvelopeBytes', 262144, 262144, 262144, 'ENVELOPE_LIMIT_EXCEEDED'),
    D('maxDecisionFields', 48, 48, 48, 'ENVELOPE_LIMIT_EXCEEDED'),
    D('maxTargetDescriptorFields', 64, 64, 64, 'ENVELOPE_LIMIT_EXCEEDED'),
    D('maxIssues', 512, 512, 512, 'ENVELOPE_LIMIT_EXCEEDED'),
    D('maxStringLength', 4096, 4096, 4096, 'ENVELOPE_LIMIT_EXCEEDED'),
    D('maxStructureDepth', 64, 64, 64, 'ENVELOPE_LIMIT_EXCEEDED'),
  ],
});
export default RESOURCE_LIMIT_CONTRACT;
