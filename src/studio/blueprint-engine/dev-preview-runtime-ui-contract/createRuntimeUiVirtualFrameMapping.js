import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Maps the isolated runtime's VIRTUAL PREVIEW FRAME into a UI-contract mapping. Pure,
 * metadata-only. It copies frame metadata (ids, digests, sections, slots, placeholders,
 * synthetic rows/fields, blocked actions, permission hints, state) into a stable mapping — it
 * builds NO React element, NO DOM, NO CSS.
 *
 * @param {Object} [options]
 * @param {Object} [options.isolatedRuntime]
 * @returns {Object} virtual frame mapping
 */
export function createRuntimeUiVirtualFrameMapping(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ir = isGenericModelPlainObject(o.isolatedRuntime) ? o.isolatedRuntime : {};
  const frame = isGenericModelPlainObject(ir.virtualFrame) ? ir.virtualFrame : {};

  const arr = (v) => (Array.isArray(v) ? v : []);

  const core = {
    kind: 'runtime-ui-virtual-frame-mapping',
    moduleId: String(ir.moduleId ?? 'plannedModule'),
    frameId: typeof frame.frameId === 'string' ? frame.frameId : null,
    frameVersion: typeof frame.frameVersion === 'string' ? frame.frameVersion : null,
    sourceDigests: isGenericModelPlainObject(frame.sourceDigests) ? { ...frame.sourceDigests } : {},
    screenKind: typeof frame.screenKind === 'string' ? frame.screenKind : 'list',
    sections: arr(frame.sections).map((s) => ({ section: s.section, placeholderKind: s.placeholderKind })),
    slots: arr(frame.slots).map((s) => ({ slot: s.slot, resolvedTo: s.resolvedTo })),
    placeholders: arr(frame.placeholders),
    syntheticRows: arr(frame.syntheticRows).map((r) => ({ rowId: r.rowId, synthetic: r.synthetic === true })),
    syntheticFields: arr(frame.syntheticFields).map((f) => ({ name: f.name, synthetic: f.synthetic === true })),
    blockedActions: arr(frame.blockedActions).map((a) => ({ action: a.action, blocked: a.blocked === true })),
    permissionHints: isGenericModelPlainObject(frame.permissionHints) ? { ...frame.permissionHints } : {},
    state: typeof frame.state === 'string' ? frame.state : 'ready',
    diagnostics: { passive: true },
    reactElement: false,
    domNode: false,
    cssRuntime: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, frameMappingDigest: uiContractDigest(core) });
}

export default createRuntimeUiVirtualFrameMapping;
