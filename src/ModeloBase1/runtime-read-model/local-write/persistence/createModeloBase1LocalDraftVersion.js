import { isPlainObject } from '../../safety.js';

/** Current snapshot schema version for ModeloBase1 local drafts. */
export const MODELOBASE1_LOCAL_DRAFT_SCHEMA_VERSION = 1;

/** A stable, injectable default timestamp — never `Date.now()` (determinism). */
export const DEFAULT_LOCAL_DRAFT_CREATED_AT = '1970-01-01T00:00:00.000Z';

/**
 * Builds a deterministic, comparable version descriptor for a ModeloBase1 local
 * draft. No random UUID, no `Date.now()` — the timestamp comes from an injected
 * `clock()` (defaulting to a fixed constant) so snapshots are reproducible in
 * tests. Pure and side-effect-free.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {number} [options.schemaVersion]
 * @param {number} [options.draftVersion]
 * @param {string|null} [options.parentVersionId]
 * @param {() => string} [options.clock] Injectable clock returning an ISO string.
 * @param {string} [options.source]
 * @param {string} [options.notes]
 * @returns {Object}
 */
export function createModeloBase1LocalDraftVersion(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const schemaVersion = Number.isFinite(o.schemaVersion) ? Number(o.schemaVersion) : MODELOBASE1_LOCAL_DRAFT_SCHEMA_VERSION;
  const draftVersion = Number.isFinite(o.draftVersion) ? Number(o.draftVersion) : 1;
  const parentVersionId = typeof o.parentVersionId === 'string' ? o.parentVersionId : null;
  const createdAt = typeof o.clock === 'function' ? String(o.clock()) : DEFAULT_LOCAL_DRAFT_CREATED_AT;
  const source = typeof o.source === 'string' ? o.source : 'modeloBase1-local-write';

  return {
    versionId: `v-${moduleId}-${schemaVersion}-${draftVersion}`,
    moduleId,
    schemaVersion,
    draftVersion,
    parentVersionId,
    createdAt,
    source,
    localOnly: true,
    notes: typeof o.notes === 'string' ? o.notes : null,
  };
}

/**
 * Compares two draft versions. Returns a plain, deterministic comparison.
 * @param {Object} a
 * @param {Object} b
 * @returns {{ same: boolean, sameModule: boolean, ordered: number }}
 */
export function compareModeloBase1LocalDraftVersion(a, b) {
  const va = isPlainObject(a) ? a : {};
  const vb = isPlainObject(b) ? b : {};
  const sameModule = va.moduleId === vb.moduleId;
  const same = va.versionId === vb.versionId;
  const na = Number(va.draftVersion) || 0;
  const nb = Number(vb.draftVersion) || 0;
  return { same, sameModule, ordered: na === nb ? 0 : (na < nb ? -1 : 1) };
}

export default createModeloBase1LocalDraftVersion;
