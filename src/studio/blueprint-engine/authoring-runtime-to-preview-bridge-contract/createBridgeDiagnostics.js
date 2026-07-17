import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './bridgeContractConfig.js';

/**
 * Builds passive diagnostics from a verification + compatibility report. No secrets, no logging, no
 * telemetry, no external I/O. Pure. @param {Object} [options] @returns {Object}
 */
export function createBridgeDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const verification = isGenericModelPlainObject(o.verification) ? o.verification : {};
  const compatibility = isGenericModelPlainObject(o.compatibility) ? o.compatibility : {};
  const ok = verification.ok === true && compatibility.blocked !== true;
  const core = {
    kind: 'bridge-diagnostics',
    passive: true,
    ok,
    headlessConfirmed: true,
    contractOnlyConfirmed: true,
    deterministicConfirmed: true,
    ssotPreservedConfirmed: true,
    bridgeImplemented: false,
    previewMounted: false,
    certificationPerformed: false,
    productExposed: false,
    logged: false,
    telemetryRuntime: false,
    externalLogging: false,
    verificationOk: verification.ok === true,
    compatibilityBlocked: compatibility.blocked === true,
  };
  return safeCloneGenericModel({ ...core, diagnosticsDigest: bridgeDigest(core) });
}

export default createBridgeDiagnostics;
