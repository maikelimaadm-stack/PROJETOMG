import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_NAME,
  APP_INTEGRATION_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  STUDIO_DEV_PREVIEW_ROUTE_PATH,
  APP_INTEGRATION_CAPABILITIES,
  appIntegrationDigest,
} from './appIntegrationConfig.js';
import { createAppIntegrationSession } from './createAppIntegrationSession.js';
import { createStudioDevPreviewFeatureGate } from './createStudioDevPreviewFeatureGate.js';
import { createStudioDevPreviewCheckpointReceipt } from './createStudioDevPreviewCheckpointReceipt.js';
import { createAppAttachmentDescriptor } from './createAppAttachmentDescriptor.js';
import { createLazyPreviewLoader } from './createLazyPreviewLoader.js';
import { createRuntimeUiMountRequest } from './createRuntimeUiMountRequest.js';
import { createFailureContainment } from './createFailureContainment.js';
import { createAppIntegrationRollback } from './createAppIntegrationRollback.js';

/**
 * Builds the integration manifest with deterministic digests for each part. Pure — can build
 * standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createAppIntegrationManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createAppIntegrationSession({});
  const featureGate = p.featureGate ?? createStudioDevPreviewFeatureGate({});
  const checkpointReceipt = p.checkpointReceipt ?? createStudioDevPreviewCheckpointReceipt({});
  const appAttachment = p.appAttachment ?? createAppAttachmentDescriptor();
  const lazyPreviewLoader = p.lazyPreviewLoader ?? createLazyPreviewLoader();
  const mountRequest = p.mountRequest ?? createRuntimeUiMountRequest({});
  const failureContainment = p.failureContainment ?? createFailureContainment();
  const rollback = p.rollback ?? createAppIntegrationRollback();

  const parts = {
    session: session.sessionDigest,
    featureGate: featureGate.featureGateDigest,
    checkpointReceipt: checkpointReceipt.checkpointReceiptDigest,
    appAttachment: appAttachment.appAttachmentDigest,
    lazyPreviewLoader: lazyPreviewLoader.lazyPreviewLoaderDigest,
    mountRequest: mountRequest.mountRequestDigest,
    failureContainment: failureContainment.failureContainmentDigest,
    rollback: rollback.rollbackDigest,
  };

  const core = {
    kind: 'app-integration-manifest',
    appIntegrationName: APP_INTEGRATION_NAME,
    appIntegrationVersion: APP_INTEGRATION_VERSION,
    routePath: STUDIO_DEV_PREVIEW_ROUTE_PATH,
    upstream: {
      routeMenuRuntime: ROUTE_MENU_VERSION,
      runtimeUi: RUNTIME_UI_VERSION,
    },
    parts,
    capabilities: { ...APP_INTEGRATION_CAPABILITIES },
  };
  return safeCloneGenericModel({ ...core, manifestDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationManifest;
