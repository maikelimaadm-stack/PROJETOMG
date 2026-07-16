import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Describes a single LAYOUT DRAFT — a temporary, non-canonical layout description within an authoring
 * draft. Metadata only: it declares no UI, no component, no DOM, no CSS. Pure and deterministic;
 * same input -> same descriptor + digest.
 *
 * @param {Object} [options]
 * @param {string} [options.sectionId]
 * @param {string} [options.layoutKind]
 * @param {string} [options.title]
 * @param {number} [options.order] non-negative order index
 * @param {string[]} [options.fieldKeys] field keys placed in this section (metadata references only)
 * @returns {Object}
 */
export function createLayoutDraftDescriptor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const sectionId = typeof o.sectionId === 'string' && o.sectionId.length > 0 ? o.sectionId : 'section';
  const layoutKind = typeof o.layoutKind === 'string' && o.layoutKind.length > 0 ? o.layoutKind : 'form_section';
  const title = typeof o.title === 'string' && o.title.length > 0 ? o.title : sectionId;
  const rawOrder = Number(o.order);
  const order = Number.isFinite(rawOrder) && rawOrder >= 0 ? Math.floor(rawOrder) : 0;
  const fieldKeys = Array.isArray(o.fieldKeys)
    ? o.fieldKeys.filter((k) => typeof k === 'string' && k.length > 0).map((k) => String(k))
    : [];

  const core = {
    kind: 'authoring-layout-draft-descriptor',
    layoutId: `layout:${sectionId}`,
    layoutKind,
    sectionId,
    title,
    order,
    sections: [{ sectionId, order, fieldKeys: [...fieldKeys] }],
    slots: fieldKeys.map((k, i) => ({ slotId: `slot:${k}`, fieldKey: k, order: i })),
    ordering: fieldKeys.map((k, i) => ({ fieldKey: k, order: i })),
    visibilityDescriptors: [{ target: sectionId, visible: true }],
    fieldKeys: [...fieldKeys],
    fieldCount: fieldKeys.length,
    synthetic: true,
    canonical: false,
    draftOnly: true,
    uiComponentCreated: false,
    domTouched: false,
    cssCreated: false,
  };
  return safeCloneGenericModel({ ...core, layoutDraftDigest: authoringFoundationDigest(core) });
}

export default createLayoutDraftDescriptor;
