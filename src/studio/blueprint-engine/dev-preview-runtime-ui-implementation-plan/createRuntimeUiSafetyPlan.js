import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans the safety policy. Every forbidden flag stays false; reversible by non-consumption. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiSafetyPlan() {
  const forbiddenFlags = {
    runtimeUiImplemented: false,
    visualRuntimeImplemented: false,
    reactComponentCreated: false,
    jsxCreated: false,
    tsxCreated: false,
    domCreated: false,
    cssCreated: false,
    routeCreated: false,
    menuCreated: false,
    moduleGenerated: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    persistenceCreated: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
  };
  const core = {
    kind: 'runtime-ui-safety-plan',
    headless: true,
    contractOnly: true,
    planOnly: true,
    failClosed: true,
    runtimeUiImplemented: false,
    visualRuntimeImplemented: false,
    anyForbiddenSideEffect: Object.values(forbiddenFlags).some((v) => v === true),
    reversibleByNonConsumption: true,
    forbiddenFlags,
  };
  return safeCloneGenericModel({ ...core, safetyPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiSafetyPlan;
