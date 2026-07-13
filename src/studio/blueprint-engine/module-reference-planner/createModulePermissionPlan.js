import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

const ACTIONS = ['read', 'create', 'update', 'delete', 'export', 'configure', 'diagnostics', 'admin'];
const LEVELS = ['module', 'screen', 'field', 'row', 'tenant'];

/**
 * Plans the PERMISSIONS a module WOULD need. Pure. Default-deny / fail-closed: only
 * `read` is enabled by default; delete and mutation never start enabled; admin does not
 * bypass tenant; protected fields need field-level visibility. No real permission is
 * created (plannedOnly).
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} permission plan
 */
export function createModulePermissionPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};
  const hasTenantField = Array.isArray(b.fields) && b.fields.some((f) => isGenericModelPlainObject(f) && f.tenantScoped === true);

  const permissions = ACTIONS.map((action) => ({
    action,
    levels: [...LEVELS],
    enabledByDefault: action === 'read', // only read starts enabled
    requiresPermission: true,
    requiresTenant: true,
  }));

  const core = {
    kind: 'module-permission-plan',
    moduleId: String(b.moduleId ?? 'plannedModule').trim(),
    permissions,
    actions: [...ACTIONS],
    levels: [...LEVELS],
    defaultDeny: true,
    failClosed: true,
    permissionRequired: true,
    tenantRequired: true,
    adminBypassesTenant: false,
    deleteEnabledByDefault: false,
    mutationEnabledByDefault: false,
    fieldLevelVisibilityRequiredForProtected: true,
    rowLevelAccessPreservesTenant: true,
    hasTenantField,
    createsRealPermission: false,
    plannedOnly: true,
  };

  return safeCloneGenericModel({ ...core, permissionPlanDigest: plannerDigest(core) });
}

export default createModulePermissionPlan;
