/**
 * Barrel for the ModeloBase2 FUEL DEV PREVIEW ROUTE — PURE logic only (React-free,
 * node-importable). The route component lives in `./ModeloBase2FuelDevPreviewRoute.jsx`
 * and is lazy-imported by `src/App.jsx` behind the dev guard; it is intentionally
 * NOT re-exported here so this barrel stays free of JSX/React.
 *
 * Dev-only and guarded: never in the menu, fails closed in production, no
 * src/modules/backend/Prisma/fetch/runtimeBridge, no real persistence. Reversible.
 */

export {
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG,
  MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG,
  isModeloBase2FuelDevPreviewRouteEnabled,
  isModeloBase2FuelDevEnvironment,
  shouldMountModeloBase2FuelDevPreviewRoute,
  detectFuelDevEnvLabel,
} from './modeloBase2FuelDevPreviewConfig.js';
export { resolveModeloBase2FuelDevPreviewAccess } from './resolveModeloBase2FuelDevPreviewAccess.js';
export { createModeloBase2FuelDevPreviewFixtures } from './createModeloBase2FuelDevPreviewFixtures.js';
export { createModeloBase2FuelDevPreviewState } from './createModeloBase2FuelDevPreviewState.js';
export { createModeloBase2FuelDevPreviewDiagnostics } from './createModeloBase2FuelDevPreviewDiagnostics.js';
export { ModeloBase2FuelDevPreviewError, fuelDevPreviewError } from './errors.js';
