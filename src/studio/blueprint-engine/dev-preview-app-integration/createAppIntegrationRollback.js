import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_DEV_PREVIEW_ROUTE_FLAG, appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Describes how the integration is rolled back. Two independent, non-destructive paths: turning the
 * dev-only flag off (immediate), and removing the single additive App block (structural). No
 * destructive rollback is ever required. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationRollback() {
  const core = {
    kind: 'app-integration-rollback',
    rollbackByFlagOff: true,
    rollbackByRemovingAdditiveBlock: true,
    flagName: STUDIO_DEV_PREVIEW_ROUTE_FLAG,
    destructiveRollbackRequired: false,
    dataMigrationRequired: false,
    additiveBlockOnly: true,
    reversibleByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, rollbackDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationRollback;
