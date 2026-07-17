import {
  AUTHORING_RUNTIME_NAME, AUTHORING_RUNTIME_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION, AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  BLUEPRINT_CONTRACT_VERSION, BLUEPRINT_ENGINE_VERSION, MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION, AUTHORING_RUNTIME_CAPABILITIES,
} from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createAuthoringRuntimeSession } from './createAuthoringRuntimeSession.js';
import { createAuthoringResourceLimits } from './createAuthoringResourceLimits.js';
import { createLifecycleExecutor } from './createLifecycleExecutor.js';
import { createOperationExecutor } from './createOperationExecutor.js';
import { createRevisionEngine } from './createRevisionEngine.js';
import { createValidationPipeline } from './createValidationPipeline.js';
import { createInvariantEnforcer } from './createInvariantEnforcer.js';
import { createSyntheticPreviewHandoff } from './createSyntheticPreviewHandoff.js';
import { createCertificationCandidatePreparation } from './createCertificationCandidatePreparation.js';
import { discardAuthoringDraft } from './discardAuthoringDraft.js';
import { createAuthoringRuntimeSsotBoundary } from './createAuthoringRuntimeSsotBoundary.js';
import { createAuthoringRuntimePermissionTenancyBoundary } from './createAuthoringRuntimePermissionTenancyBoundary.js';
import { createAuthoringRuntimeSafety } from './createAuthoringRuntimeSafety.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Builds the runtime manifest with deterministic digests for every part. Pure. @param {Object} [options]
 * @returns {Object}
 */
export function createAuthoringRuntimeManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const p = isPlainObject(o.parts) ? o.parts : {};
  const session = p.session ?? createAuthoringRuntimeSession({ seed: 'manifest' });
  const limits = p.limits ?? createAuthoringResourceLimits();
  const lifecycle = p.lifecycle ?? createLifecycleExecutor();
  const operations = p.operations ?? createOperationExecutor();
  const revisions = p.revisions ?? createRevisionEngine();
  const validation = p.validation ?? createValidationPipeline();
  const invariants = p.invariants ?? createInvariantEnforcer();
  const previewHandoff = p.previewHandoff ?? createSyntheticPreviewHandoff();
  const candidate = p.candidate ?? createCertificationCandidatePreparation();
  const discard = p.discard ?? discardAuthoringDraft();
  const ssotBoundary = p.ssotBoundary ?? createAuthoringRuntimeSsotBoundary();
  const permissionTenancy = p.permissionTenancy ?? createAuthoringRuntimePermissionTenancyBoundary();
  const safety = p.safety ?? createAuthoringRuntimeSafety();
  const readiness = p.readiness ?? null;
  const diagnostics = p.diagnostics ?? null;

  const parts = {
    session: session.sessionDigest,
    limits: limits.limitsDigest,
    lifecycle: lifecycle.lifecycleExecutorDigest,
    operations: operations.operationExecutorDigest,
    revisions: revisions.revisionEngineDigest,
    validation: validation.validationPipelineDigest,
    invariants: invariants.invariantEnforcerDigest,
    previewHandoff: previewHandoff.handoffDigest,
    candidatePreparation: candidate.candidateDigest,
    discard: discard.discardDigest,
    ssotBoundary: ssotBoundary.ssotBoundaryDigest,
    permissionTenancy: permissionTenancy.permissionTenancyDigest,
    safety: safety.safetyDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
    diagnostics: diagnostics && diagnostics.diagnosticsDigest ? diagnostics.diagnosticsDigest : null,
  };
  const core = {
    kind: 'authoring-runtime-manifest',
    authoringRuntimeName: AUTHORING_RUNTIME_NAME,
    authoringRuntimeVersion: AUTHORING_RUNTIME_VERSION,
    upstream: {
      authoringImplementationPlan: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
      authoringFoundationContract: AUTHORING_FOUNDATION_CONTRACT_VERSION,
      blueprintContract: BLUEPRINT_CONTRACT_VERSION,
      blueprintEngine: BLUEPRINT_ENGINE_VERSION,
      moduleReferencePlanner: MODULE_REFERENCE_PLANNER_VERSION,
      previewSandbox: PREVIEW_SANDBOX_CONTRACT_VERSION,
    },
    parts,
    partCount: Object.keys(parts).length,
    capabilities: { ...AUTHORING_RUNTIME_CAPABILITIES },
  };
  return Object.freeze({ ...core, manifestDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeManifest;
