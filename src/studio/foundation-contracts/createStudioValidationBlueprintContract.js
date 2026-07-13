import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/** Allowlisted validation kinds. */
export const STUDIO_VALIDATION_KINDS = [
  'required', 'typeCheck', 'min', 'max', 'regex', 'enum', 'relationExists', 'uniquePlanned',
  'tenantScope', 'computedValidation', 'crossFieldValidation', 'asyncValidationPlanned',
];

/**
 * The Validation Blueprint contract. Pure. Blocks unsafe validations; regex must be
 * a safe string; computed does not run arbitrary code; async does not call the
 * network this slice; uniquePlanned does not create a DB constraint.
 *
 * @param {Object} [options]
 * @param {Object} [options.validation] optional validation to check
 * @returns {Object} validation blueprint contract descriptor
 */
export function createStudioValidationBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  let validationCheck = null;
  if (isGenericModelPlainObject(o.validation)) {
    const v = o.validation;
    const kindAllowed = STUDIO_VALIDATION_KINDS.includes(v.kind);
    const regexSafe = v.kind !== 'regex' || typeof v.pattern === 'string';
    const computedSafe = v.kind !== 'computedValidation' || typeof v.fn !== 'function';
    const asyncNoNetwork = v.kind !== 'asyncValidationPlanned' || v.callsNetwork !== true;
    const tenantPreserved = v.removesTenantScope !== true;
    validationCheck = { valid: kindAllowed && regexSafe && computedSafe && asyncNoNetwork && tenantPreserved, kindAllowed, regexSafe, computedSafe, asyncNoNetwork, tenantPreserved };
  }

  const body = {
    kind: 'studio-validation-blueprint-contract',
    allowedKinds: [...STUDIO_VALIDATION_KINDS],
    rules: [
      'unsafe validation is blocked',
      'regex must be a safe string',
      'computed validation does not execute arbitrary code',
      'async validation does not call the network this slice',
      'uniquePlanned does not create a DB constraint',
      'tenantScope cannot be removed by a dangerous blueprint',
    ],
    uniqueCreatesConstraint: false,
    asyncCallsNetwork: false,
    unsafeValidationAllowed: false,
    validationCheck,
  };
  return safeCloneGenericModel({ ...body, validationBlueprintDigest: createStudioContractDigest({ value: STUDIO_VALIDATION_KINDS }) });
}

export default createStudioValidationBlueprintContract;
