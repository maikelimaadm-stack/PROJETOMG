import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_FIELD_TYPES } from '../createStudioFieldBlueprintContract.js';
import { evaluateStudioField } from '../hardening/createStudioFieldHardeningMatrix.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

const ATTRIBUTES = [
  'name', 'label', 'type', 'required', 'defaultValue', 'validation', 'visibleInTable',
  'visibleInForm', 'searchable', 'filterable', 'sortable', 'permission', 'helpText', 'group',
  'order', 'protected', 'tenantScoped', 'computed',
];

/**
 * Certifies the canonical field contract: the 14 allowlisted types + attributes +
 * safety rules, reusing the hardening field evaluator. Pure. Rejects unsafe fields;
 * never executes computed code.
 *
 * @param {Object} [options]
 * @param {Object} [options.field] optional field to classify
 * @returns {Object} canonical field contract
 */
export function createStudioCanonicalFieldContract(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const fieldCheck = o.field ? evaluateStudioField(o.field, { knownNames: [] }) : null;

  const body = {
    kind: 'studio-canonical-field-contract',
    allowedTypes: [...STUDIO_FIELD_TYPES],
    attributes: ATTRIBUTES,
    rules: [
      'type must be in allowlist',
      'computed does not execute arbitrary code',
      'relation preserves tenant',
      'protected field is read-only by default',
      'unsafe field blocked',
      'duplicate field blocked',
      'reserved field blocked',
      'tenant field cannot be removed',
    ],
    computedExecutesCode: false,
    relationPreservesTenant: true,
    protectedReadOnlyByDefault: true,
    fieldCheck,
  };
  return safeCloneGenericModel({ ...body, canonicalFieldContractDigest: certificationDigest({ types: STUDIO_FIELD_TYPES, attributes: ATTRIBUTES }) });
}

export default createStudioCanonicalFieldContract;
