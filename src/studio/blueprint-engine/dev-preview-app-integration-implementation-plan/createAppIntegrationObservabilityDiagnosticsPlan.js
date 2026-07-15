import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Observability/diagnostics PLAN — safe diagnostics only; no secrets, no telemetry runtime, no
 * external logging, no stack leak. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationObservabilityDiagnosticsPlan() {
  const core = {
    kind: 'app-integration-observability-diagnostics-plan',
    safeDiagnostics: true,
    withoutSecrets: true,
    noStackLeak: true,
    noTelemetryRuntime: true,
    noExternalLogging: true,
  };
  return safeCloneGenericModel({ ...core, observabilityDiagnosticsPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationObservabilityDiagnosticsPlan;
