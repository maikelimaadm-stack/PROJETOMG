import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Builds metadata-only VISUAL SECTION contracts (toolbar / table / form / detail /
 * diagnostics), describing ordering and placeholder grouping. Pure. No component, no DOM.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} visual section contract
 */
export function createDevPreviewVisualSectionContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : {};

  const section = (id, placeholderKind, order) => ({ sectionId: id, placeholderKind, order, metadataOnly: true, componentCreated: false });

  const core = {
    kind: 'dev-preview-visual-section-contract',
    moduleId: String(bridge.moduleId ?? 'plannedModule'),
    sections: [
      section('toolbar', 'VisualContainerPlaceholder', 1),
      section('table', 'VisualTablePlaceholder', 2),
      section('form', 'VisualFormPlaceholder', 3),
      section('detail', 'VisualDetailPlaceholder', 4),
      section('diagnostics', 'VisualContainerPlaceholder', 5),
    ],
    sectionOrder: ['toolbar', 'table', 'form', 'detail', 'diagnostics'],
    react: false,
    dom: false,
    cssRuntime: false,
    metadataOnly: true,
  };

  return safeCloneGenericModel({ ...core, visualSectionDigest: visualDigest(core) });
}

export default createDevPreviewVisualSectionContract;
