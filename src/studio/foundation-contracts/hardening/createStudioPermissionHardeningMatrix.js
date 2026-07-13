import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_PERMISSION_ACTIONS } from '../createStudioPermissionBlueprintContract.js';

const ACTIONS = new Set(STUDIO_PERMISSION_ACTIONS);

/**
 * Classifies a permission descriptor for a module. Pure. Fail-closed / default-deny:
 * absence blocks, admin never bypasses tenant, mutation/delete never start enabled.
 * @param {unknown} permission
 * @param {{ moduleId?: string }} [ctx]
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateStudioPermission(permission, ctx = {}) {
  const p = isGenericModelPlainObject(permission) ? permission : null;
  const moduleId = typeof ctx.moduleId === 'string' ? ctx.moduleId : 'module';
  /** @type {string[]} */ const reasons = [];

  if (p === null) { reasons.push('permission missing'); return { valid: false, blocked: true, reasons }; }
  if (Object.keys(p).length === 0) reasons.push('permission empty');
  if (p.defaultDeny === false) reasons.push('defaultDeny false');
  if (p.failClosed === false) reasons.push('failClosed false');
  if ('action' in p && typeof p.action === 'string' && !ACTIONS.has(p.action)) reasons.push(`unknown action: ${p.action}`);
  if (typeof p.module === 'string' && p.module !== moduleId) reasons.push('permission for another module');
  if (p.adminBypassesTenant === true) reasons.push('admin bypasses tenant');
  if (p.adminBypassesPermission === true) reasons.push('admin bypasses permission');
  if (p.publicReadDefault === true) reasons.push('public read default');
  if (p.createDefaultAllowed === true) reasons.push('create default allowed');
  if (p.updateDefaultAllowed === true) reasons.push('update default allowed');
  if (p.deleteDefaultAllowed === true) reasons.push('delete default allowed');
  if (p.protectedFieldVisible === true && p.protectedFieldRule !== true) reasons.push('protected field visible without rule');
  if (p.protectedFieldEditable === true && p.protectedFieldRule !== true) reasons.push('protected field editable without rule');
  if (p.rowLevelAccess === true && p.tenantScoped === false) reasons.push('row-level access without tenant');
  if (p.tenantScoped === false) reasons.push('tenant scope removed');
  if (p.allowsMutation === true && p.persistenceApproved !== true) reasons.push('permission releases mutation without persistence');
  if (p.allowsProduction === true) reasons.push('permission releases production');

  const valid = reasons.length === 0;
  return { valid, blocked: !valid, reasons };
}

const VALID_PERMISSIONS = [
  ['read valid', { action: 'read', defaultDeny: true, failClosed: true, tenantScoped: true }],
  ['create planned blocked by persistence', { action: 'create', defaultDeny: true, failClosed: true, tenantScoped: true, allowsMutation: false }],
  ['update planned blocked by persistence', { action: 'update', defaultDeny: true, failClosed: true, tenantScoped: true, allowsMutation: false }],
  ['delete planned blocked by default', { action: 'delete', defaultDeny: true, failClosed: true, tenantScoped: true, deleteDefaultAllowed: false }],
  ['export', { action: 'export', defaultDeny: true, failClosed: true, tenantScoped: true }],
  ['configure', { action: 'configure', defaultDeny: true, failClosed: true, tenantScoped: true }],
  ['approve', { action: 'approve', defaultDeny: true, failClosed: true, tenantScoped: true }],
  ['diagnostics', { action: 'diagnostics', defaultDeny: true, failClosed: true, tenantScoped: true }],
  ['admin synthetic restricted', { action: 'admin', defaultDeny: true, failClosed: true, tenantScoped: true, adminBypassesTenant: false }],
].map(([name, p]) => [name, p, true]);

const INVALID_PERMISSIONS = [
  ['defaultDeny false', { action: 'read', defaultDeny: false, failClosed: true }],
  ['failClosed false', { action: 'read', defaultDeny: true, failClosed: false }],
  ['permission missing', null],
  ['permission empty', {}],
  ['permission unknown', { action: 'destroy', defaultDeny: true, failClosed: true }],
  ['permission other module', { action: 'read', module: 'other', defaultDeny: true, failClosed: true }],
  ['admin bypass tenant', { action: 'admin', adminBypassesTenant: true, defaultDeny: true, failClosed: true }],
  ['public read default', { action: 'read', publicReadDefault: true, defaultDeny: true, failClosed: true }],
  ['create default allowed', { action: 'create', createDefaultAllowed: true, defaultDeny: true, failClosed: true }],
  ['update default allowed', { action: 'update', updateDefaultAllowed: true, defaultDeny: true, failClosed: true }],
  ['delete default allowed', { action: 'delete', deleteDefaultAllowed: true, defaultDeny: true, failClosed: true }],
  ['protected visible no rule', { action: 'read', protectedFieldVisible: true, defaultDeny: true, failClosed: true }],
  ['protected editable no rule', { action: 'update', protectedFieldEditable: true, defaultDeny: true, failClosed: true }],
  ['row-level no tenant', { action: 'read', rowLevelAccess: true, tenantScoped: false, defaultDeny: true, failClosed: true }],
  ['tenant scope removed', { action: 'read', tenantScoped: false, defaultDeny: true, failClosed: true }],
  ['releases mutation', { action: 'update', allowsMutation: true, defaultDeny: true, failClosed: true, tenantScoped: true }],
  ['releases production', { action: 'read', allowsProduction: true, defaultDeny: true, failClosed: true, tenantScoped: true }],
].map(([name, p]) => [name, p, false]);

/**
 * Runs the permission hardening matrix. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioPermissionHardeningMatrix(options = {}) {
  void options;
  const scenarios = [...VALID_PERMISSIONS, ...INVALID_PERMISSIONS].map(([name, permission, expectValid]) => {
    const r = evaluateStudioPermission(permission, { moduleId: 'module' });
    return {
      name,
      valid: r.valid,
      blocked: r.blocked,
      expectValid: Boolean(expectValid),
      matchedExpectation: r.valid === Boolean(expectValid),
      defaultDeny: true, failClosed: true, tenantPreserved: true, mutationReleased: false,
      reasons: r.reasons.slice(0, 4),
    };
  });
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-permission-hardening-matrix',
    actions: [...STUDIO_PERMISSION_ACTIONS],
    scenarios,
    scenarioCount: scenarios.length,
    allMatched: mismatches.length === 0,
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioPermissionHardeningMatrix;
