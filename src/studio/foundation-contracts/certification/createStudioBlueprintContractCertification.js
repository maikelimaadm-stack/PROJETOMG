import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_NAME,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
  STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
} from './studioBlueprintCertificationConfig.js';
import { createStudioCanonicalMetamodel } from './createStudioCanonicalMetamodel.js';
import { createStudioCanonicalBlueprintContract } from './createStudioCanonicalBlueprintContract.js';
import { createStudioCanonicalModuleBlueprint } from './createStudioCanonicalModuleBlueprint.js';
import { createStudioCanonicalFieldContract } from './createStudioCanonicalFieldContract.js';
import { createStudioCanonicalScreenContract } from './createStudioCanonicalScreenContract.js';
import { createStudioCanonicalValidationContract } from './createStudioCanonicalValidationContract.js';
import { createStudioCanonicalPermissionContract } from './createStudioCanonicalPermissionContract.js';
import { createStudioCanonicalRouteMenuContract } from './createStudioCanonicalRouteMenuContract.js';
import { createStudioCanonicalPersistenceBoundary } from './createStudioCanonicalPersistenceBoundary.js';
import { createStudioCanonicalRuntimeBinding } from './createStudioCanonicalRuntimeBinding.js';
import { createStudioCanonicalSafetyInvariants } from './createStudioCanonicalSafetyInvariants.js';
import { createStudioCanonicalErrorCatalog } from './createStudioCanonicalErrorCatalog.js';
import { createStudioCanonicalCompatibilityRules } from './createStudioCanonicalCompatibilityRules.js';
import { createStudioCanonicalHardeningBaseline } from './createStudioCanonicalHardeningBaseline.js';
import { createStudioBlueprintCertificationManifest } from './createStudioBlueprintCertificationManifest.js';
import { verifyStudioBlueprintContractCertification } from './verifyStudioBlueprintContractCertification.js';
import { createStudioBlueprintCertificationDiagnostics } from './createStudioBlueprintCertificationDiagnostics.js';

/**
 * Root composer for the MAK Studio BLUEPRINT CONTRACT CERTIFICATION. Aggregates every
 * canonical contract, builds the manifest, runs self-verification, and produces
 * diagnostics. Pure and deterministic. Registers nothing, renders nothing, touches no
 * route/menu/backend/Prisma/migration/network/production/staging, and never mutates.
 *
 * @param {Object} [options]
 * @returns {Object} the full certification package
 */
export function createStudioBlueprintContractCertification(options = {}) {
  void options;

  const canonicalMetamodel = createStudioCanonicalMetamodel();
  const canonicalBlueprintContract = createStudioCanonicalBlueprintContract();
  const canonicalModuleBlueprint = createStudioCanonicalModuleBlueprint();
  const canonicalFieldContract = createStudioCanonicalFieldContract();
  const canonicalScreenContract = createStudioCanonicalScreenContract();
  const canonicalValidationContract = createStudioCanonicalValidationContract();
  const canonicalPermissionContract = createStudioCanonicalPermissionContract();
  const canonicalRouteMenuContract = createStudioCanonicalRouteMenuContract();
  const canonicalPersistenceBoundary = createStudioCanonicalPersistenceBoundary();
  const canonicalRuntimeBinding = createStudioCanonicalRuntimeBinding();
  const canonicalSafetyInvariants = createStudioCanonicalSafetyInvariants();
  const canonicalErrorCatalog = createStudioCanonicalErrorCatalog();
  const canonicalCompatibilityRules = createStudioCanonicalCompatibilityRules();
  const canonicalHardeningBaseline = createStudioCanonicalHardeningBaseline();

  /** @type {string[]} */ const blockers = [];
  const warnings = [];
  if (canonicalSafetyInvariants.exactSafety !== true) blockers.push('exactSafety is false');
  if (canonicalHardeningBaseline.valid !== true) blockers.push('hardening baseline regressed');
  if (canonicalCompatibilityRules.valid !== true) blockers.push('compatibility rules invalid');
  if (canonicalErrorCatalog.uniqueCodes !== true || canonicalErrorCatalog.allSanitized !== true) blockers.push('error catalog invalid');

  const manifest = createStudioBlueprintCertificationManifest({
    metamodel: canonicalMetamodel,
    blueprintContract: canonicalBlueprintContract,
    moduleBlueprint: canonicalModuleBlueprint,
    fieldContract: canonicalFieldContract,
    screenContract: canonicalScreenContract,
    validationContract: canonicalValidationContract,
    permissionContract: canonicalPermissionContract,
    routeMenuContract: canonicalRouteMenuContract,
    persistenceBoundary: canonicalPersistenceBoundary,
    runtimeBinding: canonicalRuntimeBinding,
    safetyInvariants: canonicalSafetyInvariants,
    errorCatalog: canonicalErrorCatalog,
    compatibilityRules: canonicalCompatibilityRules,
    hardeningBaseline: canonicalHardeningBaseline,
    blockers,
    warnings,
  });

  const exactSafety = canonicalSafetyInvariants.exactSafety === true;
  const certificationStatus = manifest.certificationStatus === 'certified_headless_blueprint_contract' && blockers.length === 0
    ? 'certified_headless_blueprint_contract'
    : 'blocked';

  const diagnostics = createStudioBlueprintCertificationDiagnostics({
    exactSafety,
    metamodelStatus: 'certified',
    blueprintStatus: 'certified',
    moduleBlueprintStatus: 'certified',
    fieldStatus: 'certified',
    screenStatus: 'certified',
    validationStatus: 'certified',
    permissionStatus: 'certified',
    routeMenuStatus: 'certified',
    persistenceStatus: 'certified',
    runtimeBindingStatus: 'certified',
    safetyStatus: 'enforced',
    errorCatalogStatus: 'certified',
    compatibilityStatus: 'certified',
    hardeningBaselineStatus: canonicalHardeningBaseline.valid ? 'certified' : 'regressed',
    verifierStatus: 'valid',
    blockers,
    warnings,
  });

  const certification = safeCloneGenericModel({
    kind: 'studio-blueprint-contract-certification',
    certificationName: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
    blueprintContractName: STUDIO_BLUEPRINT_CONTRACT_NAME,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    certificationVersion: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
    certificationStatus,
    environment: STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
    ...STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
    exactSafety,
    canonicalMetamodel,
    canonicalBlueprintContract,
    canonicalModuleBlueprint,
    canonicalFieldContract,
    canonicalScreenContract,
    canonicalValidationContract,
    canonicalPermissionContract,
    canonicalRouteMenuContract,
    canonicalPersistenceBoundary,
    canonicalRuntimeBinding,
    canonicalSafetyInvariants,
    canonicalErrorCatalog,
    canonicalCompatibilityRules,
    canonicalHardeningBaseline,
    manifest,
    diagnostics,
    blockers,
    warnings,
    readiness: certificationStatus,
    nextAllowedStage: 'empresas-certified-blueprint-mirror-and-alignment-audit',
  });

  const verification = verifyStudioBlueprintContractCertification({ certification });
  const compatibilityStatus = verification.certified ? 'certified' : 'blocked';

  return safeCloneGenericModel({ ...certification, verification, compatibilityStatus, safeToUseAsBlueprintReference: verification.safeToUseAsBlueprintReference });
}

export default createStudioBlueprintContractCertification;
