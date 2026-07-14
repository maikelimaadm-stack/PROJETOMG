import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the DATA ACCESS BLOCKED plan. Pure, metadata-only. A future runtime accesses no real
 * data: realDataRead / realDataWrite / backendAccessed / prismaAccessed / fetchUsed /
 * persistenceCreated / mutationAllowed are all `false`.
 *
 * @param {Object} [options]
 * @returns {Object} data access blocked plan
 */
export function createIsolatedRuntimeDataAccessBlockedPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-data-access-blocked-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    dataMode: 'metadata_only',
    realDataRead: false,
    realDataWrite: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    persistenceCreated: false,
    mutationAllowed: false,
    blockedNow: true,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, dataAccessBlockedDigest: planDigest(core) });
}

export default createIsolatedRuntimeDataAccessBlockedPlan;
