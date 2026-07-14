import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_SHELL_CONTRACT_NAME,
  RUNTIME_SHELL_CONTRACT_VERSION,
  RUNTIME_SHELL_CONTRACT_MODE,
  RUNTIME_SHELL_HEADLESS_CAPABILITIES,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  shellDigest,
} from './devPreviewRuntimeShellContractConfig.js';

/**
 * Builds the dev preview runtime shell MANIFEST — a self-describing, deterministic summary of
 * the produced parts plus the headless capability flags. Pure, metadata-only.
 *
 * @param {Object} [options]
 * @returns {Object} runtime shell manifest
 */
export function createDevPreviewRuntimeShellManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const digestOf = (part, key) => (isGenericModelPlainObject(part) && typeof part[key] === 'string' ? part[key] : null);

  const core = {
    kind: 'dev-preview-runtime-shell-manifest',
    runtimeShellContractName: RUNTIME_SHELL_CONTRACT_NAME,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    mode: RUNTIME_SHELL_CONTRACT_MODE,
    moduleId: String(o.visualContract?.moduleId ?? 'plannedModule'),
    upstream: {
      visualContract: VISUAL_CONTRACT_VERSION,
      bridgeContract: DEV_PREVIEW_BRIDGE_VERSION,
      engineContract: STUDIO_BLUEPRINT_ENGINE_VERSION,
    },
    parts: {
      session: digestOf(parts.session, 'sessionDigest'),
      lifecycle: digestOf(parts.lifecycle, 'lifecycleDigest'),
      mountBoundary: digestOf(parts.mountBoundary, 'mountBoundaryDigest'),
      eventContract: digestOf(parts.eventContract, 'eventContractDigest'),
      renderRequest: digestOf(parts.renderRequest, 'renderRequestDigest'),
      stateBoundary: digestOf(parts.stateBoundary, 'stateBoundaryDigest'),
      errorBoundary: digestOf(parts.errorBoundary, 'errorBoundaryDigest'),
      permissionBoundary: digestOf(parts.permissionBoundary, 'permissionBoundaryDigest'),
      dataBoundary: digestOf(parts.dataBoundary, 'dataBoundaryDigest'),
      isolation: digestOf(parts.isolation, 'isolationDigest'),
      policy: digestOf(parts.policy, 'policyDigest'),
      routeBlocked: digestOf(parts.routeBlocked, 'routeBlockedDigest'),
      placementBlocked: digestOf(parts.placementBlocked, 'placementBlockedDigest'),
      safety: digestOf(parts.safety, 'safetyDigest'),
      readiness: digestOf(parts.readiness, 'readinessDigest'),
    },
    capabilities: { ...RUNTIME_SHELL_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellManifest;
