import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * Builds passive diagnostics from a verification + compatibility report. No secrets, no logging,
 * no telemetry, no external I/O. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.verification]
 * @param {Object} [options.compatibility]
 * @returns {Object}
 */
export function createRuntimeUiDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const verification = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const compatibility = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};

  const ok = verification.ok === true && compatibility.blocked !== true;
  const core = {
    kind: 'runtime-ui-diagnostics',
    passive: true,
    ok,
    devOnlyConfirmed: true,
    isolatedConfirmed: true,
    oldPrototypeImported: false,
    appWired: false,
    logged: false,
    telemetryRuntime: false,
    externalLogging: false,
    verificationOk: verification.ok === true,
    compatibilityBlocked: compatibility.blocked === true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiDiagnostics;
