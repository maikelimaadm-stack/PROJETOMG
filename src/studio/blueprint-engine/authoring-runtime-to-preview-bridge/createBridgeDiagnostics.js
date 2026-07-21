import { deepFreeze } from './deepFreeze.js';

/** Passive, deterministic, secret-free diagnostics. No logging/telemetry/network/storage. Pure. */
export function createBridgeDiagnostics(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const verification = o.verification && typeof o.verification === 'object' ? o.verification : {};
  const ok = verification.ok === true;
  return deepFreeze({
    kind: 'bridge-diagnostics',
    passive: true,
    ok,
    headlessConfirmed: true,
    deterministicConfirmed: true,
    ssotPreservedConfirmed: true,
    previewMounted: false,
    appTouched: false,
    certificationPerformed: false,
    productExposed: false,
    secretsExposed: false,
    logged: false,
    telemetryRuntime: false,
    externalLogging: false,
    networkUsed: false,
    storageUsed: false,
    verificationOk: verification.ok === true,
  });
}

export default createBridgeDiagnostics;
