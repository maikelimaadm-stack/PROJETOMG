import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Builds metadata-only VISUAL SCREEN contracts for list/table, form, detail plus the empty,
 * loading, error and blocked state screens. Pure. Everything is metadata; renders nothing.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} visual screen contract
 */
export function createDevPreviewVisualScreenContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const bridge = isGenericModelPlainObject(o.bridge) ? o.bridge : {};

  const screen = (screenId, placeholderKind, extra = {}) => ({ screenId, placeholderKind, metadataOnly: true, componentCreated: false, ...extra });

  const core = {
    kind: 'dev-preview-visual-screen-contract',
    visualScreenVersion: 'dev-preview-visual-screen-contract@1.0.0',
    moduleId: String(bridge.moduleId ?? 'plannedModule'),
    screens: [
      screen('list', 'VisualTablePlaceholder'),
      screen('form', 'VisualFormPlaceholder'),
      screen('detail', 'VisualDetailPlaceholder', { readOnly: true }),
    ],
    stateScreens: [
      screen('empty', 'VisualEmptyStatePlaceholder'),
      screen('loading', 'VisualLoadingStatePlaceholder'),
      screen('error', 'VisualErrorStatePlaceholder'),
      screen('blocked', 'VisualBlockedStatePlaceholder'),
    ],
    requiredStateScreens: ['empty', 'loading', 'error', 'blocked'],
    react: false,
    dom: false,
    cssRuntime: false,
    routeCreated: false,
    metadataOnly: true,
  };

  return safeCloneGenericModel({ ...core, visualScreenDigest: visualDigest(core) });
}

export default createDevPreviewVisualScreenContract;
