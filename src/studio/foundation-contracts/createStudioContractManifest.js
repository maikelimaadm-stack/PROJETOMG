import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';
import { STUDIO_FOUNDATION_CONTRACT_NAME, STUDIO_FOUNDATION_CONTRACT_VERSION } from './studioFoundationContractsConfig.js';

/**
 * Builds the Studio contract manifest, aggregating every sub-contract digest into an
 * overallDigest. Pure. Status `foundation_contract_ready` when no blockers.
 *
 * @param {Object} [options] the sub-contracts
 * @returns {Object} manifest descriptor
 */
export function createStudioContractManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const get = (obj, key) => (isGenericModelPlainObject(obj) ? obj[key] : undefined) ?? null;

  const digests = {
    foundationDigest: typeof o.foundationDigest === 'string' ? o.foundationDigest : null,
    metamodelDigest: get(o.metamodel, 'metamodelDigest'),
    blueprintDigest: get(o.blueprint, 'blueprintDigest'),
    moduleBlueprintDigest: get(o.moduleBlueprint, 'moduleBlueprintDigest'),
    fieldBlueprintDigest: get(o.fieldBlueprint, 'fieldBlueprintDigest'),
    screenBlueprintDigest: get(o.screenBlueprint, 'screenBlueprintDigest'),
    validationBlueprintDigest: get(o.validationBlueprint, 'validationBlueprintDigest'),
    permissionBlueprintDigest: get(o.permissionBlueprint, 'permissionBlueprintDigest'),
    routeMenuDigest: get(o.routeMenu, 'routeMenuDigest'),
    persistenceBoundaryDigest: get(o.persistenceBoundary, 'persistenceBoundaryDigest'),
    runtimeBindingDigest: get(o.runtimeBinding, 'runtimeBindingDigest'),
    safetyPolicyDigest: get(o.safetyPolicy, 'safetyPolicyDigest'),
    diagnosticsDigest: createStudioContractDigest({ value: get(o.diagnostics, 'readiness') }),
  };

  const blockers = [...(Array.isArray(o.blockers) ? o.blockers : [])];
  const warnings = [...(Array.isArray(o.warnings) ? o.warnings : [])];
  const status = blockers.length === 0 ? 'foundation_contract_ready' : 'blocked';
  const readiness = status;

  const overallDigest = createStudioContractDigest({ value: { ...digests, status } });
  return safeCloneGenericModel({
    kind: 'studio-contract-manifest',
    manifestId: `${STUDIO_FOUNDATION_CONTRACT_NAME}@${STUDIO_FOUNDATION_CONTRACT_VERSION}#manifest`,
    contractName: STUDIO_FOUNDATION_CONTRACT_NAME,
    contractVersion: STUDIO_FOUNDATION_CONTRACT_VERSION,
    ...digests,
    overallDigest,
    status,
    blockers,
    warnings,
    readiness,
  });
}

export default createStudioContractManifest;
