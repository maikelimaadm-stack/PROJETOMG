import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Describes the lazy/dynamic import strategy for the preview. Metadata only — it performs no import.
 * Asserts the preview is loaded ONLY via a lazy/dynamic import gated behind a build-time
 * `import.meta.env.DEV` guard so the production bundle strips the preview chunk entirely; no eager
 * import; nothing mounts on module import. Pure and deterministic.
 * @returns {Object}
 */
export function createLazyPreviewLoader() {
  const core = {
    kind: 'app-integration-lazy-preview-loader',
    lazyImportUsed: true,
    dynamicImportUsed: true,
    eagerImportUsed: false,
    buildTimeDevGuarded: true,
    productionBundleContainsPreview: false,
    mountsOnImport: false,
    sideEffectOnImport: false,
    previewSubtree: 'src/studio/blueprint-engine/dev-preview-app-integration/',
    isolatedHostSubtree: 'src/studio/blueprint-engine/dev-preview-route-menu/',
  };
  return safeCloneGenericModel({ ...core, lazyPreviewLoaderDigest: appIntegrationDigest(core) });
}

export default createLazyPreviewLoader;
