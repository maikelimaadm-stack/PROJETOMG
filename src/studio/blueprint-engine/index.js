/**
 * MAK Studio — BLUEPRINT ENGINE FOUNDATION (headless, contract-only).
 *
 * This subtree is the first engine of MAK Studio: a pure, deterministic pipeline that
 * turns a DRAFT blueprint into a normalized, validated (structure + safety + certified
 * hardening), manifested, verified, compared, compatibility-classified, diagnosed
 * blueprint — plus headless preview metadata, a readiness verdict, and a next decision.
 * It renders no UI, registers no route/menu/module, and never touches backend/Prisma/
 * migration/network/production/staging, never mutates, never persists, never generates a
 * module, and never rewrites Empresas (consumed only as a certified seed reference).
 * Nothing here is auto-consumed by the app; it is reversible by non-consumption.
 *
 * @module studio/blueprint-engine
 */

export {
  STUDIO_BLUEPRINT_ENGINE_NAME,
  STUDIO_BLUEPRINT_ENGINE_SEMVER,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_MODE,
  STUDIO_BLUEPRINT_ENGINE_ENVIRONMENT,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_HARDENING_VERSION,
  STUDIO_FOUNDATION_CONTRACT_VERSION,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  STUDIO_BLUEPRINT_ENGINE_STATES,
  STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
  MAK_STUDIO_BLUEPRINT_ENGINE_FLAG,
  MAK_STUDIO_BLUEPRINT_ENGINE_VALIDATE_FLAG,
  MAK_STUDIO_BLUEPRINT_ENGINE_COMPATIBILITY_FLAG,
  MAK_STUDIO_BLUEPRINT_ENGINE_MANIFEST_FLAG,
  MAK_STUDIO_BLUEPRINT_ENGINE_PREVIEW_METADATA_FLAG,
  engineDigest,
  isStudioBlueprintEngineEnabled,
  isStudioBlueprintEngineValidateEnabled,
  isStudioBlueprintEngineCompatibilityEnabled,
  isStudioBlueprintEngineManifestEnabled,
  isStudioBlueprintEnginePreviewMetadataEnabled,
} from './studioBlueprintEngineConfig.js';

export {
  STUDIO_BLUEPRINT_ENGINE_ERROR_CODES,
  StudioBlueprintEngineError,
  createStudioBlueprintEngineError,
  studioBlueprintEngineError,
} from './errors.js';

export { createStudioBlueprintEngineDigest, studioBlueprintEngineDigest } from './createStudioBlueprintEngineDigest.js';

export { createStudioDraftBlueprint, STUDIO_ENGINE_FIELD_TYPES, STUDIO_ENGINE_SCREEN_KINDS, STUDIO_ENGINE_PERMISSION_ACTIONS } from './createStudioDraftBlueprint.js';
export { normalizeStudioBlueprint } from './normalizeStudioBlueprint.js';
export { validateStudioBlueprint } from './validateStudioBlueprint.js';
export { validateStudioBlueprintSafety } from './validateStudioBlueprintSafety.js';
export { validateStudioBlueprintAgainstHardening } from './validateStudioBlueprintAgainstHardening.js';
export { createStudioBlueprintManifest } from './createStudioBlueprintManifest.js';
export { verifyStudioBlueprintEngineManifest } from './verifyStudioBlueprintEngineManifest.js';
export { compareStudioBlueprints } from './compareStudioBlueprints.js';
export { checkStudioBlueprintEngineCompatibility } from './checkStudioBlueprintEngineCompatibility.js';
export { createStudioBlueprintDiagnostics } from './createStudioBlueprintDiagnostics.js';
export { createStudioBlueprintFallback, STUDIO_BLUEPRINT_ENGINE_FALLBACK_SCENARIOS } from './createStudioBlueprintFallback.js';
export { createStudioHeadlessPreviewMetadata } from './createStudioHeadlessPreviewMetadata.js';
export { createStudioBlueprintEngineReadiness } from './createStudioBlueprintEngineReadiness.js';
export { createStudioBlueprintEngineNextDecision } from './createStudioBlueprintEngineNextDecision.js';

export { createStudioBlueprintEngine } from './createStudioBlueprintEngine.js';
export { default } from './createStudioBlueprintEngine.js';
