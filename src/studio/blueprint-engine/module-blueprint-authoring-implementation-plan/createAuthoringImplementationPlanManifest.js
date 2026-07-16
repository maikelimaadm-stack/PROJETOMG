import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_IMPLEMENTATION_PLAN_NAME,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES,
  authoringPlanDigest,
} from './authoringImplementationPlanConfig.js';
import { createAuthoringImplementationPlanSession } from './createAuthoringImplementationPlanSession.js';
import { createAuthoringImplementationPhases } from './createAuthoringImplementationPhases.js';
import { createDraftRuntimePlan } from './createDraftRuntimePlan.js';
import { createLifecycleRuntimePlan } from './createLifecycleRuntimePlan.js';
import { createOperationExecutorPlan } from './createOperationExecutorPlan.js';
import { createRevisionEnginePlan } from './createRevisionEnginePlan.js';
import { createValidationPipelinePlan } from './createValidationPipelinePlan.js';
import { createInvariantEnforcementPlan } from './createInvariantEnforcementPlan.js';
import { createSyntheticPreviewHandoffPlan } from './createSyntheticPreviewHandoffPlan.js';
import { createCertificationCandidatePreparationPlan } from './createCertificationCandidatePreparationPlan.js';
import { createSsotProtectionPlan } from './createSsotProtectionPlan.js';
import { createPermissionTenancyBoundaryPlan } from './createPermissionTenancyBoundaryPlan.js';
import { createPersistenceProhibitionPlan } from './createPersistenceProhibitionPlan.js';
import { createModuleGenerationProhibitionPlan } from './createModuleGenerationProhibitionPlan.js';
import { createPrototypeRelinkStaticAssertionPlan } from './createPrototypeRelinkStaticAssertionPlan.js';
import { createAuthoringTestHarnessPlan } from './createAuthoringTestHarnessPlan.js';
import { createAuthoringManualEnablementGatePlan } from './createAuthoringManualEnablementGatePlan.js';
import { createAuthoringRolloutRollbackPlan } from './createAuthoringRolloutRollbackPlan.js';
import { createAuthoringObservabilityDiagnosticsPlan } from './createAuthoringObservabilityDiagnosticsPlan.js';
import { createAuthoringGovernanceRegistryPlan } from './createAuthoringGovernanceRegistryPlan.js';
import { createAuthoringImplementationSafetyPlan } from './createAuthoringImplementationSafetyPlan.js';

/**
 * Builds the authoring-implementation-plan manifest with deterministic digests for every part. Pure —
 * can build standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.authoringFoundationContract]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createAuthoringImplementationPlanManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.authoringFoundationContract) ? o.authoringFoundationContract : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createAuthoringImplementationPlanSession({ authoringFoundationContract: c });
  const phases = p.phases ?? createAuthoringImplementationPhases();
  const draftRuntimePlan = p.draftRuntimePlan ?? createDraftRuntimePlan();
  const lifecycleRuntimePlan = p.lifecycleRuntimePlan ?? createLifecycleRuntimePlan();
  const operationExecutorPlan = p.operationExecutorPlan ?? createOperationExecutorPlan();
  const revisionEnginePlan = p.revisionEnginePlan ?? createRevisionEnginePlan();
  const validationPipelinePlan = p.validationPipelinePlan ?? createValidationPipelinePlan();
  const invariantEnforcementPlan = p.invariantEnforcementPlan ?? createInvariantEnforcementPlan();
  const syntheticPreviewHandoffPlan = p.syntheticPreviewHandoffPlan ?? createSyntheticPreviewHandoffPlan();
  const certificationCandidatePreparationPlan = p.certificationCandidatePreparationPlan ?? createCertificationCandidatePreparationPlan();
  const ssotProtectionPlan = p.ssotProtectionPlan ?? createSsotProtectionPlan();
  const permissionTenancyBoundaryPlan = p.permissionTenancyBoundaryPlan ?? createPermissionTenancyBoundaryPlan();
  const persistenceProhibitionPlan = p.persistenceProhibitionPlan ?? createPersistenceProhibitionPlan();
  const moduleGenerationProhibitionPlan = p.moduleGenerationProhibitionPlan ?? createModuleGenerationProhibitionPlan();
  const prototypeRelinkStaticAssertion = p.prototypeRelinkStaticAssertion ?? createPrototypeRelinkStaticAssertionPlan();
  const testHarness = p.testHarness ?? createAuthoringTestHarnessPlan();
  const manualGate = p.manualGate ?? createAuthoringManualEnablementGatePlan();
  const rolloutRollback = p.rolloutRollback ?? createAuthoringRolloutRollbackPlan();
  const observability = p.observability ?? createAuthoringObservabilityDiagnosticsPlan();
  const governanceRegistry = p.governanceRegistry ?? createAuthoringGovernanceRegistryPlan();
  const safety = p.safety ?? createAuthoringImplementationSafetyPlan();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    phases: phases.phasesDigest,
    draftRuntimePlan: draftRuntimePlan.draftRuntimePlanDigest,
    lifecycleRuntimePlan: lifecycleRuntimePlan.lifecycleRuntimePlanDigest,
    operationExecutorPlan: operationExecutorPlan.operationExecutorPlanDigest,
    revisionEnginePlan: revisionEnginePlan.revisionEnginePlanDigest,
    validationPipelinePlan: validationPipelinePlan.validationPipelinePlanDigest,
    invariantEnforcementPlan: invariantEnforcementPlan.invariantEnforcementPlanDigest,
    syntheticPreviewHandoffPlan: syntheticPreviewHandoffPlan.syntheticPreviewHandoffPlanDigest,
    certificationCandidatePreparationPlan: certificationCandidatePreparationPlan.certificationCandidatePreparationPlanDigest,
    ssotProtectionPlan: ssotProtectionPlan.ssotProtectionPlanDigest,
    permissionTenancyBoundaryPlan: permissionTenancyBoundaryPlan.permissionTenancyBoundaryPlanDigest,
    persistenceProhibitionPlan: persistenceProhibitionPlan.persistenceProhibitionPlanDigest,
    moduleGenerationProhibitionPlan: moduleGenerationProhibitionPlan.moduleGenerationProhibitionPlanDigest,
    prototypeRelinkStaticAssertion: prototypeRelinkStaticAssertion.prototypeRelinkStaticAssertionPlanDigest,
    testHarness: testHarness.testHarnessPlanDigest,
    manualGate: manualGate.manualEnablementGatePlanDigest,
    rolloutRollback: rolloutRollback.rolloutRollbackPlanDigest,
    observability: observability.observabilityDiagnosticsPlanDigest,
    governanceRegistry: governanceRegistry.governanceRegistryPlanDigest,
    safety: safety.safetyPlanDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'authoring-implementation-plan-manifest',
    authoringImplementationPlanName: AUTHORING_IMPLEMENTATION_PLAN_NAME,
    authoringImplementationPlanVersion: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
    upstream: {
      authoringFoundationContract: AUTHORING_FOUNDATION_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
      blueprintEngine: BLUEPRINT_ENGINE_VERSION,
      moduleReferencePlanner: MODULE_REFERENCE_PLANNER_VERSION,
      previewSandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
    },
    parts,
    partCount: Object.keys(parts).length,
    capabilities: { ...AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: authoringPlanDigest(core) });
}

export default createAuthoringImplementationPlanManifest;
