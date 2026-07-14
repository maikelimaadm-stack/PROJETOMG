import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds FORM preview metadata. Pure. No React form is generated, no submit is real;
 * create/update/delete are disabled; protected/tenant fields are read-only by default;
 * computed fields never execute code; relation fields preserve tenant; validations are
 * metadata only (no network).
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} form preview metadata
 */
export function createModulePreviewFormMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const ftf = isGenericModelPlainObject(plan.fieldTableFormPlan) ? plan.fieldTableFormPlan : {};
  const fields = Array.isArray(ftf.fields) ? ftf.fields.filter(isGenericModelPlainObject) : [];

  const formFields = fields.map((f, i) => ({
    name: f.name,
    label: f.label ?? f.name,
    type: f.type,
    order: i,
    required: f.required === true,
    protectedField: f.protectedField === true,
    tenantScoped: f.tenantScoped === true,
    readOnly: f.protectedField === true,
    computedExecutesCode: false,
    relationPreservesTenant: f.type === 'relation' ? true : undefined,
  }));

  const validationMetadata = fields.filter((f) => f.required).map((f) => ({ field: f.name, rule: 'required', networkUsed: false }));

  const core = {
    kind: 'module-preview-form-metadata',
    formId: `${String(plan.moduleId ?? 'plannedModule')}#form-preview`,
    sourcePlan: 'module-reference-plan.fieldTableFormPlan',
    fields: formFields,
    groups: [{ group: 'general', fields: formFields.map((f) => f.name) }],
    sections: [{ section: 'general', label: 'Geral', fields: formFields.map((f) => f.name) }],
    requiredFields: formFields.filter((f) => f.required).map((f) => f.name),
    optionalFields: formFields.filter((f) => !f.required).map((f) => f.name),
    protectedFields: formFields.filter((f) => f.protectedField).map((f) => f.name),
    tenantFields: formFields.filter((f) => f.tenantScoped).map((f) => f.name),
    validationMetadata,
    createMode: { enabled: false, blockedReason: 'mutation disabled in preview' },
    editMode: { enabled: false, blockedReason: 'mutation disabled in preview' },
    readOnlyMode: { enabled: true },
    submitAction: { actionId: 'submit', enabled: false, mutation: true, blockedReason: 'submit disabled in preview' },
    cancelAction: { actionId: 'cancel', enabled: true, mutation: false },
    emptyState: { kind: 'empty' },
    loadingState: { kind: 'loading' },
    errorState: { kind: 'error' },
    validationErrorState: { kind: 'validationError' },
    protectedDefaultReadOnly: formFields.filter((f) => f.protectedField).every((f) => f.readOnly === true),
    computedExecutesCode: false,
    previewOnly: true,
    componentCreated: false,
    dataFetched: false,
    mutationAllowed: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, formPreviewDigest: sandboxDigest(core) });
}

export default createModulePreviewFormMetadata;
