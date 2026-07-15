import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG, appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Dev-only feature flag contract — metadata for a future flag that would gate the isolated host in
 * the App. It defines NO real flag connected to the App; default is disabled; production/staging are
 * denied. Pure and deterministic.
 * @returns {Object}
 */
export function createDevOnlyFeatureFlagContract() {
  const core = {
    kind: 'app-integration-dev-only-feature-flag-contract',
    flagNameMetadata: MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG,
    defaultEnabled: false,
    devOnly: true,
    productionAllowed: false,
    stagingAllowed: false,
    connectedToApp: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, featureFlagDigest: appIntegrationDigest(core) });
}

export default createDevOnlyFeatureFlagContract;
