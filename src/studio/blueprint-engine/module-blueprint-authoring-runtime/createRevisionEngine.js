import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * The REVISION ENGINE descriptor (pure data) + a pure monotonic next-revision helper. Revisions start
 * at 0, advance by exactly +1, never regress, never jump, never persist. @returns {Object}
 */
export function createRevisionEngine() {
  const core = {
    kind: 'authoring-revision-engine',
    revisionStartsAt: 0,
    revisionMonotonic: true,
    negativeRevisionAllowed: false,
    inPlaceCanonicalMutationAllowed: false,
    historyPersistenceAllowed: false,
    inMemoryOnly: true,
    revisionEngineImplemented: true,
  };
  return Object.freeze({ ...core, revisionEngineDigest: createDeterministicDigest(core) });
}

/**
 * Deterministic monotonic +1. Invalid/negative current revision fails closed to null.
 * @param {number} current @returns {number|null}
 */
export function nextRevision(current) {
  const n = Number(current);
  if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) return null;
  return n + 1;
}

export default createRevisionEngine;
