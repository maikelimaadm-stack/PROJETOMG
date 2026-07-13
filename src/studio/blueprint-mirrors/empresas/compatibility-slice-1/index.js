/**
 * MAK Studio — EMPRESAS STUDIO COMPATIBILITY SLICE 1 — CONTRACT-ONLY ALIGNMENT (headless).
 *
 * This subtree turns the Empresas blueprint mirror gaps into formal compatibility
 * contracts and alignment plans (gap registry, detail/state plans, write capability
 * matrix, persistence boundary bridge, backend/Prisma readiness map, preferences/layout
 * plan) plus a manifest, verifier, compatibility checker, diagnostics and fallback.
 * It never changes Empresas, renders no UI, registers no route/menu/module, and never
 * touches backend/Prisma/migration/network/production/staging or mutates. Nothing here
 * is auto-consumed by the app; it is reversible by non-consumption.
 *
 * @module studio/blueprint-mirrors/empresas/compatibility-slice-1
 */

export {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME,
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_SEMVER,
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_COMPAT_ENVIRONMENT,
  EMPRESAS_COMPAT_MODULE_ID,
  EMPRESAS_COMPAT_MODEL_TYPE,
  EMPRESAS_COMPAT_MODEL_FAMILY,
  EMPRESAS_COMPAT_MODE,
  EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
  MAK_EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_FLAG,
  MAK_EMPRESAS_GAP_REGISTRY_FLAG,
  MAK_EMPRESAS_PERSISTENCE_ALIGNMENT_BRIDGE_FLAG,
  MAK_EMPRESAS_FUTURE_ALIGNMENT_PLAN_FLAG,
  compatDigest,
  isEmpresasStudioCompatibilitySlice1Enabled,
  isEmpresasGapRegistryEnabled,
} from './empresasStudioCompatibilitySlice1Config.js';

export {
  EMPRESAS_COMPAT_SLICE1_ERROR_CODES,
  EmpresasCompatSlice1Error,
  createEmpresasCompatSlice1Error,
  empresasCompatSlice1Error,
} from './errors.js';

export { createEmpresasCompatibilityGapRegistry } from './createEmpresasCompatibilityGapRegistry.js';
export { createEmpresasDetailScreenAlignmentPlan } from './createEmpresasDetailScreenAlignmentPlan.js';
export { createEmpresasStateCoverageAlignmentPlan } from './createEmpresasStateCoverageAlignmentPlan.js';
export { createEmpresasWriteCapabilityReferenceMatrix } from './createEmpresasWriteCapabilityReferenceMatrix.js';
export { createEmpresasPersistenceBoundaryAlignmentBridge } from './createEmpresasPersistenceBoundaryAlignmentBridge.js';
export { createEmpresasBackendPrismaReadinessMap } from './createEmpresasBackendPrismaReadinessMap.js';
export { createEmpresasPreferenceLayoutAlignmentPlan } from './createEmpresasPreferenceLayoutAlignmentPlan.js';
export { createEmpresasCompatibilitySlice1Manifest } from './createEmpresasCompatibilitySlice1Manifest.js';
export { verifyEmpresasStudioCompatibilitySlice1 } from './verifyEmpresasStudioCompatibilitySlice1.js';
export { checkEmpresasStudioCompatibilitySlice1 } from './checkEmpresasStudioCompatibilitySlice1.js';
export { createEmpresasCompatibilitySlice1Diagnostics } from './createEmpresasCompatibilitySlice1Diagnostics.js';
export { createEmpresasCompatibilitySlice1Fallback, EMPRESAS_COMPAT_SLICE1_FALLBACK_SCENARIOS } from './createEmpresasCompatibilitySlice1Fallback.js';

export { createEmpresasStudioCompatibilitySlice1 } from './createEmpresasStudioCompatibilitySlice1.js';
export { default } from './createEmpresasStudioCompatibilitySlice1.js';
