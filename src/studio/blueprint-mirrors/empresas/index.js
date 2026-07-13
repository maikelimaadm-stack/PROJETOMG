/**
 * MAK Studio — EMPRESAS CERTIFIED BLUEPRINT MIRROR & ALIGNMENT AUDIT (headless).
 *
 * This subtree mirrors the REAL Cadastro de Empresas against the certified Studio
 * blueprint contract and the Empresas certified read contract, and audits alignment.
 * It renders no UI, registers no route/menu/module, never touches backend/Prisma/
 * migration/network/production/staging, never mutates, and never rewrites Empresas.
 * Nothing here is auto-consumed by the app; it is reversible by non-consumption.
 *
 * @module studio/blueprint-mirrors/empresas
 */

export {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_SEMVER,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_MIRROR_ENVIRONMENT,
  EMPRESAS_MIRROR_SOURCE_MODULE,
  EMPRESAS_MIRROR_MODEL_TYPE,
  EMPRESAS_MIRROR_MODEL_FAMILY,
  EMPRESAS_MIRROR_MODE,
  EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
  MAK_EMPRESAS_BLUEPRINT_MIRROR_FLAG,
  MAK_EMPRESAS_BLUEPRINT_ALIGNMENT_AUDIT_FLAG,
  MAK_EMPRESAS_STUDIO_COMPATIBILITY_PLAN_FLAG,
  mirrorDigest,
  isEmpresasBlueprintMirrorEnabled,
  isEmpresasBlueprintAlignmentAuditEnabled,
} from './empresasBlueprintMirrorConfig.js';

export {
  EMPRESAS_MIRROR_ERROR_CODES,
  EmpresasBlueprintMirrorError,
  createEmpresasMirrorError,
  empresasBlueprintMirrorError,
} from './errors.js';

export { createEmpresasFieldBlueprintMirror } from './createEmpresasFieldBlueprintMirror.js';
export { createEmpresasScreenBlueprintMirror } from './createEmpresasScreenBlueprintMirror.js';
export { createEmpresasTableFormBlueprintMirror } from './createEmpresasTableFormBlueprintMirror.js';
export { createEmpresasFilterSortBlueprintMirror } from './createEmpresasFilterSortBlueprintMirror.js';
export { createEmpresasPermissionBlueprintMirror } from './createEmpresasPermissionBlueprintMirror.js';
export { createEmpresasTenantBlueprintMirror } from './createEmpresasTenantBlueprintMirror.js';
export { createEmpresasPersistenceBoundaryMirror } from './createEmpresasPersistenceBoundaryMirror.js';
export { createEmpresasRuntimeBindingMirror } from './createEmpresasRuntimeBindingMirror.js';
export { createEmpresasBlueprintAlignmentAudit } from './createEmpresasBlueprintAlignmentAudit.js';
export { createEmpresasBlueprintMirrorManifest } from './createEmpresasBlueprintMirrorManifest.js';
export { verifyEmpresasBlueprintMirror } from './verifyEmpresasBlueprintMirror.js';
export { checkEmpresasBlueprintMirrorCompatibility } from './checkEmpresasBlueprintMirrorCompatibility.js';
export { createEmpresasBlueprintMirrorDiagnostics } from './createEmpresasBlueprintMirrorDiagnostics.js';
export { createEmpresasBlueprintMirrorFallback, EMPRESAS_MIRROR_FALLBACK_SCENARIOS } from './createEmpresasBlueprintMirrorFallback.js';

export { createEmpresasCertifiedBlueprintMirror } from './createEmpresasCertifiedBlueprintMirror.js';
export { default } from './createEmpresasCertifiedBlueprintMirror.js';
