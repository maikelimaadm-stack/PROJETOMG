import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ALLOWED_MOUNT_TARGET_KINDS, BLOCKED_MOUNT_TARGET_KINDS, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the MOUNT BOUNDARY metadata for a future shell. Pure, metadata-only. Describes
 * which mount target kinds the shell WOULD accept (headless hosts) and which are permanently
 * blocked (dom node / react root / document body / iframe / router / menu / production /
 * staging). It mounts NOTHING: no DOM, no React, no CSS injection.
 *
 * @param {Object} [options]
 * @returns {Object} mount boundary metadata
 */
export function createDevPreviewRuntimeShellMountBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.visualContract?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-runtime-shell-mount-boundary',
    mountBoundaryId: `${moduleId}#mount-boundary`,
    moduleId,
    mountMode: 'headless_metadata_only',
    allowedMountTargetKinds: [...ALLOWED_MOUNT_TARGET_KINDS],
    blockedMountTargetKinds: [...BLOCKED_MOUNT_TARGET_KINDS],
    mountCreated: false,
    domTouched: false,
    reactMounted: false,
    cssInjected: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, mountBoundaryDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellMountBoundary;
