import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the ACCESSIBILITY PROJECTION contract — metadata-only. Describes accessibility
 * intentions (labels required, aria metadata, keyboard plan, focus order) as metadata. It
 * touches NO DOM and sets no real aria attribute.
 *
 * @param {Object} [options]
 * @returns {Object} accessibility projection contract
 */
export function createRuntimeUiAccessibilityProjectionContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'runtime-ui-accessibility-projection-contract',
    moduleId: String(o.frameMapping?.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    labelsRequired: true,
    ariaMetadata: [
      { role: 'table', ariaLabelKey: 'screen.list.title', metadataOnly: true },
      { role: 'form', ariaLabelKey: 'screen.form.title', metadataOnly: true },
    ],
    keyboardPlan: { tabThroughFields: true, escapeCancels: true, metadataOnly: true },
    focusOrder: ['toolbar', 'table', 'form', 'detail'],
    blockedInteractionsAnnounced: true,
    domTouched: false,
    setsRealAria: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, accessibilityProjectionDigest: uiContractDigest(core) });
}

export default createRuntimeUiAccessibilityProjectionContract;
