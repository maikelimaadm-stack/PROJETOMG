/**
 * MAK Studio — BLUEPRINT CONTRACT HARDENING (headless, contract-only).
 *
 * This subtree hardens the Studio foundation contracts against invalid, dangerous,
 * breaking, and incompatible cases via pure, deterministic matrices and suites. It
 * renders no UI, registers no route/menu/module, and never touches backend/Prisma/
 * migration/network/production/staging or performs any mutation. Nothing here is
 * auto-consumed by the app; it is reversible by non-consumption.
 *
 * @module studio/foundation-contracts/hardening
 */

export {
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_NAME,
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_SEMVER,
  STUDIO_BLUEPRINT_CONTRACT_HARDENING_VERSION,
  STUDIO_BLUEPRINT_HARDENING_ENVIRONMENT,
  STUDIO_BASE_CONTRACT_VERSION,
  STUDIO_HARDENING_HEADLESS_CAPABILITIES,
  STUDIO_HARDENING_MAX_BLUEPRINT_KEYS,
  STUDIO_HARDENING_MAX_DEPTH,
  MAK_STUDIO_BLUEPRINT_CONTRACT_HARDENING_FLAG,
  MAK_STUDIO_FIELD_MATRIX_FLAG,
  MAK_STUDIO_SCREEN_MATRIX_FLAG,
  MAK_STUDIO_VALIDATION_MATRIX_FLAG,
  MAK_STUDIO_PERMISSION_MATRIX_FLAG,
  MAK_STUDIO_ROUTE_MENU_BLOCKER_MATRIX_FLAG,
  MAK_STUDIO_PERSISTENCE_TRANSITION_MATRIX_FLAG,
  MAK_STUDIO_COMPATIBILITY_BREAKING_MATRIX_FLAG,
  isStudioBlueprintContractHardeningEnabled,
  isStudioFieldMatrixEnabled,
  isStudioPermissionMatrixEnabled,
  isStudioCompatibilityBreakingMatrixEnabled,
} from './studioBlueprintHardeningConfig.js';

export {
  STUDIO_HARDENING_ERROR_CODES,
  StudioBlueprintHardeningError,
  createStudioHardeningError,
  studioBlueprintHardeningError,
} from './errors.js';

export { createStudioBlueprintInvalidCaseMatrix, evaluateStudioBlueprintValidity } from './createStudioBlueprintInvalidCaseMatrix.js';
export { createStudioDangerousBlueprintMatrix, evaluateDangerousBlueprint } from './createStudioDangerousBlueprintMatrix.js';
export { createStudioFieldHardeningMatrix, evaluateStudioField } from './createStudioFieldHardeningMatrix.js';
export { createStudioScreenHardeningMatrix, evaluateStudioScreen } from './createStudioScreenHardeningMatrix.js';
export { createStudioValidationHardeningMatrix, evaluateStudioValidation } from './createStudioValidationHardeningMatrix.js';
export { createStudioPermissionHardeningMatrix, evaluateStudioPermission } from './createStudioPermissionHardeningMatrix.js';
export { createStudioRouteMenuHardeningMatrix, evaluateStudioRouteMenu } from './createStudioRouteMenuHardeningMatrix.js';
export { createStudioPersistenceTransitionMatrix, evaluateStudioPersistenceTransition } from './createStudioPersistenceTransitionMatrix.js';
export { createStudioRuntimeBindingHardeningMatrix, evaluateStudioRuntimeBinding } from './createStudioRuntimeBindingHardeningMatrix.js';
export { createStudioCompatibilityBreakingMatrix, classifyStudioCompatibility } from './createStudioCompatibilityBreakingMatrix.js';
export { createStudioDigestHardeningSuite, safeStudioDigest } from './createStudioDigestHardeningSuite.js';
export { createStudioVerifierHardeningSuite } from './createStudioVerifierHardeningSuite.js';
export { createStudioSafetyInvariantRunner } from './createStudioSafetyInvariantRunner.js';
export { createStudioContractPerformanceBaseline } from './createStudioContractPerformanceBaseline.js';
export { createStudioBlueprintHardeningDiagnostics } from './createStudioBlueprintHardeningDiagnostics.js';
export { createStudioBlueprintHardeningFallback, STUDIO_HARDENING_FALLBACK_SCENARIOS } from './createStudioBlueprintHardeningFallback.js';

export { createStudioBlueprintContractHardening } from './createStudioBlueprintContractHardening.js';
export { default } from './createStudioBlueprintContractHardening.js';
