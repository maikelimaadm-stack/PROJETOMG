import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the COMPONENT BINDING contract — metadata-only mapping between a contractual
 * placeholder and a future visual component kind. Pure. `bindingAllowed` is `false`,
 * `realComponentPath` is `null`, and react/jsx/tsx/dom are all `false`. No binding is executed.
 *
 * @param {Object} [options]
 * @param {Object} [options.frameMapping]
 * @returns {Object} component binding contract
 */
const FUTURE_COMPONENT_KIND = {
  VisualTablePlaceholder: 'FutureDataTable',
  VisualFormPlaceholder: 'FutureForm',
  VisualDetailPlaceholder: 'FutureDetail',
  VisualLabelPlaceholder: 'FutureLabel',
  VisualInputPlaceholder: 'FutureInput',
  VisualButtonPlaceholder: 'FutureButton',
  VisualEmptyStatePlaceholder: 'FutureEmptyState',
  VisualBlockedStatePlaceholder: 'FutureBlockedState',
  VisualSectionPlaceholder: 'FutureSection',
  VisualContainerPlaceholder: 'FutureContainer',
};

export function createRuntimeUiComponentBindingContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mapping = isGenericModelPlainObject(o.frameMapping) ? o.frameMapping : {};
  const placeholders = Array.isArray(mapping.placeholders) ? mapping.placeholders : [];

  const uniqueKinds = [...new Set(placeholders.filter((p) => typeof p === 'string'))];

  const bindings = uniqueKinds.map((placeholderKind) => ({
    placeholderKind,
    bindingKind: 'placeholder-to-future-component',
    futureComponentKind: FUTURE_COMPONENT_KIND[placeholderKind] ?? 'FutureContainer',
    bindingAllowed: false,
    realComponentPath: null,
    reactComponent: false,
    jsx: false,
    tsx: false,
    dom: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'runtime-ui-component-binding-contract',
    moduleId: String(mapping.moduleId ?? 'plannedModule'),
    bindings: bindings.length > 0 ? bindings : [{ placeholderKind: 'VisualContainerPlaceholder', bindingKind: 'placeholder-to-future-component', futureComponentKind: 'FutureContainer', bindingAllowed: false, realComponentPath: null, reactComponent: false, jsx: false, tsx: false, dom: false, metadataOnly: true }],
    anyBindingAllowed: false,
    anyRealComponentPath: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, componentBindingDigest: uiContractDigest(core) });
}

export default createRuntimeUiComponentBindingContract;
