import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_SAFETY_INVARIANTS } from '../createStudioSafetyPolicy.js';
import { createStudioSafetyInvariantRunner } from '../hardening/createStudioSafetyInvariantRunner.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical safety invariants (20, all true) by running the hardening
 * invariant runner over the canonical descriptor. Pure. `exactSafety` is true only
 * when every invariant passes.
 *
 * @param {Object} [options]
 * @returns {Object} canonical safety invariants
 */
export function createStudioCanonicalSafetyInvariants(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const descriptor = (o.descriptor && typeof o.descriptor === 'object') ? o.descriptor : { ...STUDIO_SAFETY_INVARIANTS };
  const run = createStudioSafetyInvariantRunner({ descriptor });

  const body = {
    kind: 'studio-canonical-safety-invariants',
    invariants: { ...STUDIO_SAFETY_INVARIANTS },
    invariantNames: Object.keys(STUDIO_SAFETY_INVARIANTS),
    invariantCount: run.invariantCount,
    passed: run.passed,
    failed: run.blockers,
    exactSafety: run.failed === 0 && run.blockers.length === 0,
    blockers: run.blockers,
  };
  return safeCloneGenericModel({ ...body, canonicalSafetyInvariantsDigest: certificationDigest({ invariants: STUDIO_SAFETY_INVARIANTS }) });
}

export default createStudioCanonicalSafetyInvariants;
