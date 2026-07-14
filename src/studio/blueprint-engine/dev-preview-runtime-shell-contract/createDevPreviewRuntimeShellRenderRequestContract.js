import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the RENDER REQUEST contract. Pure, metadata-only. Describes the shape of a future
 * render request (digests of the visual tree / screen / placeholder registry / state /
 * permissions) as metadata. `renderAllowed` is permanently `false` — this slice authorizes no
 * render.
 *
 * @param {Object} [options]
 * @param {Object} [options.visualContract] a dev preview visual contract
 * @returns {Object} render request contract
 */
export function createDevPreviewRuntimeShellRenderRequestContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const vc = isGenericModelPlainObject(o.visualContract) ? o.visualContract : {};
  const moduleId = String(vc.moduleId ?? 'plannedModule');

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'dev-preview-runtime-shell-render-request-contract',
    requestId: shellDigest({ moduleId, source: vc.overallDigest ?? null, purpose: 'render-request' }),
    moduleId,
    visualTreeDigest: digestOf(vc.visualTree, 'visualTreeDigest'),
    screenDigest: digestOf(vc.visualScreen, 'visualScreenDigest'),
    placeholderRegistryDigest: digestOf(vc.placeholderRegistry, 'placeholderRegistryDigest'),
    stateDigest: digestOf(vc.visualState, 'visualStateDigest'),
    permissionsDigest: digestOf(vc.readinessDecision, 'readinessDigest'),
    renderAllowed: false,
    reason: 'requires future explicit runtime implementation slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, renderRequestDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellRenderRequestContract;
