import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_NAME,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
  STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
} from './studioBlueprintCertificationConfig.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Builds the Studio blueprint certification manifest, aggregating every canonical
 * digest into an overallDigest. Pure. Status `certified_headless_blueprint_contract`
 * when exactSafety and no blockers.
 *
 * @param {Object} [options] the canonical parts
 * @returns {Object} manifest descriptor
 */
export function createStudioBlueprintCertificationManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    metamodelDigest: get(o.metamodel, 'canonicalMetamodelDigest'),
    blueprintContractDigest: get(o.blueprintContract, 'canonicalBlueprintContractDigest'),
    moduleBlueprintDigest: get(o.moduleBlueprint, 'canonicalModuleBlueprintDigest'),
    fieldContractDigest: get(o.fieldContract, 'canonicalFieldContractDigest'),
    screenContractDigest: get(o.screenContract, 'canonicalScreenContractDigest'),
    validationContractDigest: get(o.validationContract, 'canonicalValidationContractDigest'),
    permissionContractDigest: get(o.permissionContract, 'canonicalPermissionContractDigest'),
    routeMenuContractDigest: get(o.routeMenuContract, 'canonicalRouteMenuContractDigest'),
    persistenceBoundaryDigest: get(o.persistenceBoundary, 'canonicalPersistenceBoundaryDigest'),
    runtimeBindingDigest: get(o.runtimeBinding, 'canonicalRuntimeBindingDigest'),
    safetyInvariantsDigest: get(o.safetyInvariants, 'canonicalSafetyInvariantsDigest'),
    errorCatalogDigest: get(o.errorCatalog, 'canonicalErrorCatalogDigest'),
    compatibilityRulesDigest: get(o.compatibilityRules, 'canonicalCompatibilityRulesDigest'),
    hardeningBaselineDigest: get(o.hardeningBaseline, 'canonicalHardeningBaselineDigest'),
  };

  const exactSafety = get(o.safetyInvariants, 'exactSafety') === true;
  const baselineValid = get(o.hardeningBaseline, 'valid') === true;

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  if (!exactSafety) blockers.push('exactSafety is false');
  if (!baselineValid) blockers.push('hardening baseline regressed');

  const status = blockers.length === 0 ? 'certified_headless_blueprint_contract' : 'blocked';
  const overallDigest = certificationDigest({ ...digests, status, exactSafety });

  return safeCloneGenericModel({
    kind: 'studio-blueprint-certification-manifest',
    manifestId: `${STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME}@${STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION}#manifest`,
    certificationName: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_NAME,
    blueprintContractName: STUDIO_BLUEPRINT_CONTRACT_NAME,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    certificationVersion: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
    certificationStatus: status,
    environment: STUDIO_BLUEPRINT_CERTIFICATION_ENVIRONMENT,
    ...STUDIO_CERTIFICATION_HEADLESS_CAPABILITIES,
    ...digests,
    overallDigest,
    exactSafety,
    blockers,
    warnings,
    readiness: status,
    nextSteps: 'empresas-certified-blueprint-mirror-and-alignment-audit',
  });
}

export default createStudioBlueprintCertificationManifest;
