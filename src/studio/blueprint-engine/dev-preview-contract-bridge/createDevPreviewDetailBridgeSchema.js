import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Bridges the sandbox DETAIL preview metadata into a dev-preview read-only detail schema.
 * Pure, metadata-only. Everything is read-only; no edit; no mutation; no component.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} detail bridge schema
 */
export function createDevPreviewDetailBridgeSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const d = isGenericModelPlainObject(o.sandbox?.detailPreviewMetadata) ? o.sandbox.detailPreviewMetadata : {};
  const fields = Array.isArray(d.fields) ? d.fields.filter(isGenericModelPlainObject) : [];

  const core = {
    kind: 'dev-preview-detail-bridge-schema',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    fields: fields.map((x) => ({
      name: x.name,
      label: x.label ?? x.name,
      type: x.type,
      readOnly: true,
      protectedField: x.protectedField === true,
      componentKind: 'label',
    })),
    readOnly: true,
    editable: false,
    componentCreated: false,
    mutationAllowed: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, detailBridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewDetailBridgeSchema;
