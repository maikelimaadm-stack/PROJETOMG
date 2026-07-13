/**
 * MAK Studio — MODULE PREVIEW SANDBOX CONTRACT (headless, contract-only).
 *
 * Consumes the Studio Blueprint Engine and the Module Reference Planner to produce PREVIEW
 * METADATA only (table/form/detail/field/action/permission previews plus route-menu and
 * persistence "blocked" metadata and runtime binding metadata), with manifest, verifier,
 * compatibility checker, diagnostics and fallback. It renders NO UI, creates NO React
 * component/route/menu/module, writes NO file under `src/modules`, and never touches
 * backend/Prisma/migration/network/production/staging, never mutates, never persists,
 * never rewrites Empresas. Nothing here is auto-consumed by the app; it is reversible by
 * non-consumption.
 *
 * @module studio/blueprint-engine/module-preview-sandbox
 */

export {
  MODULE_PREVIEW_SANDBOX_CONTRACT_NAME,
  MODULE_PREVIEW_SANDBOX_CONTRACT_SEMVER,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_MODE,
  MODULE_PREVIEW_SANDBOX_ENVIRONMENT,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  ALLOWED_PREVIEW_KINDS,
  PROHIBITED_EFFECTS,
  MODULE_PREVIEW_READINESS_STATES,
  MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
  MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG,
  MAK_STUDIO_MODULE_PREVIEW_METADATA_FLAG,
  MAK_STUDIO_MODULE_PREVIEW_VERIFY_FLAG,
  MAK_STUDIO_MODULE_PREVIEW_COMPATIBILITY_CHECK_FLAG,
  sandboxDigest,
  isStudioModulePreviewSandboxContractEnabled,
  isStudioModulePreviewMetadataEnabled,
  isStudioModulePreviewVerifyEnabled,
  isStudioModulePreviewCompatibilityCheckEnabled,
} from './modulePreviewSandboxConfig.js';

export {
  MODULE_PREVIEW_SANDBOX_ERROR_CODES,
  ModulePreviewSandboxError,
  createModulePreviewSandboxError,
  modulePreviewSandboxError,
} from './errors.js';

export { createModulePreviewSandboxSession } from './createModulePreviewSandboxSession.js';
export { createModulePreviewTableMetadata } from './createModulePreviewTableMetadata.js';
export { createModulePreviewFormMetadata } from './createModulePreviewFormMetadata.js';
export { createModulePreviewDetailMetadata } from './createModulePreviewDetailMetadata.js';
export { createModulePreviewFieldMetadata } from './createModulePreviewFieldMetadata.js';
export { createModulePreviewActionMetadata } from './createModulePreviewActionMetadata.js';
export { createModulePreviewPermissionMetadata } from './createModulePreviewPermissionMetadata.js';
export { createModulePreviewRouteBlockedMetadata } from './createModulePreviewRouteBlockedMetadata.js';
export { createModulePreviewPersistenceBlockedMetadata } from './createModulePreviewPersistenceBlockedMetadata.js';
export { createModulePreviewRuntimeBindingMetadata } from './createModulePreviewRuntimeBindingMetadata.js';
export { createModulePreviewReadinessDecision } from './createModulePreviewReadinessDecision.js';
export { createModulePreviewSandboxManifest } from './createModulePreviewSandboxManifest.js';
export { verifyModulePreviewSandboxContract } from './verifyModulePreviewSandboxContract.js';
export { checkModulePreviewSandboxCompatibility } from './checkModulePreviewSandboxCompatibility.js';
export { createModulePreviewSandboxDiagnostics } from './createModulePreviewSandboxDiagnostics.js';
export { createModulePreviewSandboxFallback, MODULE_PREVIEW_SANDBOX_FALLBACK_SCENARIOS } from './createModulePreviewSandboxFallback.js';

export { createStudioModulePreviewSandboxContract } from './createStudioModulePreviewSandboxContract.js';
export { default } from './createStudioModulePreviewSandboxContract.js';
