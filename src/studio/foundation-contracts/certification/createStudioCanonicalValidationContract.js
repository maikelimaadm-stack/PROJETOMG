import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_VALIDATION_KINDS } from '../createStudioValidationBlueprintContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical validation contract. Pure. Blocks unsafe validations; regex
 * must be a safe string; computed does not run arbitrary code; async does not call the
 * network; uniquePlanned does not create a constraint; tenantScope cannot be removed.
 *
 * @param {Object} [options]
 * @returns {Object} canonical validation contract
 */
export function createStudioCanonicalValidationContract(options = {}) {
  void options;
  const body = {
    kind: 'studio-canonical-validation-contract',
    allowedKinds: [...STUDIO_VALIDATION_KINDS],
    rules: [
      'unsafe validation blocked',
      'regex must be a safe string',
      'function validator blocked',
      'eval blocked',
      'custom JS code blocked',
      'asyncValidationPlanned does not call the network',
      'uniquePlanned does not create a DB constraint',
      'relationExists does not access backend in this contract',
      'tenantScope cannot be removed',
    ],
    unsafeValidationAllowed: false,
    asyncCallsNetwork: false,
    uniqueCreatesConstraint: false,
    tenantScopeRemovable: false,
  };
  return safeCloneGenericModel({ ...body, canonicalValidationContractDigest: certificationDigest({ kinds: STUDIO_VALIDATION_KINDS }) });
}

export default createStudioCanonicalValidationContract;
