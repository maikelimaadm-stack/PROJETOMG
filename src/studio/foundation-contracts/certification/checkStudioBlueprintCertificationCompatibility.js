import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { classifyStudioCompatibility } from '../hardening/createStudioCompatibilityBreakingMatrix.js';

/**
 * Classifies a candidate blueprint contract vs the certified contract. Pure. Any
 * release of UI/route/menu/backend/Prisma/migration/production/staging/fetch/mutation,
 * or relaxation of a guard/safety invariant, is breaking and invalidates the
 * certification.
 *
 * @param {Object} [options]
 * @param {Object} [options.certified] the certified (baseline) contract
 * @param {Object} [options.candidate] the proposed contract
 * @returns {Object} compatibility result
 */
export function checkStudioBlueprintCertificationCompatibility(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const certified = o.certified;
  const candidate = o.candidate;
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

  if (!isObj(certified) || !isObj(candidate)) {
    return safeCloneGenericModel({
      kind: 'studio-blueprint-certification-compatibility',
      compatible: false,
      classification: 'invalid',
      breakingChanges: [],
      compatibleChanges: [],
      warnings: ['both certified and candidate must be plain objects'],
      requiresMajorVersion: false,
      requiresMinorVersion: false,
      requiresPatchVersion: false,
      certificationInvalidated: true,
    });
  }

  const r = classifyStudioCompatibility(certified, candidate);
  const breaking = r.classification === 'breaking';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-certification-compatibility',
    compatible: !breaking && r.classification !== 'invalid',
    classification: r.classification,
    breakingChanges: r.breakingChanges,
    compatibleChanges: r.backwardCompatibleChanges,
    warnings: r.warnings,
    requiresMajorVersion: r.requiresMajorVersion,
    requiresMinorVersion: r.requiresMinorVersion,
    requiresPatchVersion: r.requiresPatchVersion,
    certificationInvalidated: breaking,
  });
}

export default checkStudioBlueprintCertificationCompatibility;
