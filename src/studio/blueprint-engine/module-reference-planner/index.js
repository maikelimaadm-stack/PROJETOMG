/**
 * MAK Studio — BLUEPRINT MODULE REFERENCE PLANNER (headless, contract-only).
 *
 * Receives a blueprint validated by the Studio Blueprint Engine and turns it into a
 * REFERENCE PLAN for a module — identity, files, screens, fields/table/form, permissions,
 * route/menu, persistence, runtime binding, tests/gates, evidence, risks, readiness —
 * plus manifest, verifier, compatibility, diagnostics and fallback. Everything stays a
 * PLAN: it never generates a module, writes any file under `src/modules`, renders UI,
 * registers a route/menu/module, touches backend/Prisma/migration/network/production/
 * staging, mutates, persists, or rewrites Empresas. Nothing here is auto-consumed by the
 * app; it is reversible by non-consumption.
 *
 * @module studio/blueprint-engine/module-reference-planner
 */

export {
  MODULE_REFERENCE_PLANNER_NAME,
  MODULE_REFERENCE_PLANNER_SEMVER,
  MODULE_REFERENCE_PLANNER_VERSION,
  MODULE_REFERENCE_PLANNER_MODE,
  MODULE_REFERENCE_PLANNER_ENVIRONMENT,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  MODULE_PERSISTENCE_STATES,
  MODULE_READINESS_STATES,
  MODULE_REFERENCE_PLANNER_HEADLESS_CAPABILITIES,
  MAK_STUDIO_MODULE_REFERENCE_PLANNER_FLAG,
  MAK_STUDIO_MODULE_PLAN_VERIFY_FLAG,
  MAK_STUDIO_MODULE_PLAN_COMPATIBILITY_CHECK_FLAG,
  MAK_STUDIO_MODULE_PLAN_PREVIEW_READINESS_FLAG,
  plannerDigest,
  isStudioModuleReferencePlannerEnabled,
  isStudioModulePlanVerifyEnabled,
  isStudioModulePlanCompatibilityCheckEnabled,
  isStudioModulePlanPreviewReadinessEnabled,
} from './moduleReferencePlannerConfig.js';

export {
  MODULE_REFERENCE_PLANNER_ERROR_CODES,
  ModuleReferencePlannerError,
  createModuleReferencePlannerError,
  moduleReferencePlannerError,
} from './errors.js';

export { createModuleIdentityPlan } from './createModuleIdentityPlan.js';
export { createModuleFilePlan } from './createModuleFilePlan.js';
export { createModuleScreenPlan } from './createModuleScreenPlan.js';
export { createModuleFieldTableFormPlan } from './createModuleFieldTableFormPlan.js';
export { createModulePermissionPlan } from './createModulePermissionPlan.js';
export { createModuleRouteMenuPlan } from './createModuleRouteMenuPlan.js';
export { createModulePersistencePlan } from './createModulePersistencePlan.js';
export { createModuleRuntimeBindingPlan } from './createModuleRuntimeBindingPlan.js';
export { createModuleTestGatePlan } from './createModuleTestGatePlan.js';
export { createModuleEvidencePlan } from './createModuleEvidencePlan.js';
export { createModuleRiskPlan } from './createModuleRiskPlan.js';
export { createModuleReadinessDecision } from './createModuleReadinessDecision.js';
export { createModuleReferencePlannerManifest } from './createModuleReferencePlannerManifest.js';
export { verifyModuleReferencePlan } from './verifyModuleReferencePlan.js';
export { checkModuleReferencePlanCompatibility } from './checkModuleReferencePlanCompatibility.js';
export { createModuleReferencePlannerDiagnostics } from './createModuleReferencePlannerDiagnostics.js';
export { createModuleReferencePlannerFallback, MODULE_REFERENCE_PLANNER_FALLBACK_SCENARIOS } from './createModuleReferencePlannerFallback.js';

export { createStudioBlueprintModuleReferencePlanner } from './createStudioBlueprintModuleReferencePlanner.js';
export { default } from './createStudioBlueprintModuleReferencePlanner.js';
