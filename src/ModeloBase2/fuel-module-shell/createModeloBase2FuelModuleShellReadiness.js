import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2FuelModuleContract } from './createModeloBase2FuelModuleContract.js';
import { createModeloBase2FuelModuleMetadata } from './createModeloBase2FuelModuleMetadata.js';
import { createModeloBase2FuelModuleRoutePlan } from './createModeloBase2FuelModuleRoutePlan.js';
import { createModeloBase2FuelModuleMenuPlan } from './createModeloBase2FuelModuleMenuPlan.js';
import { createModeloBase2FuelModulePermissionPlan } from './createModeloBase2FuelModulePermissionPlan.js';
import { createModeloBase2FuelModulePersistenceBoundary } from './createModeloBase2FuelModulePersistenceBoundary.js';
import { createModeloBase2FuelModuleUiComposition } from './createModeloBase2FuelModuleUiComposition.js';
import { createModeloBase2FuelModuleReadinessDiagnostics } from './createModeloBase2FuelModuleReadinessDiagnostics.js';
import { createModeloBase2FuelModuleFallback } from './createModeloBase2FuelModuleFallback.js';
import {
  resolveModeloBase2FuelModuleShellConfig,
  isModeloBase2FuelModuleShellReadinessEnabled,
  FUEL_MODULE_SHELL_MODULE_ID,
  FUEL_MODULE_SHELL_MODULE_NAME,
  FUEL_MODULE_SHELL_READINESS_MODE,
  FUEL_MODULE_NEXT_STEPS,
  FUEL_DOMAIN,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
} from './modeloBase2FuelModuleShellConfig.js';
import { fuelModuleShellError } from './errors.js';

/**
 * The top-level ModeloBase2 FUEL MODULE SHELL READINESS. Composes the module
 * contract, metadata, route/menu/permission plans, persistence boundary and UI
 * composition into a single readiness descriptor that PREPARES a future real fuel
 * module WITHOUT registering one. Nothing is mounted/registered: no module, no
 * route, no menu, no backend/Prisma/fetch/runtimeBridge, no real persistence.
 * Reversible by non-consumption.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} readiness descriptor
 */
export function createModeloBase2FuelModuleShellReadiness(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelModuleShellError('MAK-MB2-FUEL-MSR-001', 'createModeloBase2FuelModuleShellReadiness() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : FUEL_MODULE_SHELL_MODULE_ID;
  const env = isGenericModelPlainObject(options.env) ? options.env : {};
  const config = resolveModeloBase2FuelModuleShellConfig({ moduleId, env });
  const enabled = isModeloBase2FuelModuleShellReadinessEnabled(env);
  const readinessId = `fuel-module-shell-readiness-${moduleId}`;

  const moduleContract = createModeloBase2FuelModuleContract({ moduleId });
  const metadata = createModeloBase2FuelModuleMetadata({ moduleId });
  const routePlan = createModeloBase2FuelModuleRoutePlan({ env });
  const menuPlan = createModeloBase2FuelModuleMenuPlan({ env });
  const permissionPlan = createModeloBase2FuelModulePermissionPlan({ moduleId });
  const persistenceBoundary = createModeloBase2FuelModulePersistenceBoundary({ moduleId });
  const uiComposition = createModeloBase2FuelModuleUiComposition({ env });
  const diagnostics = createModeloBase2FuelModuleReadinessDiagnostics({ readinessId, moduleId, enabled, uiComposition });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-shell-readiness',
    readinessId,
    domain: FUEL_DOMAIN,
    moduleId,
    moduleName: FUEL_MODULE_SHELL_MODULE_NAME,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    mode: FUEL_MODULE_SHELL_READINESS_MODE,
    enabled,
    config,
    moduleContract,
    metadata,
    routePlan,
    menuPlan,
    permissionPlan,
    persistenceBoundary,
    uiComposition,
    diagnostics,
    limitations: [
      'readiness only — NO real module/route/menu registered',
      'App.jsx / menu / src-modules / src-pages untouched',
      'local + memory-only (persistenceReal:false); events never sent',
      'does NOT touch backend/Prisma/fetch/runtimeBridge/global auth',
      'reuses fuel-ui-sandbox shell + fuel-headless read model without changing them',
    ],
    nextSteps: [...FUEL_MODULE_NEXT_STEPS],
    // Structural invariants asserted at the top level.
    moduleRegistered: false,
    routeRegistered: false,
    menuRegistered: false,
    backendRegistered: false,
    persistenceReal: false,
    localOnly: true,
    sent: false,
  });

  return {
    ...descriptor,
    fallback: (input) => createModeloBase2FuelModuleFallback(isGenericModelPlainObject(input) ? input : {}),
  };
}

export default createModeloBase2FuelModuleShellReadiness;
