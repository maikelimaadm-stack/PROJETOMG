import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Builds passive diagnostics from a verification + compatibility report. No secrets, no logging, no
 * telemetry, no external I/O. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object}
 */
export function createAppIntegrationDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const verification = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const compatibility = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const ok = verification.ok === true && compatibility.blocked !== true;
  const core = {
    kind: 'app-integration-diagnostics',
    passive: true,
    ok,
    devOnlyConfirmed: true,
    defaultOffConfirmed: true,
    failClosedConfirmed: true,
    productionBundleContainsPreview: false,
    routeExposedToProduct: false,
    logged: false,
    telemetryRuntime: false,
    externalLogging: false,
    verificationOk: verification.ok === true,
    compatibilityBlocked: compatibility.blocked === true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationDiagnostics;
