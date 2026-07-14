import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * App/router/menu wiring blocked CONTRACT — asserts nothing in App/router/routes/menu/sidebar/
 * navigation is touched and no wiring is allowed. Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewAppWiringBlockedContract() {
  const core = {
    kind: 'dev-preview-app-wiring-blocked-contract',
    appTouched: false,
    routerTouched: false,
    routesTouched: false,
    menuTouched: false,
    sidebarTouched: false,
    navigationTouched: false,
    wiringAllowed: false,
  };
  return safeCloneGenericModel({ ...core, appWiringBlockedDigest: routeMenuDigest(core) });
}

export default createDevPreviewAppWiringBlockedContract;
