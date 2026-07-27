import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/**
 * Deterministic internal-identity digest for plan parts. Reuses the runtime's FNV-1a key-sorted helper READ-ONLY.
 * NOT cryptographic. Pure.
 */
export function createPlanDigest(value) { return createDeterministicDigest(value); }
export default createPlanDigest;
