import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Declares the VISUAL ADAPTER contract: the metadata a future (still-blocked) visual slice
 * would need to bind render/layout/screen schemas to placeholder components. Pure,
 * metadata-only. It describes the adapter surface; it does NOT implement any adapter, mount
 * anything, touch the DOM, or import a component.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} visual adapter contract
 */
export function createDevPreviewVisualAdapterContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.sandbox?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-visual-adapter-contract',
    adapterVersion: 'dev-preview-visual-adapter-contract@1.0.0',
    moduleId,
    inputs: ['renderSchema', 'layoutSchema', 'screenSchema', 'allowedComponentContract'],
    outputs: ['placeholderTree'],
    bindingStrategy: 'metadata-only',
    requiresReact: false,
    requiresDom: false,
    requiresCss: false,
    mountsAnything: false,
    importsComponent: false,
    adapterImplemented: false,
    metadataOnly: true,
    downstreamSlice: 'ready_for_dev_preview_visual_contract_slice',
  };
  return safeCloneGenericModel({ ...core, visualAdapterDigest: bridgeDigest(core) });
}

export default createDevPreviewVisualAdapterContract;
