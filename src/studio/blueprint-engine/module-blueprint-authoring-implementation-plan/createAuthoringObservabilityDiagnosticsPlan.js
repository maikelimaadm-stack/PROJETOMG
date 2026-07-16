import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Observability/diagnostics PLAN — plans passive, sanitized, in-memory diagnostics for the future
 * runtime. No secrets, no external logging, no telemetry runtime. Metadata only.
 * @returns {Object}
 */
export function createAuthoringObservabilityDiagnosticsPlan() {
  const core = {
    kind: 'authoring-observability-diagnostics-plan',
    observabilityDiagnosticsPlanned: true,
    passive: true,
    sanitized: true,
    inMemoryOnly: true,
    secretsLogged: false,
    externalLoggingAllowed: false,
    telemetryRuntimeAllowed: false,
    realDataLogged: false,
  };
  return safeCloneGenericModel({ ...core, observabilityDiagnosticsPlanDigest: authoringPlanDigest(core) });
}

export default createAuthoringObservabilityDiagnosticsPlan;
