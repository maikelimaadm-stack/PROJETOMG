import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the DATA BOUNDARY contract. Pure, metadata-only. The shell's data mode is
 * `metadata_only`: no real data read, no real data write, no fetch, no backend, no Prisma, no
 * persistence.
 *
 * @param {Object} [options]
 * @returns {Object} data boundary contract
 */
export function createDevPreviewRuntimeShellDataBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'dev-preview-runtime-shell-data-boundary',
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    dataMode: 'metadata_only',
    realDataRead: false,
    realDataWrite: false,
    fetchUsed: false,
    backendAccessed: false,
    prismaAccessed: false,
    persistenceCreated: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, dataBoundaryDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellDataBoundary;
