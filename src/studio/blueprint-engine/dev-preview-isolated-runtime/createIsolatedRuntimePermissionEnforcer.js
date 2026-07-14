import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Applies the PERMISSION ENFORCER for the isolated runtime. Pure — fails closed: default deny,
 * permission required, tenant required, no admin bypass. Inherited from the implementation
 * plan's permission enforcement plan. It grants no real access.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan]
 * @returns {Object} permission enforcer descriptor
 */
export function createIsolatedRuntimePermissionEnforcer(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const pe = isGenericModelPlainObject(plan.permissionEnforcement) ? plan.permissionEnforcement : {};

  const core = {
    kind: 'isolated-runtime-permission-enforcer',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    defaultDeny: pe.defaultDeny !== false,
    failClosed: pe.failClosed !== false,
    tenantRequired: pe.tenantRequired !== false,
    permissionRequired: pe.permissionRequired !== false,
    adminBypass: false,
    grantsRealAccess: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, permissionEnforcerDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimePermissionEnforcer;
