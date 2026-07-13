import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_MIRROR_SOURCE_MODULE,
  EMPRESAS_MIRROR_MODEL_TYPE,
  EMPRESAS_MIRROR_MODEL_FAMILY,
  EMPRESAS_MIRROR_MODE,
  EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
} from './empresasBlueprintMirrorConfig.js';
import { createStudioCanonicalModuleBlueprint } from '../../foundation-contracts/certification/createStudioCanonicalModuleBlueprint.js';
import { createEmpresasFieldBlueprintMirror } from './createEmpresasFieldBlueprintMirror.js';
import { createEmpresasScreenBlueprintMirror } from './createEmpresasScreenBlueprintMirror.js';
import { createEmpresasTableFormBlueprintMirror } from './createEmpresasTableFormBlueprintMirror.js';
import { createEmpresasFilterSortBlueprintMirror } from './createEmpresasFilterSortBlueprintMirror.js';
import { createEmpresasPermissionBlueprintMirror } from './createEmpresasPermissionBlueprintMirror.js';
import { createEmpresasTenantBlueprintMirror } from './createEmpresasTenantBlueprintMirror.js';
import { createEmpresasPersistenceBoundaryMirror } from './createEmpresasPersistenceBoundaryMirror.js';
import { createEmpresasRuntimeBindingMirror } from './createEmpresasRuntimeBindingMirror.js';
import { createEmpresasBlueprintAlignmentAudit } from './createEmpresasBlueprintAlignmentAudit.js';
import { createEmpresasBlueprintMirrorManifest } from './createEmpresasBlueprintMirrorManifest.js';
import { verifyEmpresasBlueprintMirror } from './verifyEmpresasBlueprintMirror.js';
import { checkEmpresasBlueprintMirrorCompatibility } from './checkEmpresasBlueprintMirrorCompatibility.js';
import { createEmpresasBlueprintMirrorDiagnostics } from './createEmpresasBlueprintMirrorDiagnostics.js';

/**
 * Root composer for the EMPRESAS CERTIFIED BLUEPRINT MIRROR & ALIGNMENT AUDIT. Mirrors
 * the REAL Cadastro de Empresas onto the certified Studio blueprint contract and
 * audits alignment. Pure, headless, audit/mirror-only. Never rewrites Empresas, renders
 * UI, registers a route/menu/module, touches backend/Prisma/migration/network/
 * production/staging, or mutates.
 *
 * @param {Object} [options]
 * @returns {Object} the full mirror + alignment audit package
 */
export function createEmpresasCertifiedBlueprintMirror(options = {}) {
  void options;

  const moduleBlueprint = createStudioCanonicalModuleBlueprint();
  const fieldBlueprint = createEmpresasFieldBlueprintMirror();
  const screenBlueprint = createEmpresasScreenBlueprintMirror();
  const tableFormBlueprint = createEmpresasTableFormBlueprintMirror();
  const filterSortBlueprint = createEmpresasFilterSortBlueprintMirror();
  const permissionBlueprint = createEmpresasPermissionBlueprintMirror();
  const tenantBlueprint = createEmpresasTenantBlueprintMirror();
  const persistenceBoundary = createEmpresasPersistenceBoundaryMirror();
  const runtimeBinding = createEmpresasRuntimeBindingMirror();

  const alignmentAudit = createEmpresasBlueprintAlignmentAudit({
    fieldBlueprint, screenBlueprint, tableFormBlueprint, filterSortBlueprint,
    permissionBlueprint, tenantBlueprint, persistenceBoundary, runtimeBinding,
  });

  const blockers = [];
  const warnings = [];

  const manifest = createEmpresasBlueprintMirrorManifest({
    fieldBlueprint, screenBlueprint, tableFormBlueprint, filterSortBlueprint,
    permissionBlueprint, tenantBlueprint, persistenceBoundary, runtimeBinding, alignmentAudit,
    blockers, warnings,
  });

  const diagnostics = createEmpresasBlueprintMirrorDiagnostics({
    fieldStatus: fieldBlueprint.alignmentStatus,
    screenStatus: screenBlueprint.alignmentStatus,
    tableFormStatus: tableFormBlueprint.alignmentStatus,
    filterSortStatus: filterSortBlueprint.alignmentStatus,
    permissionStatus: permissionBlueprint.alignmentStatus,
    tenantStatus: tenantBlueprint.alignmentStatus,
    persistenceStatus: persistenceBoundary.alignmentStatus,
    runtimeBindingStatus: runtimeBinding.alignmentStatus,
    alignmentStatus: alignmentAudit.overallAlignment,
    compatibilityStatus: 'pending',
    blockers,
    warnings,
  });

  const readiness = blockers.length === 0 ? 'blueprint_mirror_created' : 'alignment_blocked';

  const mirror = safeCloneGenericModel({
    kind: 'empresas-certified-blueprint-mirror',
    mirrorName: EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_NAME,
    mirrorVersion: EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    empresasReadContractVersion: EMPRESAS_READ_CONTRACT_VERSION,
    moduleId: EMPRESAS_MIRROR_SOURCE_MODULE,
    modelType: EMPRESAS_MIRROR_MODEL_TYPE,
    modelFamily: EMPRESAS_MIRROR_MODEL_FAMILY,
    source: 'Empresas certified contract + current Empresas module inspection',
    mode: EMPRESAS_MIRROR_MODE,
    ...EMPRESAS_MIRROR_HEADLESS_CAPABILITIES,
    moduleBlueprint,
    fieldBlueprint,
    screenBlueprint,
    tableFormBlueprint,
    filterSortBlueprint,
    permissionBlueprint,
    tenantBlueprint,
    persistenceBoundary,
    runtimeBinding,
    alignmentAudit,
    manifest,
    diagnostics,
    blockers,
    warnings,
    readiness,
    nextAllowedStage: alignmentAudit.gapCount > 0 ? 'empresas-studio-compatibility-slice-1' : 'studio-blueprint-engine-foundation',
  });

  const verification = verifyEmpresasBlueprintMirror({ mirror });
  const compatibility = checkEmpresasBlueprintMirrorCompatibility({ mirror });

  return safeCloneGenericModel({
    ...mirror,
    verification,
    verifierResult: verification,
    compatibilityStatus: compatibility.compatibilityStatus,
    compatibility,
    safeToUseAsMirrorReference: verification.safeToUseAsMirrorReference,
  });
}

export default createEmpresasCertifiedBlueprintMirror;
