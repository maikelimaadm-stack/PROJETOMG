/**
 * STUDIO MODULE BLUEPRINT AUTHORING FOUNDATION CONTRACT — public surface.
 *
 * Headless, contract-only, metadata-only. Exposes ONLY `.js` metadata contracts. No `.jsx`/`.tsx`/
 * `.css`. Consumes the certified Blueprint Contract read-only; authors nothing; implements nothing;
 * exposes nothing to the product. The certified blueprint remains the canonical SSOT; a draft is
 * temporary and non-canonical and can never self-certify.
 */

export {
  AUTHORING_FOUNDATION_CONTRACT_NAME,
  AUTHORING_FOUNDATION_CONTRACT_SEMVER,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_MODE,
  BLUEPRINT_CONTRACT_VERSION,
  BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  AUTHORING_LIFECYCLE_STATES,
  AUTHORING_LIFECYCLE_TRANSITIONS,
  FORBIDDEN_LIFECYCLE_STATES,
  AUTHORING_ISSUE_SEVERITIES,
  AUTHORING_OPERATION_IDS,
  AUTHORING_INVARIANT_IDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  AUTHORING_FOUNDATION_READINESS_STATES,
  AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG,
  MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG,
  authoringFoundationDigest,
  isProductionEnv,
  isStudioModuleBlueprintAuthoringFoundationEnabled,
  isStudioModuleBlueprintAuthoringFoundationVerifyEnabled,
  isStudioModuleBlueprintAuthoringFoundationCompatibilityCheckEnabled,
} from './authoringFoundationContractConfig.js';

export {
  AUTHORING_FOUNDATION_ERROR_CODES,
  AuthoringFoundationError,
  createAuthoringFoundationError,
  authoringFoundationError,
} from './errors.js';

export { createAuthoringFoundationContractSession } from './createAuthoringFoundationContractSession.js';
export { createBlueprintDraftDescriptor } from './createBlueprintDraftDescriptor.js';
export { createFieldDraftDescriptor, AUTHORING_FIELD_KINDS } from './createFieldDraftDescriptor.js';
export { createLayoutDraftDescriptor } from './createLayoutDraftDescriptor.js';
export { createRelationshipDraftDescriptor, AUTHORING_RELATIONSHIP_CARDINALITIES } from './createRelationshipDraftDescriptor.js';
export { createValidationIssueDescriptor } from './createValidationIssueDescriptor.js';
export { createAuthoringLifecycleContract } from './createAuthoringLifecycleContract.js';
export { createAuthoringOperationCatalog } from './createAuthoringOperationCatalog.js';
export { createAuthoringInvariantCatalog } from './createAuthoringInvariantCatalog.js';
export { createPreviewHandoffContract } from './createPreviewHandoffContract.js';
export { createCertificationCandidateHandoffContract } from './createCertificationCandidateHandoffContract.js';
export { createAuthoringSsotBoundaryContract } from './createAuthoringSsotBoundaryContract.js';
export { createPermissionTenancyBoundaryContract } from './createPermissionTenancyBoundaryContract.js';
export { createPrototypeRelinkProhibitionContract } from './createPrototypeRelinkProhibitionContract.js';
export { createAuthoringManualEnablementGateContract } from './createAuthoringManualEnablementGateContract.js';
export { createAuthoringSafetyContract } from './createAuthoringSafetyContract.js';
export { createAuthoringFoundationReadinessDecision } from './createAuthoringFoundationReadinessDecision.js';
export { createAuthoringFoundationManifest } from './createAuthoringFoundationManifest.js';
export { verifyAuthoringFoundationContract } from './verifyAuthoringFoundationContract.js';
export { checkAuthoringFoundationCompatibility } from './checkAuthoringFoundationCompatibility.js';
export { createAuthoringFoundationDiagnostics } from './createAuthoringFoundationDiagnostics.js';
export { createAuthoringFoundationFallback } from './createAuthoringFoundationFallback.js';
export { createStudioModuleBlueprintAuthoringFoundationContract } from './createStudioModuleBlueprintAuthoringFoundationContract.js';

export { default } from './createStudioModuleBlueprintAuthoringFoundationContract.js';
