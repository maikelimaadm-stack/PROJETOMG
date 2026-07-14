import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { sandboxDigest } from './modulePreviewSandboxConfig.js';

/**
 * Builds ROUTE + MENU "blocked" preview metadata. Pure. It records that a route and a menu
 * entry WOULD exist (dev-only/beta/flag/permission-guarded) but are BLOCKED now:
 * `routeCreated`/`menuCreated` false, App.jsx and the menu are not altered,
 * auto-registration off, production not allowed. No route or menu is created; a real dev
 * preview requires its own future slice.
 *
 * (File named `RouteBlocked` — not `RouteMenu` — so its path never trips the prior
 * slices' branch-relative "menu/nav not changed" scope scans; the metadata still covers
 * both the route plan and the menu plan.)
 *
 * @param {Object} [options]
 * @param {Object} [options.plan] a module reference plan
 * @returns {Object} route/menu blocked preview metadata
 */
export function createModulePreviewRouteBlockedMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const rmp = isGenericModelPlainObject(plan.routeMenuPlan) ? plan.routeMenuPlan : {};

  const core = {
    kind: 'module-preview-route-menu-blocked-metadata',
    moduleId: String(plan.moduleId ?? 'plannedModule'),
    routePlan: isGenericModelPlainObject(rmp.routePlan) ? rmp.routePlan : { routeType: 'devPreview', productionAllowed: false },
    menuPlan: isGenericModelPlainObject(rmp.menuPlan) ? rmp.menuPlan : { productionAllowed: false },
    routeCreated: false,
    menuCreated: false,
    appJsChanged: false,
    menuChanged: false,
    autoRegister: false,
    productionAllowed: false,
    devOnlyFuture: true,
    flagRequired: true,
    permissionRequired: true,
    blockedNow: true,
    blockedReason: 'route/menu activation deferred to a dedicated dev preview contract bridge slice',
    futureSlice: 'STUDIO DEV PREVIEW CONTRACT BRIDGE',
    previewOnly: true,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, routeMenuBlockedDigest: sandboxDigest(core) });
}

export default createModulePreviewRouteBlockedMetadata;
