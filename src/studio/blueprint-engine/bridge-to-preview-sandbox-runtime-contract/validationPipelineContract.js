import { CONSUMER_VALIDATION_STAGES } from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** FUTURE validation pipeline contract (fixed 15-stage order). NOT executed in this slice. */
export const VALIDATION_PIPELINE_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-validation-pipeline-contract',
  stages: [...CONSUMER_VALIDATION_STAGES], stageCount: CONSUMER_VALIDATION_STAGES.length,
  atomic: true, deterministicOrder: true, blockerStopsSandboxDescriptor: true,
  pipelineImplemented: false, validationExecuted: false, sandboxDescriptorCreated: false,
});
export default VALIDATION_PIPELINE_CONTRACT;
