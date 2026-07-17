import { isPlainObject } from './normalizeAuthoringInput.js';
import { stableSerialize } from './stableSerialize.js';

/**
 * Deterministic, fail-closed resource-limit checks. Returns `{ ok, issueCode }` — NEVER truncates
 * silently, NEVER persists, NEVER throws. Pure.
 *
 * @param {Object} options
 * @param {Object} options.limits a resource-limits policy
 * @param {string} options.dimension one of the limit dimensions
 * @param {number} options.count the current/candidate count
 * @returns {{ ok: boolean, issueCode: string|null, limit: number }}
 */
export function enforceAuthoringResourceLimits(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const limits = isPlainObject(o.limits) ? o.limits : {};
  const dimension = typeof o.dimension === 'string' ? o.dimension : '';
  const count = Number(o.count);
  const map = {
    drafts: ['maxDraftsPerSession', 'AUTHORING_RUNTIME_LIMIT_MAX_DRAFTS'],
    operations: ['maxOperationsPerSession', 'AUTHORING_RUNTIME_LIMIT_MAX_OPERATIONS'],
    revisions: ['maxRevisionsPerDraft', 'AUTHORING_RUNTIME_LIMIT_MAX_REVISIONS'],
    fields: ['maxFieldsPerDraft', 'AUTHORING_RUNTIME_LIMIT_MAX_FIELDS'],
    layoutSections: ['maxLayoutSectionsPerDraft', 'AUTHORING_RUNTIME_LIMIT_MAX_LAYOUT_SECTIONS'],
    relationships: ['maxRelationshipsPerDraft', 'AUTHORING_RUNTIME_LIMIT_MAX_RELATIONSHIPS'],
    validationIssues: ['maxValidationIssuesPerRun', 'AUTHORING_RUNTIME_LIMIT_MAX_VALIDATION_ISSUES'],
  };
  const entry = map[dimension];
  if (!entry) return { ok: true, issueCode: null, limit: Infinity };
  const limit = Number(limits[entry[0]]);
  const bound = Number.isFinite(limit) ? limit : Infinity;
  const ok = Number.isFinite(count) ? count <= bound : false;
  return { ok, issueCode: ok ? null : entry[1], limit: bound };
}

/**
 * Fail-closed string-length check. @param {Object} limits @param {string} value
 * @returns {{ ok: boolean, issueCode: string|null }}
 */
export function enforceStringLength(limits, value) {
  const max = Number(isPlainObject(limits) ? limits.maxStringLength : NaN);
  const bound = Number.isFinite(max) ? max : Infinity;
  const ok = typeof value !== 'string' || value.length <= bound;
  return { ok, issueCode: ok ? null : 'AUTHORING_RUNTIME_LIMIT_MAX_STRING_LENGTH' };
}

/**
 * Fail-closed serialized-snapshot byte check (UTF-8 length of the stable serialization).
 * @param {Object} limits @param {unknown} snapshot
 * @returns {{ ok: boolean, issueCode: string|null, bytes: number }}
 */
export function enforceSerializedSnapshotBytes(limits, snapshot) {
  const max = Number(isPlainObject(limits) ? limits.maxSerializedSnapshotBytes : NaN);
  const bound = Number.isFinite(max) ? max : Infinity;
  const serialized = stableSerialize(snapshot);
  let bytes = 0;
  for (let i = 0; i < serialized.length; i += 1) {
    const c = serialized.charCodeAt(i);
    bytes += c < 0x80 ? 1 : c < 0x800 ? 2 : 3;
  }
  const ok = bytes <= bound;
  return { ok, issueCode: ok ? null : 'AUTHORING_RUNTIME_LIMIT_MAX_SERIALIZED_SNAPSHOT_BYTES', bytes };
}

export default enforceAuthoringResourceLimits;
