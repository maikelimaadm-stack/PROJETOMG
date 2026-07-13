/**
 * MAK Studio — BLUEPRINT CONTRACT CERTIFICATION (headless, contract-only).
 *
 * This subtree certifies the hardened Studio foundation contracts as a canonical,
 * versioned, verifiable and compatible reference for future blueprints. It renders no
 * UI, registers no route/menu/module, and never touches backend/Prisma/migration/
 * network/production/staging or performs any mutation. Nothing here is auto-consumed
 * by the app; it is reversible by non-consumption.
 *
 * @module studio/foundation-contracts/certification
 */

export {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_SEMVER,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_NAME,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
  STUDIO_FOUNDATION_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_HARDENING_VERSION,
  STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
  STUDIO_CERTIFICATION_HARDENING_BASELINE,
  MAK_STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_FLAG,
  MAK_STUDIO_BLUEPRINT_CERTIFICATION_VERIFY_FLAG,
  MAK_STUDIO_BLUEPRINT_COMPATIBILITY_CHECK_FLAG,
  MAK_STUDIO_BLUEPRINT_CANONICAL_DIGEST_FLAG,
  isStudioBlueprintContractCertificationEnabled,
  isStudioBlueprintCertificationVerifyEnabled,
  isStudioBlueprintCompatibilityCheckEnabled,
} from './studioBlueprintCertificationConfig.js';

export {
  STUDIO_CERTIFICATION_ERROR_CODES,
  StudioBlueprintCertificationError,
  createStudioCertificationError,
  studioBlueprintCertificationError,
} from './errors.js';

export { createStudioBlueprintCertificationDigest, certificationDigest } from './createStudioBlueprintCertificationDigest.js';

export { createStudioCanonicalMetamodel } from './createStudioCanonicalMetamodel.js';
export { createStudioCanonicalBlueprintContract } from './createStudioCanonicalBlueprintContract.js';
export { createStudioCanonicalModuleBlueprint } from './createStudioCanonicalModuleBlueprint.js';
export { createStudioCanonicalFieldContract } from './createStudioCanonicalFieldContract.js';
export { createStudioCanonicalScreenContract } from './createStudioCanonicalScreenContract.js';
export { createStudioCanonicalValidationContract } from './createStudioCanonicalValidationContract.js';
export { createStudioCanonicalPermissionContract } from './createStudioCanonicalPermissionContract.js';
export { createStudioCanonicalRouteMenuContract } from './createStudioCanonicalRouteMenuContract.js';
export { createStudioCanonicalPersistenceBoundary } from './createStudioCanonicalPersistenceBoundary.js';
export { createStudioCanonicalRuntimeBinding } from './createStudioCanonicalRuntimeBinding.js';
export { createStudioCanonicalSafetyInvariants } from './createStudioCanonicalSafetyInvariants.js';
export { createStudioCanonicalErrorCatalog } from './createStudioCanonicalErrorCatalog.js';
export { createStudioCanonicalCompatibilityRules } from './createStudioCanonicalCompatibilityRules.js';
export { createStudioCanonicalHardeningBaseline } from './createStudioCanonicalHardeningBaseline.js';

export { createStudioBlueprintCertificationManifest } from './createStudioBlueprintCertificationManifest.js';
export { verifyStudioBlueprintContractCertification } from './verifyStudioBlueprintContractCertification.js';
export { checkStudioBlueprintCertificationCompatibility } from './checkStudioBlueprintCertificationCompatibility.js';
export { createStudioBlueprintCertificationDiagnostics } from './createStudioBlueprintCertificationDiagnostics.js';
export { createStudioBlueprintCertificationFallback, STUDIO_CERTIFICATION_FALLBACK_SCENARIOS } from './createStudioBlueprintCertificationFallback.js';

export { createStudioBlueprintContractCertification } from './createStudioBlueprintContractCertification.js';
export { default } from './createStudioBlueprintContractCertification.js';
