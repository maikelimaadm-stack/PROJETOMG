import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { UI_NODE_KINDS, uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the UI NODE contract — a metadata-only logical tree of UI nodes derived from the frame
 * mapping. Pure. Each node has nodeId / nodeKind / nodeRole / source ids / children /
 * propsMetadata / stateMetadata / permissionMetadata. NO React element, NO JSX, NO DOM node, NO
 * required real CSS class, NO real handler.
 *
 * @param {Object} [options]
 * @param {Object} [options.frameMapping]
 * @returns {Object} UI node contract
 */
export function createRuntimeUiNodeContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mapping = isGenericModelPlainObject(o.frameMapping) ? o.frameMapping : {};
  const moduleId = String(mapping.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule');
  const sections = Array.isArray(mapping.sections) ? mapping.sections : [];
  const slots = Array.isArray(mapping.slots) ? mapping.slots : [];

  const nodeKindFor = (placeholderKind) => {
    switch (String(placeholderKind || '')) {
      case 'VisualTablePlaceholder': return 'uiTable';
      case 'VisualFormPlaceholder': return 'uiForm';
      case 'VisualDetailPlaceholder': return 'uiDetail';
      case 'VisualLabelPlaceholder': return 'uiLabel';
      case 'VisualInputPlaceholder': return 'uiInputPlaceholder';
      case 'VisualButtonPlaceholder': return 'uiButtonPlaceholder';
      case 'VisualEmptyStatePlaceholder': return 'uiEmptyState';
      case 'VisualBlockedStatePlaceholder': return 'uiBlockedState';
      case 'VisualSectionPlaceholder': return 'uiSection';
      default: return 'uiRegion';
    }
  };

  const sectionNodes = sections.map((s, i) => ({
    nodeId: `node:section:${s.section}`,
    nodeKind: nodeKindFor(s.placeholderKind),
    nodeRole: 'region',
    sourcePlaceholderId: s.placeholderKind ?? null,
    sourceSectionId: s.section ?? null,
    sourceSlotId: null,
    order: i,
    children: slots.filter((sl) => typeof sl.slot === 'string').map((sl) => ({
      nodeId: `node:slot:${sl.slot}`,
      nodeKind: 'uiField',
      nodeRole: 'field',
      sourcePlaceholderId: sl.resolvedTo ?? null,
      sourceSectionId: s.section ?? null,
      sourceSlotId: sl.slot,
      children: [],
      propsMetadata: { readOnly: true, metadataOnly: true },
      stateMetadata: { metadataOnly: true },
      permissionMetadata: { defaultDeny: true, metadataOnly: true },
    })),
    propsMetadata: { metadataOnly: true },
    stateMetadata: { metadataOnly: true },
    permissionMetadata: { defaultDeny: true, metadataOnly: true },
  }));

  const core = {
    kind: 'runtime-ui-node-contract',
    moduleId,
    root: {
      nodeId: 'node:root',
      nodeKind: 'uiRoot',
      nodeRole: 'screen',
      sourcePlaceholderId: null,
      sourceSectionId: null,
      sourceSlotId: null,
      children: sectionNodes,
      propsMetadata: { metadataOnly: true },
      stateMetadata: { metadataOnly: true },
      permissionMetadata: { defaultDeny: true, metadataOnly: true },
    },
    nodeKinds: [...UI_NODE_KINDS],
    allNodeKindsKnown: sectionNodes.every((n) => UI_NODE_KINDS.includes(n.nodeKind)),
    reactElement: false,
    jsx: false,
    domNode: false,
    requiredRealCssClass: false,
    realHandler: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, nodeContractDigest: uiContractDigest(core) });
}

export default createRuntimeUiNodeContract;
