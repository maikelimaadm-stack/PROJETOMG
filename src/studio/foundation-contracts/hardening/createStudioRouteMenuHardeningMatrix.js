import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

const SAFE_ROUTE_PATH = /^\/[a-z0-9][a-z0-9/_-]*$/i;

/**
 * Classifies a route/menu plan. Pure. Route/menu default off; nothing auto-registers;
 * App.jsx/menu never bound; production route blocked.
 * @param {unknown} plan
 * @param {{ knownPaths?: string[] }} [ctx]
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateStudioRouteMenu(plan, ctx = {}) {
  const p = isGenericModelPlainObject(plan) ? plan : {};
  const known = Array.isArray(ctx.knownPaths) ? ctx.knownPaths : [];
  /** @type {string[]} */ const reasons = [];

  if (p.routeEnabled === true) reasons.push('routeEnabled true by default');
  if (p.menuVisible === true) reasons.push('menuVisible true by default');
  if (p.productionAllowed === true) reasons.push('productionAllowed true');
  if (p.devOnly === false && p.guardRequired !== true) reasons.push('devOnly false without gate');
  if (p.betaOnly === false && p.flagRequired !== true) reasons.push('betaOnly false without gate');
  if (p.guardRequired === false) reasons.push('guardRequired false');
  if (p.flagRequired === false) reasons.push('flagRequired false');
  if (p.permissionRequired === false) reasons.push('permissionRequired false');
  if (typeof p.componentBinding === 'string' && p.componentBinding.length > 0) reasons.push('real componentBinding');
  if (p.appJsxBinding === true || typeof p.appJsxBinding === 'string') reasons.push('App.jsx binding');
  if (p.publicRoute === true) reasons.push('public route');
  if (typeof p.routePath === 'string') {
    if (/\*/.test(p.routePath)) reasons.push('wildcard route');
    else if (!SAFE_ROUTE_PATH.test(p.routePath)) reasons.push('unsafe routePath');
    if (known.includes(p.routePath)) reasons.push('duplicate routePath');
  }
  if (isGenericModelPlainObject(p.menu)) {
    if (!p.menu.permissionRequired) reasons.push('menu without permission');
    if (!p.menu.flagRequired) reasons.push('menu without flag');
    if (p.menu.productionVisible === true) reasons.push('menu production visible');
    if (p.menu.autoGroup === true) reasons.push('menu auto group');
  }
  if (p.autoRegister === true) reasons.push('autoRegister true');
  if (typeof p.fallbackRoute === 'string' && /^https?:\/\//.test(p.fallbackRoute)) reasons.push('external fallbackRoute');
  if (isGenericModelPlainObject(p.diagnostics) && /jwt|token|secret|DATABASE[_]URL/i.test(JSON.stringify(p.diagnostics))) reasons.push('diagnostics contain a secret');

  const valid = reasons.length === 0;
  return { valid, blocked: !valid, reasons };
}

const DANGEROUS_ROUTE_MENU = [
  ['routeEnabled default true', { routeEnabled: true }],
  ['menuVisible default true', { menuVisible: true }],
  ['productionAllowed true', { productionAllowed: true }],
  ['devOnly false without gate', { devOnly: false }],
  ['betaOnly false without gate', { betaOnly: false }],
  ['guardRequired false', { guardRequired: false }],
  ['flagRequired false', { flagRequired: false }],
  ['permissionRequired false', { permissionRequired: false }],
  ['componentBinding real', { componentBinding: 'src/pages/X.jsx' }],
  ['App.jsx binding', { appJsxBinding: true }],
  ['public route', { publicRoute: true }],
  ['wildcard route', { routePath: '/x/*' }],
  ['routePath insecure', { routePath: 'not a path' }],
  ['routePath duplicate', { routePath: '/dup' }],
  ['menu without permission', { menu: { flagRequired: true } }],
  ['menu production visible', { menu: { permissionRequired: true, flagRequired: true, productionVisible: true } }],
  ['autoRegister true', { autoRegister: true }],
  ['fallbackRoute external', { fallbackRoute: 'https://evil.example' }],
  ['diagnostics with secret', { diagnostics: { token: 'x' } }],
];

/**
 * Runs the route/menu hardening matrix. Every dangerous case is blocked. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioRouteMenuHardeningMatrix(options = {}) {
  void options;
  const knownPaths = ['/dup'];
  const scenarios = DANGEROUS_ROUTE_MENU.map(([name, plan]) => {
    const r = evaluateStudioRouteMenu(plan, { knownPaths });
    return {
      name,
      blocked: r.blocked,
      appJsxChanged: false, menuChanged: false, autoRegistered: false, sideEffects: false,
      blockerCode: 'STUDIO_HARDENING_ROUTE_MENU_AUTO_REGISTRATION',
      reasons: r.reasons.slice(0, 4),
    };
  });
  const notBlocked = scenarios.filter((s) => !s.blocked).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-route-menu-hardening-matrix',
    scenarios,
    scenarioCount: scenarios.length,
    allBlocked: notBlocked.length === 0,
    blockers: notBlocked,
    warnings: [],
    readiness: notBlocked.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioRouteMenuHardeningMatrix;
