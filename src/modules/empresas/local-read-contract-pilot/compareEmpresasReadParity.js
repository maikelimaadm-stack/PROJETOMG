import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

/**
 * Compares the legacy-like local read output (repository list result) against the
 * runtime-v2 projection. Pure. Reports an exact-match verdict plus a digest for
 * each side. No silent divergence: any difference becomes a blocker.
 *
 * @param {Object} [options]
 * @param {Object} [options.legacy] repository list result
 * @param {Object} [options.runtime] runtime projection
 * @returns {Object} parity report
 */
export function compareEmpresasReadParity(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const legacy = isGenericModelPlainObject(o.legacy) ? o.legacy : {};
  const runtime = isGenericModelPlainObject(o.runtime) ? o.runtime : {};

  const legacyItems = Array.isArray(legacy.items) ? legacy.items : [];
  const runtimeItems = Array.isArray(runtime.items) ? runtime.items : [];

  /** @type {string[]} */ const differences = [];
  /** @type {string[]} */ const blockers = [];
  /** @type {string[]} */ const warnings = [];

  const legacyIds = legacyItems.map((r) => r.id);
  const runtimeIds = runtimeItems.map((r) => r.id);

  if (legacyItems.length !== runtimeItems.length) differences.push('count');
  if (JSON.stringify(legacyIds) !== JSON.stringify(runtimeIds)) differences.push('ids-or-order');
  if (Number(legacy.total || 0) !== Number(runtime.total || 0)) differences.push('total');
  if (Number(legacy.page || 1) !== Number(runtime.page || 1)) differences.push('page');
  if (Number(legacy.pageSize || 0) !== Number(runtime.pageSize || 0)) differences.push('pageSize');
  // Field-level parity per record (normalized payload must be identical).
  for (let i = 0; i < Math.min(legacyItems.length, runtimeItems.length); i += 1) {
    if (JSON.stringify(legacyItems[i]) !== JSON.stringify(runtimeItems[i])) {
      differences.push(`record-fields:${i}`);
      break;
    }
  }

  for (const d of differences) blockers.push(`parity-divergence:${d}`);

  const legacyDigest = createGenericModelChecksum(legacyItems);
  const runtimeDigest = createGenericModelChecksum(runtimeItems);
  const equal = differences.length === 0 && legacyDigest === runtimeDigest;

  return safeCloneGenericModel({
    kind: 'empresas-read-parity',
    equal,
    score: equal ? 1 : Math.max(0, 1 - differences.length / 6),
    differences,
    blockers,
    warnings,
    legacyDigest,
    runtimeDigest,
    safeToProceed: equal,
  });
}

export default compareEmpresasReadParity;
