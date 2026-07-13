import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the FIELDS / TABLE COLUMNS / FORM FIELDS from a normalized blueprint. Pure.
 * Follows the canonical field contract: protected fields default read-only, tenant
 * fields preserved, computed never executes code, relation preserves tenant. Table/form
 * generation is `generationAllowedNow: false`; preview metadata is `allowedFuture`.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} field/table/form plan
 */
export function createModuleFieldTableFormPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};
  const rawFields = Array.isArray(b.fields) ? b.fields.filter(isGenericModelPlainObject) : [];

  const fields = rawFields.map((f) => ({
    name: String(f.name ?? '').trim(),
    type: String(f.type ?? 'text').trim(),
    label: String(f.label ?? f.name ?? '').trim(),
    required: f.required === true,
    unique: f.unique === true,
    sortable: f.sortable === true,
    filterable: f.filterable === true,
    searchable: f.searchable === true,
    tenantScoped: f.tenantScoped === true,
    protectedField: f.protectedField === true,
    readOnlyDefault: f.protectedField === true, // protected default read-only
    computedExecutesCode: false,               // computed never executes code
    relationPreservesTenant: f.type === 'relation' ? true : undefined,
  }));

  const invalidFields = fields.filter((f) => f.name.length === 0).map((f) => f.name);
  const tableColumns = fields.filter((f) => !f.protectedField).map((f) => ({ name: f.name, label: f.label, type: f.type, sortable: f.sortable }));
  const formFields = fields.map((f, i) => ({ name: f.name, label: f.label, type: f.type, required: f.required, order: i, readOnly: f.readOnlyDefault }));
  const groups = [{ section: 'general', fields: fields.map((f) => f.name) }];
  const validations = fields.filter((f) => f.required).map((f) => ({ field: f.name, rule: 'required' }));

  const core = {
    kind: 'module-field-table-form-plan',
    moduleId: String(b.moduleId ?? 'plannedModule').trim(),
    fields,
    fieldCount: fields.length,
    tableColumns,
    formFields,
    groups,
    validations,
    protectedFields: fields.filter((f) => f.protectedField).map((f) => f.name),
    tenantFields: fields.filter((f) => f.tenantScoped).map((f) => f.name),
    filterableFields: fields.filter((f) => f.filterable).map((f) => f.name),
    searchableFields: fields.filter((f) => f.searchable).map((f) => f.name),
    sortableFields: fields.filter((f) => f.sortable).map((f) => f.name),
    customFieldsReference: { source: 'cadcps', referenceOnly: true },
    invalidFields,
    hasInvalidField: invalidFields.length > 0,
    protectedDefaultReadOnly: fields.filter((f) => f.protectedField).every((f) => f.readOnlyDefault === true),
    computedExecutesCode: false,
    generationAllowedNow: false,
    previewMetadataAllowedFuture: true,
  };

  return safeCloneGenericModel({ ...core, fieldTableFormPlanDigest: plannerDigest(core) });
}

export default createModuleFieldTableFormPlan;
