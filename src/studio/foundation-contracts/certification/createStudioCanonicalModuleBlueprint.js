import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioModuleBlueprintContract } from '../createStudioModuleBlueprintContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical module blueprint. Pure. Permission + persistence required;
 * every dangerous default is false.
 *
 * @param {Object} [options]
 * @returns {Object} canonical module blueprint
 */
export function createStudioCanonicalModuleBlueprint(options = {}) {
  void options;
  const base = createStudioModuleBlueprintContract();

  const requiredFields = ['moduleId', 'version', 'modelType', 'permissions', 'persistenceBoundary'];
  const allFields = [...base.allFields];
  const defaults = {
    productionAllowed: false,
    menuVisible: false,
    routeEnabled: false,
    mutationAllowed: false,
    backendAllowed: false,
    prismaAllowed: false,
    migrationAllowed: false,
    generatedModuleAllowed: false,
    marketplaceEnabled: false,
  };

  const body = {
    kind: 'studio-canonical-module-blueprint',
    requiredFields,
    allFields,
    defaults,
    permissionBlueprintRequired: true,
    persistenceBoundaryRequired: true,
    routeMenuAutomatic: false,
  };
  return safeCloneGenericModel({ ...body, canonicalModuleBlueprintDigest: certificationDigest({ requiredFields, defaults }) });
}

export default createStudioCanonicalModuleBlueprint;
