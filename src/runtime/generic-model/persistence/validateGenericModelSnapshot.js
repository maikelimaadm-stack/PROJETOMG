import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelUnsafeMarkers, detectGenericModelForbiddenTargetKeys } from '../safety/detectGenericModelUnsafeMarkers.js';
import { createGenericModelChecksum } from '../versioning/createGenericModelChecksum.js';
import { GENERIC_MODEL_SNAPSHOT_SOURCE } from './createGenericModelSnapshot.js';

/**
 * Validates a Generic Model SNAPSHOT before it may be trusted/rehydrated/
 * persisted. Fail-closed: absent/malformed snapshot, moduleId/modelId mismatch,
 * unsafe data (function/handler/React/pollution), forbidden backend/Prisma/
 * runtimeBridge target, `persistenceReal !== false`, `localOnly !== true`, or a
 * checksum mismatch all make it invalid. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.snapshot]
 * @param {string} [options.moduleId] Expected moduleId (optional).
 * @param {string} [options.modelId] Expected modelId (optional).
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], score: number, safeToUse: boolean }}
 */
export function validateGenericModelSnapshot(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const snapshot = isGenericModelPlainObject(o.snapshot) ? o.snapshot : null;
  if (!snapshot) {
    return { valid: false, errors: ['snapshot is missing or not a plain object'], warnings, blockers, score: 0, safeToUse: false };
  }

  if (typeof snapshot.modelId !== 'string') errors.push('missing modelId');
  if (typeof snapshot.moduleId !== 'string') errors.push('missing moduleId');
  if (o.modelId && snapshot.modelId !== o.modelId) blockers.push(`modelId mismatch: expected "${o.modelId}"`);
  if (o.moduleId && snapshot.moduleId !== o.moduleId) blockers.push(`moduleId mismatch: expected "${o.moduleId}"`);
  if (typeof snapshot.snapshotId !== 'string') errors.push('missing snapshotId');
  if (typeof snapshot.version !== 'string') errors.push('missing version');
  if (!Number.isFinite(snapshot.schemaVersion)) errors.push('missing schemaVersion');
  if (snapshot.source !== GENERIC_MODEL_SNAPSHOT_SOURCE) errors.push(`invalid source (expected "${GENERIC_MODEL_SNAPSHOT_SOURCE}")`);
  if (snapshot.localOnly !== true) blockers.push('localOnly must be true');
  if (snapshot.persistenceReal !== false) blockers.push('persistenceReal must be false');

  // Safety scan of the whole snapshot (functions/React/pollution/string refs).
  const report = detectGenericModelUnsafeMarkers(snapshot);
  if (report.unsafeMarkers.length > 0) blockers.push(...report.unsafeMarkers.map((m) => `unsafe:${m}`));
  if (report.sensitiveKeys.length > 0) blockers.push(...report.sensitiveKeys.map((k) => `unmasked-sensitive:${k}`));
  if (report.forbiddenTargets.length > 0) blockers.push(...report.forbiddenTargets.map((t) => `forbidden:${t}`));
  // Forbidden target KEYS in the DATA payload only (envelope safety flags are benign).
  const targetKeys = detectGenericModelForbiddenTargetKeys(snapshot.data ?? null);
  if (targetKeys.length > 0) blockers.push(...targetKeys.map((t) => `forbidden-target:${t}`));

  // Checksum integrity — recompute over the canonical content.
  if (typeof snapshot.checksum === 'string') {
    const content = {
      modelId: snapshot.modelId,
      moduleId: snapshot.moduleId,
      modelType: snapshot.modelType ?? null,
      version: snapshot.version,
      schemaVersion: snapshot.schemaVersion,
      source: snapshot.source,
      localOnly: snapshot.localOnly,
      persistenceReal: snapshot.persistenceReal,
      data: snapshot.data ?? null,
    };
    if (createGenericModelChecksum({ value: content }) !== snapshot.checksum) blockers.push('checksum mismatch');
  } else {
    warnings.push('snapshot has no checksum');
  }

  const valid = errors.length === 0 && blockers.length === 0;
  const total = errors.length + blockers.length + warnings.length;
  const score = total === 0 ? 1 : Math.max(0, 1 - total / 6);
  return { valid, errors, warnings, blockers, score, safeToUse: valid };
}

export default validateGenericModelSnapshot;
