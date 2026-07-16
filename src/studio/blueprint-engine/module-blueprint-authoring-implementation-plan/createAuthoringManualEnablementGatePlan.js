import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Manual enablement gate PLAN — a future authoring runtime requires an explicit enterprise checkpoint.
 * This slice authorizes NOTHING real. Metadata only.
 * @returns {Object}
 */
export function createAuthoringManualEnablementGatePlan() {
  const core = {
    kind: 'authoring-manual-enablement-gate-plan',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'implementation_plan_only',
    authorizesAuthoringRuntime: false,
    authorizesDraftRuntime: false,
    authorizesLifecycleRuntime: false,
    authorizesOperationExecutor: false,
    authorizesRevisionEngine: false,
    authorizesValidationPipeline: false,
    authorizesInvariantEnforcement: false,
    authorizesPreviewHandoff: false,
    authorizesCertificationCandidate: false,
    authorizesAuthoringUi: false,
    authorizesEditor: false,
    authorizesPersistence: false,
    authorizesModuleGeneration: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesProductExposure: false,
    authorizesProduction: false,
    authorizesRealData: false,
  };
  return safeCloneGenericModel({ ...core, manualEnablementGatePlanDigest: authoringPlanDigest(core) });
}

export default createAuthoringManualEnablementGatePlan;
