import { ENVELOPE_READINESS_STATES } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** @param {Object} [o] @returns {Object} */
export function createEnvelopeReadinessDecision(o = {}) {
  const blockers = Array.isArray(o && o.blockers) ? o.blockers : [];
  const bIdentityClosed = o && o.bIdentityClosedByContract === true;
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_bridge_decision_envelope_identity_contract_ready_for_enterprise_audit' : 'blocked';
  return deepFreeze({
    kind: 'envelope-readiness-decision',
    envelopeContractDefined: ready, realBridgeDecisionShapeCaptured: true, realTargetDescriptorShapeCaptured: true,
    decisionDigestCoverageContractDefined: true, identityBindingContractDefined: true, provenanceContractDefined: true,
    versionContractDefined: true, readOnlyContractDefined: true, validationPipelineContractDefined: true,
    failureContainmentContractDefined: true, resourceLimitsContractDefined: true, extensibilityContractDefined: true,
    replayContractDefined: true, ssotBoundaryDefined: true, permissionTenancyBoundaryDefined: true, manualCheckpointDefined: true,
    envelopeBuilderImplemented: false, identityVerificationImplemented: false, validationImplemented: false,
    consumerRuntimeImplemented: false, previewMounted: false, appTouched: false, routeCreated: false, menuCreated: false,
    persistenceImplemented: false, backendAccessed: false, prismaAccessed: false, networkUsed: false, realDataRead: false,
    moduleGenerated: false, certificationPerformed: false, productExposed: false, productionAccessed: false, prototypeRelinked: false,
    bIdentityClosedByContract: bIdentityClosed,
    readyForEnterpriseContractAudit: ready, readyForImplementationPlan: false, readyForRuntimeImplementation: false,
    readyForPreviewMount: false, readyForProductExposure: false,
    readiness, knownState: ENVELOPE_READINESS_STATES.includes(readiness), blockers: [...blockers], blockerCount: blockers.length,
  });
}
export default createEnvelopeReadinessDecision;
