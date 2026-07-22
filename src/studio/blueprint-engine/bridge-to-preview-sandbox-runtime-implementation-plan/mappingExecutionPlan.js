import { REAL_FIELD_MAPPING_CONTRACT, REAL_MAPPING_COUNT, TRANSFORM_KINDS } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * MAPPING EXECUTION PLAN — consumes EXACTLY the 12 real field mappings from the merged Bridge-to-Preview Sandbox
 * Runtime Contract (#487). No local divergent list. Declaration only; nothing is mapped here.
 */
const REAL_MAPPINGS = REAL_FIELD_MAPPING_CONTRACT; // frozen upstream reference

export const MAPPING_EXECUTION_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-mapping-execution-plan',
  mappingContractSource: 'bridge-to-preview-sandbox-runtime-contract/fieldMappingContract.js (FIELD_MAPPING_CONTRACT)',
  mappingCount: REAL_MAPPING_COUNT, // 12
  mappings: deepFreeze(REAL_MAPPINGS.map((m) => deepFreeze({
    mappingId: m.mappingId, sourceField: m.sourceField, targetField: m.targetField, transformKind: m.transformKind,
    required: m.required, defaultAllowed: m.defaultAllowed, losslessRequired: m.losslessRequired,
    syntheticOnly: m.syntheticOnly, deterministic: m.deterministic, securitySensitive: m.securitySensitive,
  }))),
  transformAllowlist: [...TRANSFORM_KINDS], // derived from the real mappings, no local list
  mappingExecutionOrder: deepFreeze(REAL_MAPPINGS.map((m) => m.mappingId)),
  cloneSemantics: 'deep clone of synthetic values into target fields; never reference retention',
  defaultProhibition: true,
  losslessEnforcement: true,
  duplicateProtection: true,
  targetFieldCoverage: deepFreeze(Array.from(new Set(REAL_MAPPINGS.map((m) => m.targetField))).sort()),
  targetFieldCoverageComplete: true,
  mappingExecutorImplemented: false,
});

export default MAPPING_EXECUTION_PLAN;
