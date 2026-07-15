import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Observability/diagnostics PLAN — safe; no secrets, no runtime telemetry, no external logging.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createRouteMenuObservabilityDiagnosticsPlan() {
  const core = {
    kind: 'route-menu-observability-diagnostics-plan',
    safeDiagnostics: true,
    withoutSecrets: true,
    noStackLeak: true,
    noTelemetryRuntime: true,
    noExternalLogging: true,
    observabilityImplemented: false,
  };
  return safeCloneGenericModel({ ...core, observabilityDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuObservabilityDiagnosticsPlan;
