import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Builds passive diagnostics from a verification + compatibility report. No secrets, no logging, no
 * telemetry, no external I/O. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object}
 */
export function createAppIntegrationImplementationPlanDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const verification = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const compatibility = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const ok = verification.ok === true && compatibility.blocked !== true;
  const core = {
    kind: 'app-integration-implementation-plan-diagnostics',
    passive: true,
    ok,
    headlessConfirmed: true,
    planOnlyConfirmed: true,
    appIntegrated: false,
    appTouched: false,
    runtimeUiMountedInApp: false,
    logged: false,
    telemetryRuntime: false,
    externalLogging: false,
    verificationOk: verification.ok === true,
    compatibilityBlocked: compatibility.blocked === true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationImplementationPlanDiagnostics;
