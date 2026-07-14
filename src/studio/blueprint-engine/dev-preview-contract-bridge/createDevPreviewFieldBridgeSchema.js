import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ALLOWED_COMPONENT_KINDS, bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Maps sandbox FIELD preview metadata into per-field dev-preview component contracts.
 * Pure, metadata-only. Each field maps to an ALLOWED placeholder component kind — never a
 * real input, never a live widget.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} field bridge schema
 */
function componentKindFor(type, protectedField) {
  if (protectedField) return 'label';
  switch (String(type || '').toLowerCase()) {
    case 'boolean': return 'boolean-placeholder';
    case 'date': case 'datetime': return 'date-placeholder';
    case 'number': case 'integer': case 'decimal': return 'number-placeholder';
    case 'select': case 'enum': return 'select-placeholder';
    case 'text': case 'string': return 'input-placeholder';
    default: return 'text-placeholder';
  }
}

export function createDevPreviewFieldBridgeSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const fp = isGenericModelPlainObject(o.sandbox?.fieldPreviewMetadata) ? o.sandbox.fieldPreviewMetadata : {};
  const fields = Array.isArray(fp.fields) ? fp.fields.filter(isGenericModelPlainObject) : [];

  const mapped = fields.map((x) => {
    const componentKind = componentKindFor(x.type, x.protectedField === true);
    return {
      name: x.name,
      type: x.type,
      protectedField: x.protectedField === true,
      tenantScoped: x.tenantScoped === true,
      componentKind: ALLOWED_COMPONENT_KINDS.includes(componentKind) ? componentKind : 'text-placeholder',
      realInput: false,
      metadataOnly: true,
    };
  });

  const core = {
    kind: 'dev-preview-field-bridge-schema',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    fields: mapped,
    allComponentsAllowed: mapped.every((m) => ALLOWED_COMPONENT_KINDS.includes(m.componentKind)),
    componentCreated: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, fieldBridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewFieldBridgeSchema;
