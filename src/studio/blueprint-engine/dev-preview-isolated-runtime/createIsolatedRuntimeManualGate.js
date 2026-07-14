import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { MANUAL_GATE_NAME, MANUAL_GATE_STATUS, runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Records the MANUAL GATE that authorized this dev-only isolated runtime — the Fable pre-runtime
 * enterprise checkpoint. Pure. It authorizes ONLY the dev-only isolated runtime; every
 * production / route-menu / module-generation / backend / Prisma gate remains closed.
 *
 * @param {Object} [options]
 * @returns {Object} manual gate descriptor
 */
export function createIsolatedRuntimeManualGate(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-manual-gate',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    manualGateName: MANUAL_GATE_NAME,
    manualGateStatus: MANUAL_GATE_STATUS,
    approvedForDevOnlyIsolatedRuntime: true,
    productionGate: false,
    routeMenuGate: false,
    moduleGenerationGate: false,
    backendGate: false,
    prismaGate: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manualGateDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeManualGate;
