import { CONTRACT_READINESS_STATES } from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Readiness decision for the contract-only slice (fail-closed on any blocker). @param {Object} [o] @returns {Object} */
export function createContractReadinessDecision(o = {}) {
  const blockers = Array.isArray(o && o.blockers) ? o.blockers : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit' : 'blocked';
  return deepFreeze({
    kind: 'bridge-to-sandbox-readiness-decision',
    contractDefined: ready, realBridgeDescriptorShapeCaptured: true, realSandboxContractShapeCaptured: true,
    identityContractDefined: true, versionContractDefined: true, digestContractDefined: true,
    readOnlyConsumptionContractDefined: true, mappingContractDefined: true, validationPipelineContractDefined: true,
    failureContainmentContractDefined: true, resourceLimitsContractDefined: true, extensibilityContractDefined: true,
    replayContractDefined: true, ssotBoundaryDefined: true, permissionTenancyBoundaryDefined: true, manualCheckpointDefined: true,
    implementationPlanCreated: false, consumerRuntimeImplemented: false, sourceValidationImplemented: false,
    mappingExecutorImplemented: false, sandboxDescriptorBuilderImplemented: false, previewPayloadCreated: false,
    previewMounted: false, appTouched: false, routeCreated: false, menuCreated: false, persistenceImplemented: false,
    backendAccessed: false, prismaAccessed: false, networkUsed: false, realDataRead: false, realDataWrite: false,
    moduleGenerated: false, certificationPerformed: false, productExposed: false, productionAccessed: false,
    prototypeRelinked: false, permissionModelIntegrated: false, tenantModelIntegrated: false,
    readyForImplementationPlan: false, readyForEnterpriseContractAudit: ready, readyForRuntimeImplementation: false,
    readyForPreviewMount: false, readyForProductExposure: false,
    readiness, knownState: CONTRACT_READINESS_STATES.includes(readiness), blockers: [...blockers], blockerCount: blockers.length,
  });
}
export default createContractReadinessDecision;
