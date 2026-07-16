import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/** Field draft data kinds the authoring foundation recognizes (metadata only). */
export const AUTHORING_FIELD_KINDS = Object.freeze([
  'text', 'number', 'boolean', 'date', 'select', 'reference', 'unknown',
]);

/**
 * Describes a single FIELD DRAFT — a temporary, non-canonical field description within an authoring
 * draft. Metadata only: it declares no runtime, no column, no SQL, no Prisma, no persistence, and
 * touches no real data. Pure and deterministic; same input -> same descriptor + digest.
 *
 * @param {Object} [options]
 * @param {string} [options.key] the field key (normalized to a safe string)
 * @param {string} [options.label]
 * @param {string} [options.description]
 * @param {string} [options.dataKind] one of AUTHORING_FIELD_KINDS
 * @param {number} [options.order] non-negative order index
 * @param {boolean} [options.required]
 * @param {boolean} [options.nullable]
 * @returns {Object}
 */
export function createFieldDraftDescriptor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const key = typeof o.key === 'string' && o.key.length > 0 ? o.key : 'field';
  const label = typeof o.label === 'string' && o.label.length > 0 ? o.label : key;
  const description = typeof o.description === 'string' ? o.description : '';
  const dataKind = AUTHORING_FIELD_KINDS.includes(o.dataKind) ? o.dataKind
    : (AUTHORING_FIELD_KINDS.includes(o.fieldKind) ? o.fieldKind : 'unknown');
  const rawOrder = Number(o.order);
  const order = Number.isFinite(rawOrder) && rawOrder >= 0 ? Math.floor(rawOrder) : 0;

  const core = {
    kind: 'authoring-field-draft-descriptor',
    fieldId: `field:${key}`,
    fieldKey: key,
    key,
    label,
    description,
    dataKind,
    fieldKind: dataKind,
    required: o.required === true,
    nullable: o.nullable === true,
    defaultValueDescriptor: null,
    validationDescriptors: [],
    displayDescriptor: { visible: true, readOnly: false },
    order,
    synthetic: true,
    canonical: false,
    draftOnly: true,
    columnCreated: false,
    persisted: false,
    realDataBound: false,
    backendBound: false,
  };
  return safeCloneGenericModel({ ...core, fieldDraftDigest: authoringFoundationDigest(core) });
}

export default createFieldDraftDescriptor;
