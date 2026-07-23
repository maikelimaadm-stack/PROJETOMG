import { CORE_ENVELOPE_VALIDATION_STAGES } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** FUTURE validation pipeline (fixed 18-stage order). NOT executed in this slice. */
export const VALIDATION_PIPELINE_CONTRACT = deepFreeze({
  kind: 'core-envelope-validation-pipeline-contract',
  stages: [...CORE_ENVELOPE_VALIDATION_STAGES],
  stageCount: CORE_ENVELOPE_VALIDATION_STAGES.length,
  atomic: true, deterministicOrder: true, blockerStopsCoreEnvelope: true,
  coreEnvelopeCreatedOnlyAfterAllBlockersPass: true,
  pipelineImplemented: false, validationExecuted: false, coreEnvelopeCreated: false,
});
export default VALIDATION_PIPELINE_CONTRACT;
