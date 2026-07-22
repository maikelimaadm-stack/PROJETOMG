import { deepFreeze } from './deepFreeze.js';

/**
 * SAME-DECISION PROVENANCE PLAN — how the future runtime prevents any mixing/tampering of the atomic
 * {bridgeDecisionDigest, targetDescriptor} pair. Declaration only. Issue codes are FUTURE runtime codes.
 */
const T = (threat, detection, issueCode) => deepFreeze({ threat, detection, issueCode, blocking: true });

export const SAME_DECISION_PROVENANCE_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-same-decision-provenance-plan',
  atomicPairRequired: true,
  crossDecisionMixingAllowed: false,
  descriptorReplacementAllowed: false,
  digestReplacementAllowed: false,
  threats: deepFreeze([
    T('digest A + descriptor B', 'recompute digest over descriptor-B preimage; mismatch vs digest A', 'RUNTIME_DECISION_DESCRIPTOR_MISMATCH'),
    T('digest B + descriptor A', 'recompute digest over descriptor-A preimage; mismatch vs digest B', 'RUNTIME_DECISION_DESCRIPTOR_MISMATCH'),
    T('descriptor tampered', 'digest no longer matches recomputed preimage', 'RUNTIME_DECISION_DIGEST_MISMATCH'),
    T('digest tampered', 'carried digest differs from recomputed digest', 'RUNTIME_DECISION_DIGEST_MISMATCH'),
    T('status mismatch', 'sourceBridgeDecisionStatus differs from decision status in preimage', 'RUNTIME_SOURCE_VERSION_MISMATCH'),
    T('version mismatch', 'source version differs from exact contract version', 'RUNTIME_SOURCE_VERSION_MISMATCH'),
    T('cross-decision mix', 'pair not atomic — digest and descriptor from different decisions', 'RUNTIME_CROSS_DECISION_MIX_FORBIDDEN'),
  ]),
  issueCodes: deepFreeze([
    'RUNTIME_ENVELOPE_REQUIRED', 'RUNTIME_BRIDGE_DECISION_DIGEST_REQUIRED', 'RUNTIME_TARGET_DESCRIPTOR_REQUIRED',
    'RUNTIME_DECISION_DIGEST_MISMATCH', 'RUNTIME_DECISION_DESCRIPTOR_MISMATCH', 'RUNTIME_CROSS_DECISION_MIX_FORBIDDEN',
    'RUNTIME_SOURCE_VERSION_MISMATCH',
  ]),
  provenanceImplemented: false,
});

export default SAME_DECISION_PROVENANCE_PLAN;
