import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/** Known fallback scenarios for the module shell readiness layer. */
export const FUEL_MODULE_FALLBACK_SCENARIOS = [
  'readiness_flag_off',
  'invalid_module_contract',
  'invalid_metadata',
  'invalid_route_plan',
  'invalid_menu_plan',
  'invalid_permission_plan',
  'invalid_persistence_boundary',
  'invalid_ui_composition',
];

/**
 * Builds a PASSIVE fallback descriptor for the module shell readiness layer. Pure;
 * React-free. Every scenario resolves to: register nothing, touch nothing, produce
 * a fallbackReason and a passive rollback plan (rollback = simply do not consume).
 *
 * @param {Object} [options]
 * @param {string} [options.scenario]
 * @param {string} [options.reason]
 * @returns {Object} fallback descriptor
 */
export function createModeloBase2FuelModuleFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const scenario = typeof o.scenario === 'string' && FUEL_MODULE_FALLBACK_SCENARIOS.includes(o.scenario)
    ? o.scenario
    : 'readiness_flag_off';
  const fallbackReason = typeof o.reason === 'string' && o.reason.length > 0
    ? o.reason
    : `fuel module shell readiness fallback: ${scenario}`;

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-fallback',
    scenario,
    fallbackReason,
    // Every fallback registers/touches NOTHING.
    moduleRegistered: false,
    routeRegistered: false,
    menuRegistered: false,
    backendRegistered: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    localOnly: true,
    sent: false,
    rollbackPlan: {
      passive: true,
      strategy: 'non-consumption',
      steps: [
        'do not register the module',
        'do not register the route',
        'do not register the menu',
        'do not touch backend/Prisma/runtimeBridge',
        'leave the dev-only preview route as the only surface',
      ],
    },
  });
}

export default createModeloBase2FuelModuleFallback;
