import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the PERMISSION ENFORCEMENT plan. Pure, metadata-only. Fails closed: default deny,
 * permission required, tenant required, no admin bypass. Inherited from the runtime shell
 * contract's permission boundary — a contract hint, not an enforcement engine.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeShellContract]
 * @returns {Object} permission enforcement plan
 */
export function createIsolatedRuntimePermissionEnforcementPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const rs = isGenericModelPlainObject(o.runtimeShellContract) ? o.runtimeShellContract : {};
  const pb = isGenericModelPlainObject(rs.permissionBoundary) ? rs.permissionBoundary : {};

  const core = {
    kind: 'isolated-runtime-permission-enforcement-plan',
    moduleId: String(rs.moduleId ?? 'plannedModule'),
    defaultDeny: pb.defaultDeny !== false,
    failClosed: pb.failClosed !== false,
    tenantRequired: pb.tenantRequired !== false,
    permissionRequired: pb.permissionRequired !== false,
    adminBypass: false,
    enforcementEngine: false,
    grantsAccess: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, permissionEnforcementDigest: planDigest(core) });
}

export default createIsolatedRuntimePermissionEnforcementPlan;
