import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * OBSERVABILITY / DIAGNOSTICS PLAN — plans passive, deterministic, secret-free diagnostics for the future
 * bridge. No external logging, telemetry, network or storage. Metadata only. @returns {Object}
 */
export function createBridgeObservabilityDiagnosticsPlan() {
  const core = {
    kind: 'bridge-observability-diagnostics-plan',
    observabilityDiagnosticsPlanOnly: true,
    passive: true,
    deterministic: true,
    secretsExposed: false,
    externalLoggingUsed: false,
    telemetryRuntimeUsed: false,
    networkUsed: false,
    storageUsed: false,
    plannedSignals: ['plan_composed', 'verification_ok', 'compatibility_status', 'blocker_count'],
  };
  return safeCloneGenericModel({ ...core, observabilityDiagnosticsPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeObservabilityDiagnosticsPlan;
