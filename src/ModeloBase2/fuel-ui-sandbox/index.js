/**
 * Barrel for the ModeloBase2 FUEL BETA UI SANDBOX — PURE logic only (React-free,
 * node-importable). The React components live in `./components/*.jsx` and are
 * imported directly by a future dev-preview surface; they are intentionally NOT
 * re-exported here so this barrel stays free of JSX/React.
 *
 * The sandbox is dev-only and ISOLATED: never mounted in the app, no route/menu,
 * no src/modules, no backend/Prisma/fetch/runtimeBridge, no real persistence.
 * Reversible by non-consumption.
 */

export { createModeloBase2FuelUiSandboxModel } from './createModeloBase2FuelUiSandboxModel.js';
export { createModeloBase2FuelSandboxSession } from './createModeloBase2FuelSandboxSession.js';
export { createModeloBase2FuelUiViewModel } from './createModeloBase2FuelUiViewModel.js';
export { createModeloBase2FuelSandboxActions } from './createModeloBase2FuelSandboxActions.js';
export { createModeloBase2FuelSandboxDiagnostics } from './createModeloBase2FuelSandboxDiagnostics.js';
export {
  resolveModeloBase2FuelUiSandboxConfig,
  isModeloBase2FuelBetaUiSandboxEnabled,
  isModeloBase2FuelSandboxActionsEnabled,
  isModeloBase2FuelSandboxDiagnosticsEnabled,
  FUEL_UI_SANDBOX_MODE,
  FUEL_UI_SANDBOX_TITLE,
  FUEL_SANDBOX_ACTIONS,
  FUEL_BETA_UI_SANDBOX_FLAG,
  FUEL_SANDBOX_ACTIONS_FLAG,
  FUEL_SANDBOX_DIAGNOSTICS_FLAG,
} from './modeloBase2FuelUiSandboxConfig.js';
export { ModeloBase2FuelUiSandboxError, fuelUiSandboxError } from './errors.js';
