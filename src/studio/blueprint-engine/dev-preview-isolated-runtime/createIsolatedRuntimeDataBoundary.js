import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Applies the DATA BOUNDARY for the isolated runtime. Pure — synthetic metadata only: no real
 * data read/write, no backend, no Prisma, no fetch, no persistence, no mutation.
 *
 * @param {Object} [options]
 * @returns {Object} data boundary descriptor
 */
export function createIsolatedRuntimeDataBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-data-boundary',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    dataMode: 'synthetic_metadata_only',
    realDataRead: false,
    realDataWrite: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    persistenceCreated: false,
    mutationAllowed: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, dataBoundaryDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeDataBoundary;
