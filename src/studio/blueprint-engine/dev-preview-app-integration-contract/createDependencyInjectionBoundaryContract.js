import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Dependency injection boundary contract — requires explicit DI; forbids implicit/global lookup,
 * service locator, and App/router/menu imports. Pure and deterministic.
 * @returns {Object}
 */
export function createDependencyInjectionBoundaryContract() {
  const core = {
    kind: 'app-integration-dependency-injection-boundary-contract',
    dependencyInjectionRequired: true,
    implicitDependencyLookupAllowed: false,
    globalLookupAllowed: false,
    serviceLocatorAllowed: false,
    AppImportAllowed: false,
    routerImportAllowed: false,
    menuImportAllowed: false,
  };
  return safeCloneGenericModel({ ...core, dependencyInjectionBoundaryDigest: appIntegrationDigest(core) });
}

export default createDependencyInjectionBoundaryContract;
