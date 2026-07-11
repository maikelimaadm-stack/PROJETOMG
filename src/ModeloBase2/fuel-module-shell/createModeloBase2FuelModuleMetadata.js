import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  FUEL_MODULE_SHELL_MODULE_ID,
  FUEL_MODULE_SHELL_MODULE_NAME,
  FUEL_MODULE_SHELL_STATUS,
  FUEL_MODULE_SHELL_VERSION,
  FUEL_MODULE_SHELL_CATEGORY,
  FUEL_MODULE_SHELL_ICON_NAME,
  FUEL_MODULE_SHELL_OWNER,
  FUEL_MODULE_SHELL_RISK_LEVEL,
  FUEL_MODULE_PLANNED_ROUTE_PATH,
  FUEL_MODULE_PLANNED_MENU_GROUP,
  FUEL_MODULE_PLANNED_MENU_LABEL,
  FUEL_MODULE_ALLOWED_PERMISSIONS,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
} from './modeloBase2FuelModuleShellConfig.js';

/**
 * Builds the MINIMAL metadata for the FUTURE real fuel module. Pure; React-free.
 * `routes`/`menu`/`permissions` are PLANNED ONLY — nothing is registered here.
 * No external logo/brand, no new icon import (only a string icon name).
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} metadata descriptor
 */
export function createModeloBase2FuelModuleMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : FUEL_MODULE_SHELL_MODULE_ID;

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-metadata',
    moduleId,
    displayName: FUEL_MODULE_SHELL_MODULE_NAME,
    description: 'Módulo de lançamento e controle de combustível (abastecimentos) sobre o runtime operacional ModeloBase2. Em preparação de shell — ainda não é módulo real.',
    category: FUEL_MODULE_SHELL_CATEGORY,
    iconName: FUEL_MODULE_SHELL_ICON_NAME,
    modelType: MODELOBASE2_MODEL_TYPE,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    status: FUEL_MODULE_SHELL_STATUS,
    version: FUEL_MODULE_SHELL_VERSION,
    tags: ['operacional', 'combustivel', 'abastecimento', 'modeloBase2', 'beta'],
    owner: FUEL_MODULE_SHELL_OWNER,
    // Planned-only surfaces — never registered from this layer.
    routes: { planned: true, registered: false, plannedRoutePath: FUEL_MODULE_PLANNED_ROUTE_PATH },
    menu: { planned: true, registered: false, plannedGroup: FUEL_MODULE_PLANNED_MENU_GROUP, plannedLabel: FUEL_MODULE_PLANNED_MENU_LABEL },
    permissions: { planned: true, registered: false, planned_list: [...FUEL_MODULE_ALLOWED_PERMISSIONS] },
    persistence: { mode: 'localOnly', persistenceReal: false },
    riskLevel: FUEL_MODULE_SHELL_RISK_LEVEL,
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelModuleMetadata;
