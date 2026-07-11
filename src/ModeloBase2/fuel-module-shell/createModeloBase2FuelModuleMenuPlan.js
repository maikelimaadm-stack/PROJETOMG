import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  FUEL_MODULE_PLANNED_MENU_GROUP,
  FUEL_MODULE_PLANNED_MENU_LABEL,
  FUEL_MODULE_PLANNED_MENU_ORDER,
  FUEL_MODULE_PLANNED_MENU_ICON,
  isModeloBase2FuelModuleMenuPlanEnabled,
} from './modeloBase2FuelModuleShellConfig.js';

/**
 * Builds the MENU PLAN for the future fuel module. Pure; React-free. Declares
 * ONLY a plan — it never touches or registers the real menu.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} menu plan descriptor
 */
export function createModeloBase2FuelModuleMenuPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};
  const planEnabled = isModeloBase2FuelModuleMenuPlanEnabled(env);

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-menu-plan',
    // Nothing is registered from a plan; the real menu is untouched.
    menuRegistered: false,
    planEnabled,
    plannedMenuGroup: FUEL_MODULE_PLANNED_MENU_GROUP,
    plannedMenuLabel: FUEL_MODULE_PLANNED_MENU_LABEL,
    plannedOrder: FUEL_MODULE_PLANNED_MENU_ORDER,
    plannedIcon: FUEL_MODULE_PLANNED_MENU_ICON,
    visibilityPolicy: 'beta_flag_and_permission',
    permissionRequired: 'fuel.read',
    betaFlagRequired: true,
    productionAllowed: false,
    notes: ['O menu principal NÃO é alterado neste slice.'],
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelModuleMenuPlan;
