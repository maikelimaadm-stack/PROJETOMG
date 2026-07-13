import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import {
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME,
  EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
  EMPRESAS_MIRROR_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  EMPRESAS_READ_CONTRACT_VERSION,
  EMPRESAS_COMPAT_MODULE_ID,
  EMPRESAS_COMPAT_MODEL_TYPE,
  EMPRESAS_COMPAT_MODEL_FAMILY,
  EMPRESAS_COMPAT_MODE,
  EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
} from './empresasStudioCompatibilitySlice1Config.js';
import { createEmpresasCompatibilityGapRegistry } from './createEmpresasCompatibilityGapRegistry.js';
import { createEmpresasDetailScreenAlignmentPlan } from './createEmpresasDetailScreenAlignmentPlan.js';
import { createEmpresasStateCoverageAlignmentPlan } from './createEmpresasStateCoverageAlignmentPlan.js';
import { createEmpresasWriteCapabilityReferenceMatrix } from './createEmpresasWriteCapabilityReferenceMatrix.js';
import { createEmpresasPersistenceBoundaryAlignmentBridge } from './createEmpresasPersistenceBoundaryAlignmentBridge.js';
import { createEmpresasBackendPrismaReadinessMap } from './createEmpresasBackendPrismaReadinessMap.js';
import { createEmpresasPreferenceLayoutAlignmentPlan } from './createEmpresasPreferenceLayoutAlignmentPlan.js';
import { createEmpresasCompatibilitySlice1Manifest } from './createEmpresasCompatibilitySlice1Manifest.js';
import { verifyEmpresasStudioCompatibilitySlice1 } from './verifyEmpresasStudioCompatibilitySlice1.js';
import { checkEmpresasStudioCompatibilitySlice1 } from './checkEmpresasStudioCompatibilitySlice1.js';
import { createEmpresasCompatibilitySlice1Diagnostics } from './createEmpresasCompatibilitySlice1Diagnostics.js';

/**
 * Root composer for EMPRESAS STUDIO COMPATIBILITY SLICE 1 — CONTRACT-ONLY ALIGNMENT.
 * Turns the Empresas blueprint mirror gaps into formal contracts and alignment plans.
 * Pure, headless, contract-only. Never changes Empresas, renders UI, registers a
 * route/menu/module, touches backend/Prisma/migration/network/production/staging, or
 * mutates.
 *
 * @param {Object} [options]
 * @returns {Object} the full compatibility slice 1 package
 */
export function createEmpresasStudioCompatibilitySlice1(options = {}) {
  void options;

  const gapRegistry = createEmpresasCompatibilityGapRegistry();
  const detailScreenAlignmentPlan = createEmpresasDetailScreenAlignmentPlan();
  const stateCoverageAlignmentPlan = createEmpresasStateCoverageAlignmentPlan();
  const writeCapabilityReferenceMatrix = createEmpresasWriteCapabilityReferenceMatrix();
  const persistenceBoundaryAlignmentBridge = createEmpresasPersistenceBoundaryAlignmentBridge();
  const backendPrismaReadinessMap = createEmpresasBackendPrismaReadinessMap();
  const preferenceLayoutAlignmentPlan = createEmpresasPreferenceLayoutAlignmentPlan();

  const blockers = [];
  const warnings = [];
  if (gapRegistry.untrackedCriticalGaps > 0) blockers.push('untracked critical gap');
  if (gapRegistry.anyGapFixedByChangingEmpresas === true) blockers.push('gap fixed by changing Empresas');

  const manifest = createEmpresasCompatibilitySlice1Manifest({
    gapRegistry,
    detailPlan: detailScreenAlignmentPlan,
    stateCoverage: stateCoverageAlignmentPlan,
    writeCapability: writeCapabilityReferenceMatrix,
    persistenceBridge: persistenceBoundaryAlignmentBridge,
    backendPrismaReadiness: backendPrismaReadinessMap,
    preferenceLayout: preferenceLayoutAlignmentPlan,
    blockers,
    warnings,
  });

  const diagnostics = createEmpresasCompatibilitySlice1Diagnostics({
    gapRegistryStatus: gapRegistry.knownGapsTracked ? 'tracked' : 'incomplete',
    detailPlanStatus: detailScreenAlignmentPlan.alignmentStatus,
    stateCoverageStatus: stateCoverageAlignmentPlan.alignmentStatus,
    writeCapabilityStatus: writeCapabilityReferenceMatrix.alignmentStatus,
    persistenceBridgeStatus: persistenceBoundaryAlignmentBridge.alignmentStatus,
    backendPrismaReadinessStatus: backendPrismaReadinessMap.alignmentStatus,
    preferenceLayoutStatus: preferenceLayoutAlignmentPlan.alignmentStatus,
    compatibilityStatus: 'pending',
    blockers,
    warnings,
  });

  const readiness = blockers.length === 0 ? 'compatibility_slice_1_complete' : 'blocked';

  const slice = safeCloneGenericModel({
    kind: 'empresas-studio-compatibility-slice-1',
    sliceName: EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_NAME,
    sliceVersion: EMPRESAS_STUDIO_COMPATIBILITY_SLICE_1_VERSION,
    mirrorVersion: EMPRESAS_MIRROR_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    empresasReadContractVersion: EMPRESAS_READ_CONTRACT_VERSION,
    moduleId: EMPRESAS_COMPAT_MODULE_ID,
    modelType: EMPRESAS_COMPAT_MODEL_TYPE,
    modelFamily: EMPRESAS_COMPAT_MODEL_FAMILY,
    mode: EMPRESAS_COMPAT_MODE,
    ...EMPRESAS_COMPAT_HEADLESS_CAPABILITIES,
    gapRegistry,
    detailScreenAlignmentPlan,
    stateCoverageAlignmentPlan,
    writeCapabilityReferenceMatrix,
    persistenceBoundaryAlignmentBridge,
    backendPrismaReadinessMap,
    preferenceLayoutAlignmentPlan,
    manifest,
    diagnostics,
    knownGapsTracked: gapRegistry.knownGapsTracked,
    untrackedCriticalGaps: gapRegistry.untrackedCriticalGaps,
    blockers,
    warnings,
    readiness,
  });

  const verification = verifyEmpresasStudioCompatibilitySlice1({ slice });
  const compatibility = checkEmpresasStudioCompatibilitySlice1({ slice });

  return safeCloneGenericModel({
    ...slice,
    verification,
    verifierResult: verification,
    compatibilityResult: compatibility,
    compatibilityStatus: compatibility.status,
    safeToUseAsCompatibilityReference: verification.safeToUseAsCompatibilityReference,
    nextAllowedStage: compatibility.recommendedNextStep,
  });
}

export default createEmpresasStudioCompatibilitySlice1;
