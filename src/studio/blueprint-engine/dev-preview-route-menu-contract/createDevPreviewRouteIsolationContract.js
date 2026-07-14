import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Route isolation CONTRACT — asserts no App/router/route/menu/sidebar registration, no
 * production/staging, no backend/Prisma, no real data, and no prototype relink. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createDevPreviewRouteIsolationContract() {
  const core = {
    kind: 'dev-preview-route-isolation-contract',
    noAppWiring: true,
    noRouterWiring: true,
    noRouteRegistration: true,
    noMenuRegistration: true,
    noSidebarRegistration: true,
    noProduction: true,
    noStaging: true,
    noBackend: true,
    noPrisma: true,
    noRealData: true,
    noPrototypeRelink: true,
  };
  return safeCloneGenericModel({ ...core, routeIsolationDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteIsolationContract;
