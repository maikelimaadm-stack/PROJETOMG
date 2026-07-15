import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_CONTRACT_NAME,
  APP_INTEGRATION_CONTRACT_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  APP_INTEGRATION_CONTRACT_CAPABILITIES,
  appIntegrationDigest,
} from './appIntegrationContractConfig.js';
import { createAppIntegrationContractSession } from './createAppIntegrationContractSession.js';
import { createAppAttachmentPointContract } from './createAppAttachmentPointContract.js';
import { createDevOnlyFeatureFlagContract } from './createDevOnlyFeatureFlagContract.js';
import { createProductIsolationContract } from './createProductIsolationContract.js';
import { createAppBootstrapBoundaryContract } from './createAppBootstrapBoundaryContract.js';
import { createRouterAttachmentContract } from './createRouterAttachmentContract.js';
import { createRouteExposureContract } from './createRouteExposureContract.js';
import { createMenuExposureContract } from './createMenuExposureContract.js';
import { createRuntimeUiMountAdapterContract } from './createRuntimeUiMountAdapterContract.js';
import { createDependencyInjectionBoundaryContract } from './createDependencyInjectionBoundaryContract.js';
import { createLifecycleCleanupContract } from './createLifecycleCleanupContract.js';
import { createFailureContainmentContract } from './createFailureContainmentContract.js';
import { createOwnershipRollbackContract } from './createOwnershipRollbackContract.js';
import { createProductionStagingDenialContract } from './createProductionStagingDenialContract.js';
import { createPrototypeRelinkProhibitionContract } from './createPrototypeRelinkProhibitionContract.js';
import { createAppIntegrationManualEnablementGateContract } from './createAppIntegrationManualEnablementGateContract.js';
import { createAppIntegrationSafetyContract } from './createAppIntegrationSafetyContract.js';

/**
 * Builds the contract manifest with deterministic digests for every part. Pure — can build
 * standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createAppIntegrationManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const r = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createAppIntegrationContractSession({ routeMenuRuntime: r });
  const attachmentPoint = p.attachmentPoint ?? createAppAttachmentPointContract({ routeMenuRuntime: r });
  const featureFlag = p.featureFlag ?? createDevOnlyFeatureFlagContract();
  const productIsolation = p.productIsolation ?? createProductIsolationContract();
  const bootstrapBoundary = p.bootstrapBoundary ?? createAppBootstrapBoundaryContract();
  const routerAttachment = p.routerAttachment ?? createRouterAttachmentContract();
  const routeExposure = p.routeExposure ?? createRouteExposureContract();
  const menuExposure = p.menuExposure ?? createMenuExposureContract();
  const runtimeUiMountAdapter = p.runtimeUiMountAdapter ?? createRuntimeUiMountAdapterContract();
  const dependencyInjectionBoundary = p.dependencyInjectionBoundary ?? createDependencyInjectionBoundaryContract();
  const lifecycleCleanup = p.lifecycleCleanup ?? createLifecycleCleanupContract();
  const failureContainment = p.failureContainment ?? createFailureContainmentContract();
  const ownershipRollback = p.ownershipRollback ?? createOwnershipRollbackContract();
  const productionStagingDenial = p.productionStagingDenial ?? createProductionStagingDenialContract();
  const prototypeRelinkProhibition = p.prototypeRelinkProhibition ?? createPrototypeRelinkProhibitionContract();
  const manualGate = p.manualGate ?? createAppIntegrationManualEnablementGateContract();
  const safety = p.safety ?? createAppIntegrationSafetyContract();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    attachmentPoint: attachmentPoint.attachmentPointDigest,
    featureFlag: featureFlag.featureFlagDigest,
    productIsolation: productIsolation.productIsolationDigest,
    bootstrapBoundary: bootstrapBoundary.bootstrapBoundaryDigest,
    routerAttachment: routerAttachment.routerAttachmentDigest,
    routeExposure: routeExposure.routeExposureDigest,
    menuExposure: menuExposure.menuExposureDigest,
    runtimeUiMountAdapter: runtimeUiMountAdapter.runtimeUiMountAdapterDigest,
    dependencyInjectionBoundary: dependencyInjectionBoundary.dependencyInjectionBoundaryDigest,
    lifecycleCleanup: lifecycleCleanup.lifecycleCleanupDigest,
    failureContainment: failureContainment.failureContainmentDigest,
    ownershipRollback: ownershipRollback.ownershipRollbackDigest,
    productionStagingDenial: productionStagingDenial.productionStagingDenialDigest,
    prototypeRelinkProhibition: prototypeRelinkProhibition.prototypeRelinkProhibitionDigest,
    manualGate: manualGate.manualEnablementGateDigest,
    safety: safety.safetyDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'app-integration-contract-manifest',
    appIntegrationContractName: APP_INTEGRATION_CONTRACT_NAME,
    appIntegrationContractVersion: APP_INTEGRATION_CONTRACT_VERSION,
    upstream: {
      routeMenuRuntime: ROUTE_MENU_VERSION,
      runtimeUi: RUNTIME_UI_VERSION,
    },
    parts,
    capabilities: { ...APP_INTEGRATION_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationManifest;
