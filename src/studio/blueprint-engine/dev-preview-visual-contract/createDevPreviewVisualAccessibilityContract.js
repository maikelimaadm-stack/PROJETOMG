import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Declares the VISUAL ACCESSIBILITY contract. Pure, metadata-only. Describes accessibility
 * intentions (labels required, aria metadata placeholders, keyboard plan, focus order, blocked
 * interactions announced) as metadata. It touches NO DOM and sets no real aria attribute.
 *
 * @param {Object} [options]
 * @returns {Object} visual accessibility contract
 */
export function createDevPreviewVisualAccessibilityContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'dev-preview-visual-accessibility-contract',
    moduleId: String(o.bridge?.moduleId ?? 'plannedModule'),
    labelsRequired: true,
    ariaMetadataPlaceholders: [
      { role: 'table', ariaLabelKey: 'screen.list.title', metadataOnly: true },
      { role: 'form', ariaLabelKey: 'screen.form.title', metadataOnly: true },
      { role: 'region', ariaLabelKey: 'screen.detail.title', metadataOnly: true },
    ],
    keyboardPlan: {
      tabThroughFields: true,
      escapeCancels: true,
      metadataOnly: true,
    },
    focusOrder: ['toolbar', 'table', 'form', 'detail'],
    blockedInteractionsAnnounced: true,
    domTouched: false,
    setsRealAria: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, visualAccessibilityDigest: visualDigest(core) });
}

export default createDevPreviewVisualAccessibilityContract;
