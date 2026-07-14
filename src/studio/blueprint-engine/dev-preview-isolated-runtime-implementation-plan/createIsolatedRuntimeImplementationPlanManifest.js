import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  IMPLEMENTATION_PLAN_NAME,
  IMPLEMENTATION_PLAN_VERSION,
  IMPLEMENTATION_PLAN_MODE,
  IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  planDigest,
} from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Builds the implementation plan MANIFEST — a self-describing, deterministic summary of the
 * produced parts plus the headless capability flags. Pure, metadata-only.
 *
 * @param {Object} [options]
 * @returns {Object} implementation plan manifest
 */
export function createIsolatedRuntimeImplementationPlanManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'isolated-runtime-implementation-plan-manifest',
    implementationPlanName: IMPLEMENTATION_PLAN_NAME,
    implementationPlanVersion: IMPLEMENTATION_PLAN_VERSION,
    mode: IMPLEMENTATION_PLAN_MODE,
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    upstream: {
      runtimeShellContract: RUNTIME_SHELL_CONTRACT_VERSION,
      visualContract: VISUAL_CONTRACT_VERSION,
      engineContract: STUDIO_BLUEPRINT_ENGINE_VERSION,
    },
    parts: {
      session: digestOf(parts.session, 'sessionDigest'),
      phases: digestOf(parts.phases, 'phasesDigest'),
      boundaryPlan: digestOf(parts.boundaryPlan, 'boundaryPlanDigest'),
      executionPolicy: digestOf(parts.executionPolicy, 'executionPolicyDigest'),
      adapterPlan: digestOf(parts.adapterPlan, 'adapterPlanDigest'),
      renderPipeline: digestOf(parts.renderPipeline, 'renderPipelineDigest'),
      lifecycleExecution: digestOf(parts.lifecycleExecution, 'lifecycleExecutionDigest'),
      eventHandling: digestOf(parts.eventHandling, 'eventHandlingDigest'),
      dataAccessBlocked: digestOf(parts.dataAccessBlocked, 'dataAccessBlockedDigest'),
      permissionEnforcement: digestOf(parts.permissionEnforcement, 'permissionEnforcementDigest'),
      testHarness: digestOf(parts.testHarness, 'testHarnessDigest'),
      rolloutRollback: digestOf(parts.rolloutRollback, 'rolloutRollbackDigest'),
      observabilityDiagnostics: digestOf(parts.observabilityDiagnostics, 'observabilityDiagnosticsDigest'),
      routeBlocked: digestOf(parts.routeBlocked, 'routeBlockedDigest'),
      placementBlocked: digestOf(parts.placementBlocked, 'placementBlockedDigest'),
      safetyPlan: digestOf(parts.safetyPlan, 'safetyPlanDigest'),
      readiness: digestOf(parts.readiness, 'readinessDigest'),
    },
    capabilities: { ...IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: planDigest(core) });
}

export default createIsolatedRuntimeImplementationPlanManifest;
