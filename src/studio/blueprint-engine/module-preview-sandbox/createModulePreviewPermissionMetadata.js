import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds PERMISSION preview metadata. Pure. Default-deny / fail-closed; admin does not
 * bypass tenant; protected fields require explicit permission; mutation permissions
 * default false; production requires a future policy. No real permission is created.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} permission preview metadata
 */
export function createModulePreviewPermissionMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const ftf = isGenericModelPlainObject(plan.fieldTableFormPlan) ? plan.fieldTableFormPlan : {};
  const protectedFields = Array.isArray(ftf.protectedFields) ? ftf.protectedFields : [];
  const tenantFields = Array.isArray(ftf.tenantFields) ? ftf.tenantFields : [];

  const perm = (action, enabled) => ({ action, enabledByDefault: enabled === true, requiresPermission: true, requiresTenant: true });

  const core = {
    kind: 'module-preview-permission-metadata',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    permissionMode: 'default_deny_fail_closed',
    defaultDeny: true,
    failClosed: true,
    tenantRequired: true,
    permissionRequired: true,
    adminBypassesTenant: false,
    modulePermissions: [perm('read', true), perm('create', false), perm('update', false), perm('delete', false), perm('export', false), perm('configure', false)],
    screenPermissions: [{ screen: 'table', action: 'read', enabledByDefault: true }, { screen: 'form', action: 'read', enabledByDefault: true }, { screen: 'detail', action: 'read', enabledByDefault: true }],
    fieldPermissions: protectedFields.map((name) => ({ field: name, requiresExplicitPermission: true, visibleByDefault: false })),
    rowPermissions: [{ level: 'row', preservesTenant: true }],
    tenantPermissions: tenantFields.map((name) => ({ field: name, tenantScoped: true })),
    deniedByDefault: ['create', 'update', 'delete', 'export', 'configure'],
    mutationPermissionsDefaultFalse: true,
    productionRequiresFuturePolicy: true,
    createsRealPermission: false,
    previewOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, permissionPreviewDigest: sandboxDigest(core) });
}

export default createModulePreviewPermissionMetadata;
