import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Bridges the sandbox FORM preview metadata into a dev-preview form schema. Pure,
 * metadata-only. Protected fields stay read-only labels; no real input; no mutation.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} form bridge schema
 */
export function createDevPreviewFormBridgeSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const f = isGenericModelPlainObject(o.sandbox?.formPreviewMetadata) ? o.sandbox.formPreviewMetadata : {};
  const fields = Array.isArray(f.fields) ? f.fields.filter(isGenericModelPlainObject) : [];

  const core = {
    kind: 'dev-preview-form-bridge-schema',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    fields: fields.map((x) => ({
      name: x.name,
      label: x.label ?? x.name,
      type: x.type,
      required: x.required === true,
      readOnly: x.readOnly === true || x.protectedField === true,
      protectedField: x.protectedField === true,
      tenantScoped: x.tenantScoped === true,
      componentKind: x.protectedField === true ? 'label' : 'input-placeholder',
    })),
    sections: [{ section: 'general', order: 1, metadataOnly: true }],
    submitBinding: { action: 'create', enabled: false, mutation: false },
    realInput: false,
    componentCreated: false,
    mutationAllowed: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, formBridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewFormBridgeSchema;
