import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { GENERIC_MODEL_SCHEMA_VERSION } from '../contracts/genericModelContractConstants.js';

/** Stable, injectable default timestamp — never `Date.now()` (determinism). */
export const GENERIC_MODEL_DEFAULT_CREATED_AT = '1970-01-01T00:00:00.000Z';

/**
 * Builds a deterministic, comparable Generic Model VERSION descriptor. No random
 * UUID, no `Date.now()` — the timestamp comes from an injected `clock()`
 * (defaulting to a fixed constant). Pure and side-effect-free.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {number} [options.schemaVersion]
 * @param {number} [options.draftVersion]
 * @param {string|null} [options.parentVersionId]
 * @param {() => string} [options.clock]
 * @param {string} [options.source]
 * @returns {Object}
 */
export function createGenericModelVersion(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const modelId = typeof o.modelId === 'string' ? o.modelId : 'generic-model';
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const schemaVersion = Number.isFinite(o.schemaVersion) ? Number(o.schemaVersion) : GENERIC_MODEL_SCHEMA_VERSION;
  const draftVersion = Number.isFinite(o.draftVersion) ? Number(o.draftVersion) : 1;
  const createdAt = typeof o.clock === 'function' ? String(o.clock()) : GENERIC_MODEL_DEFAULT_CREATED_AT;

  return {
    versionId: `gmv-${modelId}-${moduleId}-${schemaVersion}-${draftVersion}`,
    modelId,
    moduleId,
    schemaVersion,
    draftVersion,
    parentVersionId: typeof o.parentVersionId === 'string' ? o.parentVersionId : null,
    createdAt,
    source: typeof o.source === 'string' ? o.source : 'generic-model-local',
    localOnly: true,
  };
}

export default createGenericModelVersion;
