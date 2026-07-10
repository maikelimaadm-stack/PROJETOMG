import { isPlainObject, findUnsafeContent, hasUnmaskedSensitive, hasForbiddenReference } from '../../safety.js';
import { computeModeloBase1DraftChecksum, MODELOBASE1_LOCAL_DRAFT_SOURCE } from './serializeModeloBase1LocalDraft.js';

const FORBIDDEN_TARGET_KEY = /^(backend|prisma|runtimeBridge|fetch|api|storage|persist|database)/i;

/**
 * Validates a ModeloBase1 local draft SNAPSHOT before it may be rehydrated or
 * persisted. Fail-closed: an absent/malformed snapshot, a moduleId mismatch, an
 * unsafe payload (function/handler/React/pollution), an unmasked sensitive
 * value, a forbidden backend/Prisma/runtimeBridge target, or a checksum mismatch
 * all make it invalid. Pure and side-effect-free.
 *
 * @param {Object} [options]
 * @param {Object} [options.snapshot]
 * @param {string} [options.moduleId] Expected moduleId (optional).
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToRehydrate: boolean }}
 */
export function validateModeloBase1LocalDraftSnapshot(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isPlainObject(options) ? options : {};
  const snapshot = isPlainObject(o.snapshot) ? o.snapshot : null;
  const expectedModuleId = typeof o.moduleId === 'string' ? o.moduleId : null;

  if (!snapshot) {
    return { valid: false, errors: ['snapshot is missing or not a plain object'], warnings, blockers, score: 0, safeToRehydrate: false };
  }

  if (typeof snapshot.moduleId !== 'string' || snapshot.moduleId.length === 0) errors.push('missing moduleId');
  if (expectedModuleId && snapshot.moduleId !== expectedModuleId) blockers.push(`moduleId mismatch: expected "${expectedModuleId}", got "${snapshot.moduleId}"`);
  if (typeof snapshot.snapshotId !== 'string' || snapshot.snapshotId.length === 0) errors.push('missing snapshotId');
  if (typeof snapshot.version !== 'string') errors.push('missing version');
  if (!Number.isFinite(snapshot.schemaVersion)) errors.push('missing schemaVersion');
  if (snapshot.source !== MODELOBASE1_LOCAL_DRAFT_SOURCE) errors.push(`invalid source (expected "${MODELOBASE1_LOCAL_DRAFT_SOURCE}")`);
  if (snapshot.localOnly !== true) blockers.push('localOnly must be true');
  if (snapshot.persistenceReal !== false) blockers.push('persistenceReal must be false');
  if (!Array.isArray(snapshot.rows)) errors.push('rows must be an array');

  // Safety of the whole snapshot (catches top-level prototype-pollution keys as
  // well as functions/handlers/React elements anywhere in rows/form/metadata).
  const payload = { rows: snapshot.rows, form: snapshot.form ?? null, metadata: snapshot.metadata ?? null };
  const unsafe = findUnsafeContent(snapshot) || findUnsafeContent(payload);
  if (unsafe) blockers.push(unsafe);
  if (hasUnmaskedSensitive(payload)) blockers.push('snapshot has unmasked sensitive values');
  if (hasForbiddenReference(payload)) blockers.push('snapshot references backend/fetch/Prisma/storage');
  for (const key of Object.keys(snapshot)) {
    if (FORBIDDEN_TARGET_KEY.test(key) && !/^persistenceReal$/.test(key)) blockers.push(`snapshot key "${key}" targets a non-local sink`);
  }

  // Checksum integrity (recompute over the canonical content).
  if (typeof snapshot.checksum === 'string') {
    const content = {
      moduleId: snapshot.moduleId,
      version: snapshot.version,
      schemaVersion: snapshot.schemaVersion,
      source: snapshot.source,
      localOnly: snapshot.localOnly,
      persistenceReal: snapshot.persistenceReal,
      rows: snapshot.rows,
      form: snapshot.form ?? null,
    };
    const recomputed = computeModeloBase1DraftChecksum(content);
    if (recomputed !== snapshot.checksum) blockers.push('checksum mismatch');
  } else {
    warnings.push('snapshot has no checksum');
  }

  const valid = errors.length === 0 && blockers.length === 0;
  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 6);
  return { valid, errors, warnings, blockers, score, safeToRehydrate: valid };
}

export default validateModeloBase1LocalDraftSnapshot;
