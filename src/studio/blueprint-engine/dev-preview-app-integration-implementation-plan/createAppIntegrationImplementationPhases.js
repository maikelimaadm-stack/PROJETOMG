import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Implementation phases PLAN — every phase is PLANNED, none IMPLEMENTED. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationImplementationPhases() {
  const phases = APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS.map((id, index) => ({
    id,
    order: index,
    planned: true,
    implemented: false,
  }));

  const core = {
    kind: 'app-integration-implementation-phases',
    phaseCount: phases.length,
    allPlanned: phases.every((p) => p.planned === true),
    anyImplemented: phases.some((p) => p.implemented === true),
    phases,
  };
  return safeCloneGenericModel({ ...core, phasesDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationImplementationPhases;
