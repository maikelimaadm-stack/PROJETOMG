import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ISOLATED_RUNTIME_NAME,
  ISOLATED_RUNTIME_VERSION,
  ISOLATED_RUNTIME_MODE,
  ISOLATED_RUNTIME_CAPABILITIES,
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  runtimeDigest,
} from './isolatedRuntimeConfig.js';

/**
 * Builds the isolated runtime MANIFEST — a self-describing, deterministic summary of the
 * produced parts plus the capability flags. Pure, metadata-only.
 *
 * @param {Object} [options]
 * @returns {Object} isolated runtime manifest
 */
export function createIsolatedRuntimeManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'isolated-runtime-manifest',
    isolatedRuntimeName: ISOLATED_RUNTIME_NAME,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    mode: ISOLATED_RUNTIME_MODE,
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    upstream: {
      implementationPlan: IMPLEMENTATION_PLAN_VERSION,
      runtimeShellContract: RUNTIME_SHELL_CONTRACT_VERSION,
      visualContract: VISUAL_CONTRACT_VERSION,
    },
    parts: {
      session: digestOf(parts.session, 'sessionDigest'),
      preflight: digestOf(parts.preflight, 'preflightDigest'),
      contractLoader: digestOf(parts.contractLoader, 'contractLoaderDigest'),
      syntheticData: digestOf(parts.syntheticData, 'syntheticDataDigest'),
      virtualFrame: digestOf(parts.virtualFrame, 'virtualFrameDigest'),
      placeholderResolver: digestOf(parts.placeholderResolver, 'placeholderResolverDigest'),
      lifecycle: digestOf(parts.lifecycle, 'lifecycleDigest'),
      eventDispatcher: digestOf(parts.eventDispatcher, 'eventDispatcherDigest'),
      renderRequest: digestOf(parts.renderRequest, 'renderRequestDigest'),
      stateContainer: digestOf(parts.stateContainer, 'stateContainerDigest'),
      permissionEnforcer: digestOf(parts.permissionEnforcer, 'permissionEnforcerDigest'),
      dataBoundary: digestOf(parts.dataBoundary, 'dataBoundaryDigest'),
      isolationBoundary: digestOf(parts.isolationBoundary, 'isolationBoundaryDigest'),
      manualGate: digestOf(parts.manualGate, 'manualGateDigest'),
      safetyPolicy: digestOf(parts.safetyPolicy, 'safetyPolicyDigest'),
    },
    capabilities: { ...ISOLATED_RUNTIME_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeManifest;
