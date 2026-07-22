import { ENVELOPE_VALIDATION_STAGES } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const VALIDATION_PIPELINE_CONTRACT = deepFreeze({
  kind: 'envelope-validation-pipeline-contract',
  stages: [...ENVELOPE_VALIDATION_STAGES], stageCount: ENVELOPE_VALIDATION_STAGES.length,
  atomic: true, deterministicOrder: true, blockerStopsEnvelope: true,
  pipelineImplemented: false, validationExecuted: false, envelopeCreated: false,
});
export default VALIDATION_PIPELINE_CONTRACT;
