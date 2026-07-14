import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Declares the PERMISSION BOUNDARY contract. Pure, metadata-only. Fails closed: default deny,
 * permission required, tenant required, no admin bypass. These are contract hints inherited
 * from the visual contract's permission hints — not an enforcement engine.
 *
 * @param {Object} [options]
 * @param {Object} [options.visualContract] a dev preview visual contract
 * @returns {Object} permission boundary contract
 */
export function createDevPreviewRuntimeShellPermissionBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const vc = isGenericModelPlainObject(o.visualContract) ? o.visualContract : {};
  const hints = isGenericModelPlainObject(vc.visualTree?.permissionHints) ? vc.visualTree.permissionHints : {};

  const core = {
    kind: 'dev-preview-runtime-shell-permission-boundary',
    moduleId: String(vc.moduleId ?? 'plannedModule'),
    defaultDeny: hints.defaultDeny !== false,
    failClosed: hints.failClosed !== false,
    tenantRequired: hints.tenantRequired !== false,
    permissionRequired: true,
    adminBypass: false,
    enforcementEngine: false,
    grantsAccess: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, permissionBoundaryDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellPermissionBoundary;
