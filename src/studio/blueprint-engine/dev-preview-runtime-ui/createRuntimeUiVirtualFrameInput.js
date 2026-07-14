import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * Consumes the isolated runtime's virtual preview frame (via the runtime UI contract's frame
 * mapping) as SYNTHETIC input for the isolated UI. No real read/write, no storage, no network.
 * Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function createRuntimeUiVirtualFrameInput(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const fm = isGenericModelPlainObject(c.frameMapping) ? c.frameMapping : {};
  const nodeContract = isGenericModelPlainObject(c.nodeContract) ? c.nodeContract : {};

  const rows = Array.isArray(fm.syntheticRows) ? fm.syntheticRows : [];
  const core = {
    kind: 'runtime-ui-virtual-frame-input',
    frameId: typeof fm.frameId === 'string' ? fm.frameId : 'virtual-frame',
    screenKind: typeof fm.screenKind === 'string' ? fm.screenKind : 'list',
    syntheticRowCount: rows.length,
    syntheticDataOnly: true,
    allRowsSynthetic: rows.every((r) => r && r.synthetic === true),
    rootNodeKind: isGenericModelPlainObject(nodeContract.root) ? String(nodeContract.root.nodeKind ?? 'uiRoot') : 'uiRoot',
    realDataRead: false,
    realDataWrite: false,
    usesStorage: false,
    usesNetwork: false,
  };
  return safeCloneGenericModel({ ...core, virtualFrameInputDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiVirtualFrameInput;
