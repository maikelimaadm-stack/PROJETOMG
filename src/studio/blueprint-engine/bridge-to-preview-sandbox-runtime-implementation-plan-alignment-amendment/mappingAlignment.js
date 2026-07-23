import { MAPPING_EXECUTION_PLAN } from '../bridge-to-preview-sandbox-runtime-implementation-plan/index.js';
import { deepFreeze } from './deepFreeze.js';
/** The 12 mappings stay from the real contract; their source is now bridgeDecisionCore.targetDescriptor. */
export const MAPPING_ALIGNMENT = deepFreeze({
  kind: 'mapping-alignment',
  mappingCount: MAPPING_EXECUTION_PLAN.mappingCount, // 12
  mappingSource: 'bridgeDecisionCore.targetDescriptor',
  noLocalDivergentList: true,
  noMappingFromEnvelopeMetadata: true,
  noDigestMapping: true,
  mappingExecutorImplemented: false,
});
export default MAPPING_ALIGNMENT;
