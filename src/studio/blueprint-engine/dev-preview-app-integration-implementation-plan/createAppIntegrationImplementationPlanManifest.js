import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_CONTRACT_VERSION,
  ROUTE_MENU_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES,
  appIntegrationPlanDigest,
} from './appIntegrationImplementationPlanConfig.js';
import { createAppIntegrationImplementationPlanSession } from './createAppIntegrationImplementationPlanSession.js';
import { createAppIntegrationImplementationPhases } from './createAppIntegrationImplementationPhases.js';
import { createAppTouchBoundaryPlan } from './createAppTouchBoundaryPlan.js';
import { createProductionUiGuardExtensionPlan } from './createProductionUiGuardExtensionPlan.js';
import { createFeatureFlagImplementationPlan } from './createFeatureFlagImplementationPlan.js';
import { createAppAttachmentImplementationPlan } from './createAppAttachmentImplementationPlan.js';
import { createRouterExposureImplementationPlan } from './createRouterExposureImplementationPlan.js';
import { createMenuSidebarExposureImplementationPlan } from './createMenuSidebarExposureImplementationPlan.js';
import { createRuntimeUiMountImplementationPlan } from './createRuntimeUiMountImplementationPlan.js';
import { createDependencyInjectionImplementationPlan } from './createDependencyInjectionImplementationPlan.js';
import { createLifecycleCleanupImplementationPlan } from './createLifecycleCleanupImplementationPlan.js';
import { createFailureContainmentImplementationPlan } from './createFailureContainmentImplementationPlan.js';
import { createProductionStagingFailClosedPlan } from './createProductionStagingFailClosedPlan.js';
import { createPrototypeRelinkStaticAssertionPlan } from './createPrototypeRelinkStaticAssertionPlan.js';
import { createAppIntegrationTestHarnessPlan } from './createAppIntegrationTestHarnessPlan.js';
import { createAppIntegrationManualEnablementGatePlan } from './createAppIntegrationManualEnablementGatePlan.js';
import { createAppIntegrationRolloutRollbackPlan } from './createAppIntegrationRolloutRollbackPlan.js';
import { createAppIntegrationObservabilityDiagnosticsPlan } from './createAppIntegrationObservabilityDiagnosticsPlan.js';
import { createAppIntegrationGovernanceRegistryPlan } from './createAppIntegrationGovernanceRegistryPlan.js';
import { createAppIntegrationSafetyPlan } from './createAppIntegrationSafetyPlan.js';

/**
 * Builds the plan manifest with deterministic digests for every plan part. Pure — can build
 * standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.appIntegrationContract]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createAppIntegrationImplementationPlanManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.appIntegrationContract) ? o.appIntegrationContract : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createAppIntegrationImplementationPlanSession({ appIntegrationContract: c });
  const phases = p.phases ?? createAppIntegrationImplementationPhases();
  const appTouchBoundary = p.appTouchBoundary ?? createAppTouchBoundaryPlan();
  const productionUiGuardExtension = p.productionUiGuardExtension ?? createProductionUiGuardExtensionPlan();
  const featureFlag = p.featureFlag ?? createFeatureFlagImplementationPlan();
  const appAttachment = p.appAttachment ?? createAppAttachmentImplementationPlan({ appIntegrationContract: c });
  const routerExposure = p.routerExposure ?? createRouterExposureImplementationPlan();
  const menuSidebarExposure = p.menuSidebarExposure ?? createMenuSidebarExposureImplementationPlan();
  const runtimeUiMount = p.runtimeUiMount ?? createRuntimeUiMountImplementationPlan();
  const dependencyInjection = p.dependencyInjection ?? createDependencyInjectionImplementationPlan();
  const lifecycleCleanup = p.lifecycleCleanup ?? createLifecycleCleanupImplementationPlan();
  const failureContainment = p.failureContainment ?? createFailureContainmentImplementationPlan();
  const productionStagingFailClosed = p.productionStagingFailClosed ?? createProductionStagingFailClosedPlan();
  const prototypeRelinkStaticAssertion = p.prototypeRelinkStaticAssertion ?? createPrototypeRelinkStaticAssertionPlan();
  const testHarness = p.testHarness ?? createAppIntegrationTestHarnessPlan();
  const manualGate = p.manualGate ?? createAppIntegrationManualEnablementGatePlan();
  const rolloutRollback = p.rolloutRollback ?? createAppIntegrationRolloutRollbackPlan();
  const observability = p.observability ?? createAppIntegrationObservabilityDiagnosticsPlan();
  const governanceRegistry = p.governanceRegistry ?? createAppIntegrationGovernanceRegistryPlan();
  const safety = p.safety ?? createAppIntegrationSafetyPlan();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    phases: phases.phasesDigest,
    appTouchBoundary: appTouchBoundary.appTouchBoundaryPlanDigest,
    productionUiGuardExtension: productionUiGuardExtension.productionUiGuardExtensionPlanDigest,
    featureFlag: featureFlag.featureFlagImplementationPlanDigest,
    appAttachment: appAttachment.appAttachmentImplementationPlanDigest,
    routerExposure: routerExposure.routerExposureImplementationPlanDigest,
    menuSidebarExposure: menuSidebarExposure.menuSidebarExposureImplementationPlanDigest,
    runtimeUiMount: runtimeUiMount.runtimeUiMountImplementationPlanDigest,
    dependencyInjection: dependencyInjection.dependencyInjectionImplementationPlanDigest,
    lifecycleCleanup: lifecycleCleanup.lifecycleCleanupImplementationPlanDigest,
    failureContainment: failureContainment.failureContainmentImplementationPlanDigest,
    productionStagingFailClosed: productionStagingFailClosed.productionStagingFailClosedPlanDigest,
    prototypeRelinkStaticAssertion: prototypeRelinkStaticAssertion.prototypeRelinkStaticAssertionPlanDigest,
    testHarness: testHarness.testHarnessPlanDigest,
    manualGate: manualGate.manualEnablementGatePlanDigest,
    rolloutRollback: rolloutRollback.rolloutRollbackPlanDigest,
    observability: observability.observabilityDiagnosticsPlanDigest,
    governanceRegistry: governanceRegistry.governanceRegistryPlanDigest,
    safety: safety.safetyPlanDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'app-integration-implementation-plan-manifest',
    appIntegrationImplementationPlanName: APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
    appIntegrationImplementationPlanVersion: APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
    upstream: {
      appIntegrationContract: APP_INTEGRATION_CONTRACT_VERSION,
      routeMenuRuntime: ROUTE_MENU_VERSION,
    },
    parts,
    capabilities: { ...APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationImplementationPlanManifest;
