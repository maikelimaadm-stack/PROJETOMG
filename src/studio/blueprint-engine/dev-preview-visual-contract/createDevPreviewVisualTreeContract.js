import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ALLOWED_VISUAL_PLACEHOLDER_KINDS, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Builds a metadata-only VISUAL TREE contract from the bridge render schema. Pure. It is a
 * logical tree (root → screens → sections → slots → component placeholders) with bindings,
 * permission hints and state hints — all metadata. No React, no JSX/TSX, no DOM, no runtime
 * CSS. Every leaf references an ALLOWED placeholder kind.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} visual tree contract
 */
function placeholderForComponentKind(componentKind) {
  switch (String(componentKind || '')) {
    case 'label': return 'VisualLabelPlaceholder';
    case 'input-placeholder': return 'VisualInputPlaceholder';
    case 'select-placeholder': return 'VisualSelectPlaceholder';
    case 'date-placeholder': return 'VisualDatePlaceholder';
    case 'number-placeholder': return 'VisualNumberPlaceholder';
    case 'boolean-placeholder': return 'VisualBooleanPlaceholder';
    case 'badge-placeholder': return 'VisualBadgePlaceholder';
    case 'button-placeholder': return 'VisualButtonPlaceholder';
    case 'table': return 'VisualTablePlaceholder';
    case 'form': return 'VisualFormPlaceholder';
    default: return 'VisualTextPlaceholder';
  }
}

export function createDevPreviewVisualTreeContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : {};
  const render = isGenericModelPlainObject(bridge.renderSchema) ? bridge.renderSchema : {};
  const perm = isGenericModelPlainObject(bridge.permissionBridge) ? bridge.permissionBridge : {};
  const fieldBindings = Array.isArray(render.fieldBindings) ? render.fieldBindings.filter(isGenericModelPlainObject) : [];
  const tableColumns = Array.isArray(bridge.tableBridge?.columns) ? bridge.tableBridge.columns.filter(isGenericModelPlainObject) : [];

  const formSlots = fieldBindings.map((f) => ({
    slot: `field:${f.name}`,
    placeholderKind: placeholderForComponentKind(f.componentKind),
    bindTo: `field:${f.name}`,
    readOnly: f.readOnly === true || f.protectedField === true,
    protectedField: f.protectedField === true,
    tenantScoped: f.tenantScoped === true,
    metadataOnly: true,
  }));
  const tableSlots = tableColumns.map((c) => ({
    slot: `column:${c.name}`,
    placeholderKind: 'VisualTablePlaceholder',
    bindTo: `column:${c.name}`,
    protectedColumn: c.protectedColumn === true,
    visible: c.visible !== false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'dev-preview-visual-tree-contract',
    visualTreeVersion: 'dev-preview-visual-tree-contract@1.0.0',
    moduleId: String(bridge.moduleId ?? 'plannedModule'),
    root: {
      node: 'screen-root',
      placeholderKind: 'VisualContainerPlaceholder',
      screens: [
        { screen: 'list', placeholderKind: 'VisualTablePlaceholder', sections: [{ section: 'table', placeholderKind: 'VisualSectionPlaceholder', slots: tableSlots }] },
        { screen: 'form', placeholderKind: 'VisualFormPlaceholder', sections: [{ section: 'general', placeholderKind: 'VisualSectionPlaceholder', slots: formSlots }] },
        { screen: 'detail', placeholderKind: 'VisualDetailPlaceholder', readOnly: true, sections: [{ section: 'detail', placeholderKind: 'VisualSectionPlaceholder', slots: formSlots.map((s) => ({ ...s, placeholderKind: 'VisualLabelPlaceholder', readOnly: true })) }] },
      ],
    },
    permissionHints: {
      defaultDeny: perm.defaultDeny !== false,
      failClosed: perm.failClosed !== false,
      tenantRequired: perm.tenantRequired !== false,
      metadataOnly: true,
    },
    stateHints: ['idle', 'loading', 'empty', 'ready', 'blocked', 'error'],
    allPlaceholdersAllowed: [...tableSlots, ...formSlots].every((s) => ALLOWED_VISUAL_PLACEHOLDER_KINDS.includes(s.placeholderKind)),
    react: false,
    jsx: false,
    tsx: false,
    dom: false,
    cssRuntime: false,
    metadataOnly: true,
  };

  return safeCloneGenericModel({ ...core, visualTreeDigest: visualDigest(core) });
}

export default createDevPreviewVisualTreeContract;
