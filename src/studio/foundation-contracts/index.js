/**
 * MAK Studio — FOUNDATION CONTRACTS (headless, contract-only).
 *
 * This subtree is the first foundation of MAK Studio: a pure, deterministic,
 * headless set of contracts (metamodel, blueprints, safety policy, diagnostics,
 * manifest, verifier, compatibility checker). It renders no UI, registers no
 * route/menu/module, and never touches backend/Prisma/migration/network/production/
 * staging or performs any mutation. Nothing here is auto-consumed by the app; it is
 * reversible by non-consumption.
 *
 * @module studio/foundation-contracts
 */

export {
  STUDIO_FOUNDATION_CONTRACT_NAME,
  STUDIO_FOUNDATION_CONTRACT_VERSION,
  STUDIO_FOUNDATION_CONTRACTS_VERSION,
  STUDIO_FOUNDATION_ENVIRONMENT,
  STUDIO_HEADLESS_CAPABILITIES,
  MAK_STUDIO_FOUNDATION_CONTRACTS_FLAG,
  MAK_STUDIO_CONTRACT_VERIFY_FLAG,
  MAK_STUDIO_BLUEPRINT_VALIDATE_FLAG,
  MAK_STUDIO_COMPATIBILITY_CHECK_FLAG,
  isStudioFoundationContractsEnabled,
  isStudioContractVerifyEnabled,
  isStudioBlueprintValidateEnabled,
  isStudioCompatibilityCheckEnabled,
} from './studioFoundationContractsConfig.js';

export {
  STUDIO_ERROR_CODES,
  StudioFoundationContractError,
  createStudioError,
  studioFoundationContractError,
} from './errors.js';

export { createStudioContractDigest } from './createStudioContractDigest.js';

export { createStudioMetamodelContract } from './createStudioMetamodelContract.js';
export { createStudioBlueprintContract, STUDIO_BLUEPRINT_STATES } from './createStudioBlueprintContract.js';
export { createStudioModuleBlueprintContract } from './createStudioModuleBlueprintContract.js';
export { createStudioFieldBlueprintContract, STUDIO_FIELD_TYPES } from './createStudioFieldBlueprintContract.js';
export { createStudioScreenBlueprintContract, STUDIO_SCREEN_KINDS } from './createStudioScreenBlueprintContract.js';
export { createStudioValidationBlueprintContract, STUDIO_VALIDATION_KINDS } from './createStudioValidationBlueprintContract.js';
export { createStudioPermissionBlueprintContract, STUDIO_PERMISSION_ACTIONS, STUDIO_PERMISSION_LEVELS } from './createStudioPermissionBlueprintContract.js';
export { createStudioRouteMenuBlueprintContract } from './createStudioRouteMenuBlueprintContract.js';
export { createStudioPersistenceBoundaryContract, STUDIO_PERSISTENCE_STATES } from './createStudioPersistenceBoundaryContract.js';
export { createStudioRuntimeBindingContract, STUDIO_RUNTIME_BINDING_TYPES } from './createStudioRuntimeBindingContract.js';

export { createStudioSafetyPolicy, STUDIO_SAFETY_INVARIANTS } from './createStudioSafetyPolicy.js';
export { createStudioDiagnostics } from './createStudioDiagnostics.js';
export { createStudioFallback, STUDIO_FALLBACK_SCENARIOS } from './createStudioFallback.js';

export { createStudioContractManifest } from './createStudioContractManifest.js';
export { verifyStudioFoundationContracts } from './verifyStudioFoundationContracts.js';
export { checkStudioContractCompatibility } from './checkStudioContractCompatibility.js';

export { createStudioFoundationContract } from './createStudioFoundationContract.js';
export { default } from './createStudioFoundationContract.js';
