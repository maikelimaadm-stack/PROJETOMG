import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans observability/diagnostics. Safe, no secrets, no runtime telemetry, no external logging.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiObservabilityDiagnosticsPlan() {
  const core = {
    kind: 'runtime-ui-observability-diagnostics-plan',
    safeDiagnostics: true,
    withoutSecrets: true,
    noStackLeak: true,
    noTelemetryRuntime: true,
    noExternalLogging: true,
    observabilityImplemented: false,
  };
  return safeCloneGenericModel({ ...core, observabilityPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiObservabilityDiagnosticsPlan;
