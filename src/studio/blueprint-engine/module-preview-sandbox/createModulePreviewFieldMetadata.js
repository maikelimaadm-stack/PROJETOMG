import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

const KNOWN_TYPES = new Set([
  'text', 'number', 'decimal', 'date', 'datetime', 'boolean', 'select', 'multiSelect',
  'relation', 'computed', 'money', 'percentage', 'filePlaceholder', 'status',
]);

const WIDGET = {
  text: 'textInput', number: 'numberInput', decimal: 'numberInput', date: 'datePicker',
  datetime: 'dateTimePicker', boolean: 'switch', select: 'select', multiSelect: 'multiSelect',
  relation: 'relationPicker', computed: 'computedReadOnly', money: 'moneyInput',
  percentage: 'percentInput', filePlaceholder: 'filePlaceholder', status: 'statusBadge',
};

/**
 * Builds per-FIELD preview metadata. Pure. Follows the canonical field contract: unsafe
 * fields (unknown type / empty name) block the field's preview; protected defaults to
 * read-only; tenant preserved; computed never executes code; relation does not access
 * backend.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} field preview metadata
 */
export function createModulePreviewFieldMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const ftf = isGenericModelPlainObject(plan.fieldTableFormPlan) ? plan.fieldTableFormPlan : {};
  const src = Array.isArray(ftf.fields) ? ftf.fields.filter(isGenericModelPlainObject) : [];

  const fields = src.map((f) => {
    const name = String(f.name ?? '').trim();
    const type = String(f.type ?? '').trim();
    const unsafe = name.length === 0 || !KNOWN_TYPES.has(type);
    return {
      fieldName: name,
      label: f.label ?? name,
      type,
      required: f.required === true,
      protectedField: f.protectedField === true,
      tenantScoped: f.tenantScoped === true,
      readOnly: f.protectedField === true,
      visibleInTable: f.protectedField !== true,
      visibleInForm: true,
      searchable: f.searchable === true,
      filterable: f.filterable === true,
      sortable: f.sortable === true,
      validationMetadata: f.required === true ? [{ rule: 'required' }] : [],
      permissionMetadata: { requiresPermission: true, requiresTenant: f.tenantScoped === true },
      previewWidgetKind: WIDGET[type] ?? 'unknown',
      computedExecutesCode: false,
      relationAccessesBackend: false,
      unsafe,
      previewBlocked: unsafe,
      risk: unsafe ? 'high' : 'low',
    };
  });

  const core = {
    kind: 'module-preview-field-metadata',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    fields,
    fieldCount: fields.length,
    unsafeFields: fields.filter((f) => f.unsafe).map((f) => f.fieldName),
    hasUnsafeField: fields.some((f) => f.unsafe),
    protectedDefaultReadOnly: fields.filter((f) => f.protectedField).every((f) => f.readOnly === true),
    computedExecutesCode: false,
    previewOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, fieldPreviewDigest: sandboxDigest(core) });
}

export default createModulePreviewFieldMetadata;
