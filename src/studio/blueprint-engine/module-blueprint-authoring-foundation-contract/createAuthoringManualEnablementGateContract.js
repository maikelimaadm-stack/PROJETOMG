import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Manual enablement gate contract — a future authoring runtime/UI/editor requires an explicit
 * enterprise checkpoint before any real authoring can occur. This slice authorizes NOTHING real: no
 * runtime, no UI, no editor, no persistence, no module generation, no certification, no product
 * exposure. Pure and deterministic.
 * @returns {Object}
 */
export function createAuthoringManualEnablementGateContract() {
  const core = {
    kind: 'authoring-manual-enablement-gate-contract',
    manualGateRequired: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    currentSliceAuthorization: 'foundation_contract_only',
    authorizesAuthoringRuntime: false,
    authorizesAuthoringUi: false,
    authorizesEditor: false,
    authorizesPersistence: false,
    authorizesModuleGeneration: false,
    authorizesFileWrites: false,
    authorizesModuleRegistration: false,
    authorizesCertification: false,
    authorizesPublish: false,
    authorizesBackend: false,
    authorizesPrisma: false,
    authorizesProductExposure: false,
    authorizesProduction: false,
    authorizesRealData: false,
    authorizesMenuOrRoute: false,
  };
  return safeCloneGenericModel({ ...core, manualEnablementGateDigest: authoringFoundationDigest(core) });
}

export default createAuthoringManualEnablementGateContract;
