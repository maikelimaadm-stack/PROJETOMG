import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Safety PLAN — aggregates the forbidden-side-effect flags and asserts none is present, and that the
 * plan is reversible by non-consumption. Pure and deterministic.
 * @returns {Object}
 */
export function createAuthoringImplementationSafetyPlan() {
  const forbiddenFlags = {
    authoringRuntimeImplemented: false,
    draftRuntimeImplemented: false,
    lifecycleRuntimeImplemented: false,
    operationExecutorImplemented: false,
    revisionEngineImplemented: false,
    validationPipelineImplemented: false,
    invariantEnforcementImplemented: false,
    previewHandoffImplemented: false,
    certificationCandidateCreated: false,
    certificationPerformed: false,
    authoringUiImplemented: false,
    editorImplemented: false,
    persistenceImplemented: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
    prototypeRelinked: false,
    productExposed: false,
    menuCreated: false,
    routeCreated: false,
    appTouched: false,
    reactImported: false,
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
  };
  const anyForbiddenSideEffect = Object.values(forbiddenFlags).some((v) => v === true);

  const core = {
    kind: 'authoring-implementation-safety-plan',
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    headless: true,
    planOnly: true,
    forbiddenFlags,
    forbiddenFlagCount: Object.keys(forbiddenFlags).length,
  };
  return safeCloneGenericModel({ ...core, safetyPlanDigest: authoringPlanDigest(core) });
}

export default createAuthoringImplementationSafetyPlan;
