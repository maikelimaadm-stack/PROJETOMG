/**
 * STUDIO MODULE BLUEPRINT AUTHORING RUNTIME — public surface.
 *
 * Headless, dev-only, synthetic-only, in-memory, ephemeral, deterministic, immutable-by-contract,
 * fail-closed and side-effect-free. Exposes ONLY `.js`. No `.jsx`/`.tsx`/`.css`. Consumes the
 * Authoring Implementation Plan read-only; implements the authoring runtime purely in memory on
 * synthetic data; exposes nothing to the product. The certified blueprint remains the canonical SSOT;
 * drafts and candidates are non-canonical and can never self-certify.
 */

export {
  AUTHORING_RUNTIME_NAME,
  AUTHORING_RUNTIME_SEMVER,
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_RUNTIME_MODE,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  SOURCE_CHECKPOINT,
  CHECKPOINT_DECISION,
  AUTHORING_LIFECYCLE_STATES,
  AUTHORING_LIFECYCLE_TRANSITIONS,
  FORBIDDEN_LIFECYCLE_STATES,
  AUTHORING_OPERATION_IDS,
  REVISION_PRODUCING_OPERATIONS,
  VALIDATION_PIPELINE_STAGES,
  AUTHORING_INVARIANT_IDS,
  AUTHORING_ISSUE_SEVERITIES,
  AUTHORING_FIELD_KINDS,
  AUTHORING_RELATIONSHIP_CARDINALITIES,
  FORBIDDEN_PROTOTYPE_PATHS,
  DEFAULT_AUTHORING_RESOURCE_LIMITS,
  AUTHORING_RUNTIME_READINESS_STATES,
  AUTHORING_RUNTIME_CAPABILITIES,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG,
  isProductionEnv,
  isStudioModuleBlueprintAuthoringRuntimeEnabled,
  isStudioModuleBlueprintAuthoringRuntimeVerifyEnabled,
} from './authoringRuntimeConfig.js';

export {
  AUTHORING_RUNTIME_ERROR_CODES,
  AuthoringRuntimeError,
  createAuthoringRuntimeError,
  authoringRuntimeError,
} from './errors.js';

export { stableSerialize } from './stableSerialize.js';
export { createDeterministicDigest } from './createDeterministicDigest.js';
export { normalizeAuthoringInput, isPlainObject, safeString, safeNonNegativeInt } from './normalizeAuthoringInput.js';
export { createAuthoringResourceLimits } from './createAuthoringResourceLimits.js';
export { enforceAuthoringResourceLimits, enforceStringLength, enforceSerializedSnapshotBytes } from './enforceAuthoringResourceLimits.js';
export { createValidationIssue, sortValidationIssues } from './createValidationIssue.js';
export { createDraftSnapshot } from './createDraftSnapshot.js';
export { createLifecycleExecutor, isLifecycleTransitionAllowed } from './createLifecycleExecutor.js';
export { createRevisionEngine, nextRevision } from './createRevisionEngine.js';
export { createInvariantEnforcer, enforceAuthoringInvariants } from './createInvariantEnforcer.js';
export { createValidationPipeline, runValidationPipeline } from './createValidationPipeline.js';
export { createOperationReceipt } from './createOperationReceipt.js';
export { createOperationExecutor, executeAuthoringOperation } from './createOperationExecutor.js';
export { createAuthoringRuntimeSession } from './createAuthoringRuntimeSession.js';
export { createSyntheticPreviewHandoff } from './createSyntheticPreviewHandoff.js';
export { createCertificationCandidatePreparation } from './createCertificationCandidatePreparation.js';
export { discardAuthoringDraft } from './discardAuthoringDraft.js';
export { createAuthoringRuntimeSsotBoundary } from './createAuthoringRuntimeSsotBoundary.js';
export { createAuthoringRuntimePermissionTenancyBoundary } from './createAuthoringRuntimePermissionTenancyBoundary.js';
export { createAuthoringRuntimeSafety } from './createAuthoringRuntimeSafety.js';
export { createAuthoringRuntimeDiagnostics } from './createAuthoringRuntimeDiagnostics.js';
export { createAuthoringRuntimeReadinessDecision } from './createAuthoringRuntimeReadinessDecision.js';
export { createAuthoringRuntimeManifest } from './createAuthoringRuntimeManifest.js';
export { verifyAuthoringRuntime, verifyAuthoringOperationOutcome } from './verifyAuthoringRuntime.js';
export { checkAuthoringRuntimeCompatibility } from './checkAuthoringRuntimeCompatibility.js';
export { createAuthoringRuntimeFallback } from './createAuthoringRuntimeFallback.js';
export { createStudioModuleBlueprintAuthoringRuntime } from './createStudioModuleBlueprintAuthoringRuntime.js';

export { default } from './createStudioModuleBlueprintAuthoringRuntime.js';
