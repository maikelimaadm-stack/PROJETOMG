import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Builds a metadata-only RENDER SCHEMA from the sandbox preview metadata. Pure. It is a
 * logical screen tree (areas → sections → slots) with field/action/permission BINDINGS
 * that are metadata only — no component import, no JSX/TSX, no React, no DOM, no CSS.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox] a module preview sandbox contract
 * @returns {Object} render schema metadata
 */
export function createDevPreviewRenderSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sandbox) ? o.sandbox : {};
  const table = isGenericModelPlainObject(s.tablePreviewMetadata) ? s.tablePreviewMetadata : {};
  const form = isGenericModelPlainObject(s.formPreviewMetadata) ? s.formPreviewMetadata : {};
  const perm = isGenericModelPlainObject(s.permissionPreviewMetadata) ? s.permissionPreviewMetadata : {};

  const columns = Array.isArray(table.columns) ? table.columns.filter(isGenericModelPlainObject) : [];
  const formFields = Array.isArray(form.fields) ? form.fields.filter(isGenericModelPlainObject) : [];

  const fieldBindings = formFields.map((f) => ({
    name: f.name,
    bindTo: `field:${f.name}`,
    readOnly: f.readOnly === true || f.protectedField === true,
    protectedField: f.protectedField === true,
    tenantScoped: f.tenantScoped === true,
    componentKind: f.protectedField === true ? 'label' : 'input-placeholder',
    metadataOnly: true,
  }));

  const actionBindings = [
    { action: 'read', bindTo: 'action:read', enabled: false, mutation: false, metadataOnly: true },
    { action: 'create', bindTo: 'action:create', enabled: false, mutation: true, metadataOnly: true },
  ];

  const permissionHints = {
    defaultDeny: perm.defaultDeny !== false,
    failClosed: perm.failClosed !== false,
    tenantRequired: perm.tenantRequired !== false,
    metadataOnly: true,
  };

  const core = {
    kind: 'dev-preview-render-schema',
    renderSchemaVersion: 'dev-preview-render-schema@1.0.0',
    moduleId: String(s.moduleId ?? 'plannedModule'),
    screenTree: {
      root: 'screen',
      areas: [
        { area: 'toolbar', slots: ['toolbar.actions'] },
        { area: 'table', slots: columns.map((c) => `column:${c.name}`) },
        { area: 'form', sections: [{ section: 'general', slots: formFields.map((f) => `field:${f.name}`) }] },
        { area: 'diagnostics', slots: ['diagnostics.passive'] },
      ],
    },
    fieldBindings,
    actionBindings,
    permissionHints,
    componentImport: false,
    jsx: false,
    tsx: false,
    react: false,
    dom: false,
    css: false,
    metadataOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, renderSchemaDigest: bridgeDigest(core) });
}

export default createDevPreviewRenderSchema;
