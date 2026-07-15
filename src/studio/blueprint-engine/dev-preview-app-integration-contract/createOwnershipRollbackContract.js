import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Ownership/rollback contract — owned by the dev preview; rollback by non-consumption or flag-off;
 * no destructive rollback required. Pure and deterministic.
 * @returns {Object}
 */
export function createOwnershipRollbackContract() {
  const core = {
    kind: 'app-integration-ownership-rollback-contract',
    owner: 'studio_dev_preview',
    productOwnership: false,
    rollbackByNonConsumption: true,
    rollbackByFlagOff: true,
    destructiveRollbackRequired: false,
  };
  return safeCloneGenericModel({ ...core, ownershipRollbackDigest: appIntegrationDigest(core) });
}

export default createOwnershipRollbackContract;
