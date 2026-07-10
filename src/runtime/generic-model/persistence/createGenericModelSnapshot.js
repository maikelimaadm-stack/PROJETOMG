import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { sanitizeGenericModelPayload } from '../safety/sanitizeGenericModelPayload.js';
import { createGenericModelVersion } from '../versioning/createGenericModelVersion.js';
import { createGenericModelChecksum } from '../versioning/createGenericModelChecksum.js';
import { createGenericModelError } from '../errors/createGenericModelError.js';
import { GENERIC_MODEL_SCHEMA_VERSION } from '../contracts/genericModelContractConstants.js';

export const GENERIC_MODEL_SNAPSHOT_SOURCE = 'generic-model-local';

/**
 * Serializes generic model DATA into a PLAIN, SAFE snapshot. Sanitizes the data
 * (drops functions/React, masks sensitive, strips pollution), stamps version/
 * schemaVersion/source/localOnly/persistenceReal, and computes a deterministic
 * checksum. Pure; never mutates the input; never persists. Returns either a
 * snapshot or a structured error object (`kind: 'generic-model-error'`).
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {string} [options.modelType]
 * @param {unknown} [options.data]
 * @param {number} [options.draftVersion]
 * @param {() => string} [options.clock]
 * @returns {Object} snapshot or error
 */
export function createGenericModelSnapshot(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const modelId = typeof o.modelId === 'string' ? o.modelId : 'generic-model';
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';

  const sanitized = sanitizeGenericModelPayload({ payload: o.data, label: 'snapshot data' });
  if (!sanitized.safe) {
    return createGenericModelError({
      code: 'GM-RUNTIME-001',
      message: 'cannot snapshot unsafe data',
      moduleId,
      modelId,
      operation: 'createSnapshot',
      details: { unsafeMarkers: sanitized.unsafeMarkers, blockers: sanitized.blockers },
    });
  }

  const version = createGenericModelVersion({ modelId, moduleId, draftVersion: o.draftVersion, clock: o.clock });
  const content = {
    modelId,
    moduleId,
    modelType: typeof o.modelType === 'string' ? o.modelType : null,
    version: version.versionId,
    schemaVersion: GENERIC_MODEL_SCHEMA_VERSION,
    source: GENERIC_MODEL_SNAPSHOT_SOURCE,
    localOnly: true,
    persistenceReal: false,
    data: sanitized.sanitized ?? null,
  };
  const checksum = createGenericModelChecksum({ value: content });

  return safeCloneGenericModel({
    kind: 'generic-model-snapshot',
    snapshotId: `gms-${modelId}-${moduleId}-${version.schemaVersion}-${version.draftVersion}-${checksum}`,
    ...content,
    metadata: {
      createdAt: version.createdAt,
      origin: 'createGenericModelSnapshot',
      draftVersion: version.draftVersion,
      maskedKeys: sanitized.maskedKeys,
    },
    diagnostics: {
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistenceReal: false,
      masked: sanitized.maskedKeys.length > 0,
    },
    checksum,
  });
}

export default createGenericModelSnapshot;
