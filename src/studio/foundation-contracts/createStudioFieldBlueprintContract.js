import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/** Allowlisted field types. */
export const STUDIO_FIELD_TYPES = [
  'text', 'number', 'decimal', 'date', 'datetime', 'boolean', 'select', 'multiSelect',
  'relation', 'computed', 'money', 'percentage', 'filePlaceholder', 'status',
];

/** Whether a given type may be searchable/filterable/sortable. */
function typeCapabilities(type) {
  const textLike = ['text', 'select', 'multiSelect', 'status', 'relation'];
  const numericLike = ['number', 'decimal', 'money', 'percentage', 'date', 'datetime'];
  return {
    searchable: textLike.includes(type),
    filterable: textLike.includes(type) || numericLike.includes(type) || type === 'boolean',
    sortable: numericLike.includes(type) || type === 'text' || type === 'status',
  };
}

/**
 * The Field Blueprint contract: allowlisted types + per-field attributes + safety
 * rules. Pure. Rejects unsafe/unknown types.
 *
 * @param {Object} [options]
 * @param {Object} [options.field] optional field to classify (validity check)
 * @returns {Object} field blueprint contract descriptor
 */
export function createStudioFieldBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const attributes = [
    'name', 'label', 'type', 'required', 'defaultValue', 'validation', 'visibleInTable',
    'visibleInForm', 'searchable', 'filterable', 'sortable', 'permission', 'helpText', 'group',
    'order', 'protected', 'tenantScoped', 'computed',
  ];

  let fieldCheck = null;
  if (isGenericModelPlainObject(o.field)) {
    const f = o.field;
    const type = typeof f.type === 'string' ? f.type : '';
    const safeName = typeof f.name === 'string' && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.name);
    const typeAllowed = STUDIO_FIELD_TYPES.includes(type);
    const computedSafe = type !== 'computed' || (typeof f.computed !== 'function');
    const protectedNotEditable = f.protected !== true || f.editableByDefault !== true;
    fieldCheck = {
      valid: safeName && typeAllowed && computedSafe && protectedNotEditable,
      safeName, typeAllowed, computedSafe, protectedNotEditable,
      capabilities: typeAllowed ? typeCapabilities(type) : { searchable: false, filterable: false, sortable: false },
    };
  }

  const body = {
    kind: 'studio-field-blueprint-contract',
    allowedTypes: [...STUDIO_FIELD_TYPES],
    attributes,
    rules: [
      'field name must be safe (identifier)',
      'type must be in allowlist',
      'computed field cannot execute arbitrary code',
      'relation cannot bypass tenant',
      'protected field is not editable by default',
      'searchable/filterable/sortable depend on the type',
      'unsafe field is blocked',
    ],
    protectedEditableByDefault: false,
    relationBypassesTenant: false,
    fieldCheck,
  };
  return safeCloneGenericModel({ ...body, fieldBlueprintDigest: createStudioContractDigest({ value: { types: STUDIO_FIELD_TYPES, attributes } }) });
}

export default createStudioFieldBlueprintContract;
