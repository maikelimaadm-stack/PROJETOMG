import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  FUEL_MODULE_PLANNED_ROUTE_PATH,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
  isModeloBase2FuelModuleRoutePlanEnabled,
} from './modeloBase2FuelModuleShellConfig.js';

/**
 * Builds the ROUTE PLAN for the future fuel module. Pure; React-free. Declares
 * ONLY a plan — it never registers a production route and requires NO App.jsx
 * change now. The dev-preview route (already merged) is the current fallback.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} route plan descriptor
 */
export function createModeloBase2FuelModuleRoutePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};
  const planEnabled = isModeloBase2FuelModuleRoutePlanEnabled(env);

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-route-plan',
    plannedRoutePath: FUEL_MODULE_PLANNED_ROUTE_PATH,
    devPreviewRoutePath: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
    planEnabled,
    // Nothing is registered from a plan.
    routeRegistered: false,
    // A production route WILL eventually require an App.jsx change — but NOT now.
    appJsChangeRequiredFuture: true,
    currentAppJsChange: false,
    guardRequired: true,
    betaFlagRequired: true,
    productionAllowed: false,
    allowProdFlagRequired: true,
    fallbackRoute: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
    notes: [
      'Rota produtiva ainda NÃO será criada neste slice.',
      'A rota dev-only /__dev/modelobase2/fuel permanece como fallback de preview.',
    ],
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelModuleRoutePlan;
