import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Dependency injection implementation PLAN — requires explicit DI; forbids implicit/global lookup,
 * service locator, and App/router/menu imports. Pure and deterministic.
 * @returns {Object}
 */
export function createDependencyInjectionImplementationPlan() {
  const core = {
    kind: 'app-integration-dependency-injection-implementation-plan',
    dependencyInjectionRequired: true,
    implicitDependencyLookupAllowed: false,
    globalLookupAllowed: false,
    serviceLocatorAllowed: false,
    AppImportAllowed: false,
    routerImportAllowed: false,
    menuImportAllowed: false,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, dependencyInjectionImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createDependencyInjectionImplementationPlan;
