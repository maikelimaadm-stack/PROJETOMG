import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES } from './studioBlueprintEngineConfig.js';
import { studioBlueprintEngineDigest } from './createStudioBlueprintEngineDigest.js';

/**
 * Produces HEADLESS preview metadata for a normalized blueprint: a pure, serializable
 * DESCRIPTION of what a future preview WOULD show (column list, form field order,
 * detail sections, empty/loading/error states) — WITHOUT rendering anything, importing
 * React, or wiring any route/menu. It renders nothing; it is data only. Pure; no side
 * effect. `rendered` is always false.
 *
 * @param {Object} [blueprint] a normalized blueprint
 * @returns {Object} preview metadata descriptor
 */
export function createStudioHeadlessPreviewMetadata(blueprint = {}) {
  const b = isGenericModelPlainObject(blueprint) ? blueprint : {};
  const fields = Array.isArray(b.fields) ? b.fields.filter(isGenericModelPlainObject) : [];

  const tableColumns = fields
    .filter((f) => f.protectedField !== true)
    .map((f) => ({ name: f.name, label: f.label ?? f.name, type: f.type, sortable: f.sortable === true }));

  const formFields = fields.map((f, i) => ({
    name: f.name,
    label: f.label ?? f.name,
    type: f.type,
    required: f.required === true,
    order: i,
    readOnly: false,
  }));

  const detailSections = [{
    section: 'general',
    fields: fields.map((f) => f.name),
  }];

  const core = {
    kind: 'studio-headless-preview-metadata',
    moduleId: String(b.moduleId ?? 'draftModule'),
    rendered: false,
    isReactComponent: false,
    table: { columns: tableColumns, columnCount: tableColumns.length },
    form: { fields: formFields, fieldCount: formFields.length },
    detail: { sections: detailSections },
    requiredStates: ['empty', 'loading', 'error'],
    // A preview is read-only metadata: it never implies a mutation surface.
    mutationSurface: false,
  };

  return safeCloneGenericModel({
    ...core,
    ...STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
    previewDigest: studioBlueprintEngineDigest(core),
  });
}

export default createStudioHeadlessPreviewMetadata;
