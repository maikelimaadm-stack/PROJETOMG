import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  FUEL_MODULE_ALLOWED_PERMISSIONS,
  FUEL_MODULE_BLOCKED_PERMISSIONS,
} from './modeloBase2FuelModuleShellConfig.js';

/**
 * Builds the PERMISSION PLAN for the future fuel module. Pure; React-free. Plans
 * future permissions WITHOUT touching the global auth/permission model. Fails
 * closed: everything blocked-by-default; dangerous permissions stay blocked.
 *
 * @param {Object} [options]
 * @returns {Object} permission plan descriptor
 */
export function createModeloBase2FuelModulePermissionPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'modelobase2-fuel';

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-permission-plan',
    moduleId,
    // Nothing registered; global auth untouched; fail-closed.
    permissionsRegistered: false,
    authGlobalChanged: false,
    failClosed: true,
    allowed: [...FUEL_MODULE_ALLOWED_PERMISSIONS],
    blocked: [...FUEL_MODULE_BLOCKED_PERMISSIONS],
    futurePermissionModel: {
      strategy: 'module_scoped_local_first',
      defaultDeny: true,
      requiresIntegrationWithGlobalAuth: true,
      integratedNow: false,
    },
    notes: ['Auth/permissões globais NÃO são alteradas neste slice.'],
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelModulePermissionPlan;
