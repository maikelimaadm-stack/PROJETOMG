import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../../shadow/pilots/tableFormProjection.js';
import { createRuntimeV2DevPreviewHubModel } from '../hub/createRuntimeV2DevPreviewHubModel.js';
import { isRuntimeV2DevPreviewHubEnabled, detectEnvLabel } from '../hub/devPreviewHubConfig.js';
import { createControlledDevDataset } from '../data/createControlledDevDataset.js';
import { isControlledDevDatasetEnabled } from '../data/controlledDatasetConfig.js';
import {
  isRuntimeV2DevPreviewRouteEnabled,
  isRouteProductionEnv,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG,
} from './devPreviewRouteConfig.js';
import { RuntimeV2DevPreviewRouteError } from './errors.js';

const DEV_ONLY_BANNER = 'DEV-ONLY — runtime v2 preview using controlled mock data';

/** @param {string} code @param {string} message */
function routeError(code, message) {
  return new RuntimeV2DevPreviewRouteError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain ROUTE MODEL for the dev-only runtime v2
 * preview route. It never renders real UI, never executes anything, never
 * touches real data or the backend. The hub model (with an opt-in controlled
 * dataset when its flag is on) is included only when the route + hub flags
 * permit it. Sensitive keys are masked (via the hub model); prototype pollution
 * in options is blocked; the result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env] Explicit env (dev harness); defaults to import.meta.env/process.env.
 * @returns {Promise<import('../../../types/dev-preview-route.js').RuntimeV2DevPreviewRouteModel>}
 */
export async function createRuntimeV2DevPreviewRouteModel(options = {}) {
  validateProjectionInput(options, 0, 'Dev preview route options', (_c, message) => routeError('MAK-L3-DEV-ROUTE-001', message));
  if (!isPlainObject(options)) {
    throw routeError('MAK-L3-DEV-ROUTE-002', 'createRuntimeV2DevPreviewRouteModel() options must be a plain object');
  }

  const env = options.env;
  const routeEnabled = isRuntimeV2DevPreviewRouteEnabled(env);
  const hubEnabled = isRuntimeV2DevPreviewHubEnabled(env);
  const datasetEnabled = isControlledDevDatasetEnabled(env);
  const isProd = isRouteProductionEnv(env);
  const productionBlocked = isProd && !routeEnabled;

  /** @type {import('../../../types/dev-preview-hub.js').RuntimeV2DevPreviewHubModel|null} */
  let hubModel = null;
  /** @type {string[]} */
  const warnings = [];
  if (routeEnabled && hubEnabled) {
    try {
      const dataset = datasetEnabled ? createControlledDevDataset({ env }) : undefined;
      hubModel = await createRuntimeV2DevPreviewHubModel({ env, dataset });
    } catch (err) {
      // Hub build failure is captured — the route never crashes because the hub misbuilds.
      warnings.push(`hub model failed to build: ${err instanceof Error ? err.message : String(err)}`);
      hubModel = null;
    }
  }
  if (routeEnabled && !hubEnabled) warnings.push('route enabled but hub flag off — hub not rendered');
  if (routeEnabled && !datasetEnabled) warnings.push('dataset flag off — showing previews without dataset summary');

  const model = {
    routePath: RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH,
    enabled: routeEnabled,
    devOnly: true,
    productionBlocked,
    environment: detectEnvLabel(env),
    hubEnabled,
    datasetEnabled,
    flags: { routeFlag: RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG, routeEnabled, hubEnabled, datasetEnabled },
    status: { banner: DEV_ONLY_BANNER, mocked: true, inMainMenu: false, publicRoute: false },
    warnings,
    limitations: [
      'dev-only route — never mounted in production navigation, never in the main menu',
      'mocked data only — no real records, no backend, no Prisma',
      'passive — never executes actions/workflows/connectors, never saves',
    ],
    hubModel,
  };
  // Safe, independent deep copy — mutating the returned model never reaches internal state.
  return /** @type {import('../../../types/dev-preview-route.js').RuntimeV2DevPreviewRouteModel} */ (safeClone(model));
}
