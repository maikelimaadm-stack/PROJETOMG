/**
 * Barrel for the ModeloBase2 FUEL MODULE SHELL READINESS layer — PURE logic only
 * (React-free, node-importable). The optional preview component lives in
 * `./components/ModeloBase2FuelModuleShellPreview.jsx` and is intentionally NOT
 * re-exported here so this barrel stays free of JSX/React.
 *
 * This layer PREPARES a future real fuel module: module contract, metadata,
 * route/menu/permission plans, persistence boundary, UI composition readiness,
 * diagnostics and fallback. It registers NOTHING — no module, no route, no menu,
 * no backend/Prisma/fetch/runtimeBridge, no real persistence. Reversible by
 * non-consumption. Next step is Fuel Controlled Module Registration or Fuel Beta
 * Module Shell Candidate — NOT backend write.
 */

export { createModeloBase2FuelModuleShellReadiness } from './createModeloBase2FuelModuleShellReadiness.js';
export { createModeloBase2FuelModuleContract, FUEL_MODULE_CONTRACT_COMMANDS, FUEL_MODULE_CONTRACT_EVENTS } from './createModeloBase2FuelModuleContract.js';
export { createModeloBase2FuelModuleMetadata } from './createModeloBase2FuelModuleMetadata.js';
export { createModeloBase2FuelModuleRoutePlan } from './createModeloBase2FuelModuleRoutePlan.js';
export { createModeloBase2FuelModuleMenuPlan } from './createModeloBase2FuelModuleMenuPlan.js';
export { createModeloBase2FuelModulePermissionPlan } from './createModeloBase2FuelModulePermissionPlan.js';
export { createModeloBase2FuelModulePersistenceBoundary } from './createModeloBase2FuelModulePersistenceBoundary.js';
export { createModeloBase2FuelModuleUiComposition } from './createModeloBase2FuelModuleUiComposition.js';
export { createModeloBase2FuelModuleReadinessDiagnostics } from './createModeloBase2FuelModuleReadinessDiagnostics.js';
export { createModeloBase2FuelModuleFallback, FUEL_MODULE_FALLBACK_SCENARIOS } from './createModeloBase2FuelModuleFallback.js';
export {
  resolveModeloBase2FuelModuleShellConfig,
  isModeloBase2FuelModuleShellReadinessEnabled,
  isModeloBase2FuelModuleShellPreviewEnabled,
  isModeloBase2FuelModuleRoutePlanEnabled,
  isModeloBase2FuelModuleMenuPlanEnabled,
  FUEL_MODULE_SHELL_READINESS_MODE,
  FUEL_MODULE_SHELL_MODULE_ID,
  FUEL_MODULE_SHELL_MODULE_NAME,
  FUEL_MODULE_PLANNED_ROUTE_PATH,
  FUEL_MODULE_ALLOWED_PERMISSIONS,
  FUEL_MODULE_BLOCKED_PERMISSIONS,
  FUEL_MODULE_NEXT_STEPS,
  FUEL_MODULE_SHELL_READINESS_FLAG,
  FUEL_MODULE_SHELL_PREVIEW_FLAG,
  FUEL_MODULE_ROUTE_PLAN_FLAG,
  FUEL_MODULE_MENU_PLAN_FLAG,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
} from './modeloBase2FuelModuleShellConfig.js';
export { ModeloBase2FuelModuleShellError, fuelModuleShellError } from './errors.js';
