import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioSafetyPolicy, STUDIO_SAFETY_INVARIANTS } from '../createStudioSafetyPolicy.js';

/**
 * Executes every Studio safety invariant against a descriptor. Pure. Any failing
 * invariant is a blocker; a clean descriptor passes all of them.
 *
 * @param {Object} [options]
 * @param {Object} [options.descriptor] descriptor to check (defaults to the canonical all-true invariants)
 * @returns {Object} runner result
 */
export function createStudioSafetyInvariantRunner(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const policy = createStudioSafetyPolicy();
  const names = Object.keys(STUDIO_SAFETY_INVARIANTS);
  const descriptor = (o.descriptor && typeof o.descriptor === 'object') ? o.descriptor : { ...STUDIO_SAFETY_INVARIANTS };

  const results = names.map((name) => {
    const expected = STUDIO_SAFETY_INVARIANTS[name];
    const actual = descriptor[name];
    const passed = actual === expected;
    return { invariant: name, expected, actual, passed };
  });

  const check = policy.check(descriptor);
  const failed = results.filter((r) => !r.passed).map((r) => r.invariant);
  const blockers = [...new Set([...failed, ...(check.violations || []).map((v) => v.split(' ')[0])])];

  return safeCloneGenericModel({
    kind: 'studio-safety-invariant-runner',
    invariantCount: names.length,
    results,
    passed: results.filter((r) => r.passed).length,
    failed: failed.length,
    blockers,
    warnings: [],
    readiness: blockers.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioSafetyInvariantRunner;
