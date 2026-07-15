import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Production/staging denial contract — production and staging denied; default off; fail-closed.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createProductionStagingDenialContract() {
  const core = {
    kind: 'app-integration-production-staging-denial-contract',
    productionDenied: true,
    stagingDenied: true,
    defaultOff: true,
    failClosed: true,
  };
  return safeCloneGenericModel({ ...core, productionStagingDenialDigest: appIntegrationDigest(core) });
}

export default createProductionStagingDenialContract;
