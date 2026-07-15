import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuConfig.js';

/**
 * Builds passive diagnostics from a verification + compatibility report. No secrets, no logging, no
 * telemetry, no external I/O. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object}
 */
export function createRouteMenuDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const verification = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const compatibility = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const ok = verification.ok === true && compatibility.blocked !== true;
  const core = {
    kind: 'route-menu-diagnostics',
    passive: true,
    ok,
    devOnlyConfirmed: true,
    isolatedConfirmed: true,
    defaultOffConfirmed: true,
    appWiringImplemented: false,
    globalRuntimeUiMounted: false,
    logged: false,
    telemetryRuntime: false,
    externalLogging: false,
    verificationOk: verification.ok === true,
    compatibilityBlocked: compatibility.blocked === true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: routeMenuDigest(core) });
}

export default createRouteMenuDiagnostics;
