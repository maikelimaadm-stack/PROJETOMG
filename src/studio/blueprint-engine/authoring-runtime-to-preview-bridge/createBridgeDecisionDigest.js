import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';

/**
 * Computes the deterministic bridge-decision digest READ-ONLY using the runtime's `createDeterministicDigest`
 * (FNV-1a, key-sorted). Same decision graph -> same digest. Not cryptographic. Pure. @param {Object} core
 * @returns {string}
 */
export function createBridgeDecisionDigest(core) {
  return createDeterministicDigest(core ?? null);
}

export default createBridgeDecisionDigest;
