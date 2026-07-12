import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/**
 * The Module Blueprint contract — required fields + fail-safe defaults. Pure.
 * Nothing is registered. All dangerous flags default false.
 *
 * @param {Object} [options]
 * @returns {Object} module blueprint contract descriptor
 */
export function createStudioModuleBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const requiredFields = ['moduleId', 'version', 'modelType', 'permissions', 'persistenceBoundary'];
  const allFields = [
    'moduleId', 'displayName', 'category', 'modelFamily', 'modelType', 'version', 'status', 'fields',
    'screens', 'table', 'form', 'validations', 'relationships', 'permissions', 'routePlan', 'menuPlan',
    'persistenceBoundary', 'runtimeBinding', 'diagnostics', 'gates', 'fallback', 'compatibility',
    'migrationPolicy', 'publicationPolicy',
  ];

  const defaults = {
    productionAllowed: false,
    menuVisible: false,
    routeEnabled: false,
    mutationAllowed: false,
    backendAllowed: false,
    prismaAllowed: false,
    migrationAllowed: false,
  };

  const body = {
    kind: 'studio-module-blueprint-contract',
    requiredFields,
    allFields,
    defaults,
    rules: [
      'moduleId required', 'version required', 'modelType required',
      'required fields cannot be empty', 'permission blueprint required',
      'persistence boundary required', 'route/menu never automatic',
    ],
    permissionBlueprintRequired: true,
    persistenceBoundaryRequired: true,
    routeMenuAutomatic: false,
  };
  return safeCloneGenericModel({ ...body, moduleBlueprintDigest: createStudioContractDigest({ value: { requiredFields, defaults } }) });
}

export default createStudioModuleBlueprintContract;
