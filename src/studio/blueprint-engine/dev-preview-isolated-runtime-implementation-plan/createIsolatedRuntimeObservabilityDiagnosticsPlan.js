import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the OBSERVABILITY / DIAGNOSTICS plan. Pure, metadata-only. A future runtime's
 * diagnostics must be safe: no secrets, no stack leak, no runtime telemetry, no external
 * logging.
 *
 * @param {Object} [options]
 * @returns {Object} observability/diagnostics plan
 */
export function createIsolatedRuntimeObservabilityDiagnosticsPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-observability-diagnostics-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    safeDiagnostics: true,
    noSecrets: true,
    noStackLeak: true,
    noTelemetryRuntime: true,
    noExternalLogging: true,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, observabilityDiagnosticsDigest: planDigest(core) });
}

export default createIsolatedRuntimeObservabilityDiagnosticsPlan;
