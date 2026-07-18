import { BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, CRITICAL_SOURCE_FIELDS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * FIELD MAPPING EXECUTION PLAN — plans (does not execute) the 11 source->target mappings. Each mapping
 * declares planned status only. Unknown transforms fail closed; critical defaults and lossy critical
 * mappings forbidden; deterministic order; every target critical field covered. Metadata only.
 * @returns {Object}
 */
export function createFieldMappingExecutionPlan() {
  const mappings = BRIDGE_FIELD_MAPPINGS.map((m) => ({
    ...m,
    syntheticOnly: true,
    deterministic: true,
    critical: CRITICAL_SOURCE_FIELDS.includes(m.sourceField),
    transformAllowed: ALLOWED_TRANSFORM_KINDS.includes(m.transformKind),
    executionStatus: 'planned',
    implemented: false,
  }));
  const core = {
    kind: 'bridge-field-mapping-execution-plan',
    mappingExecutionPlanned: true,
    mappingExecutorImplemented: false,
    mappings,
    mappingCount: mappings.length,
    allowedTransformKinds: [...ALLOWED_TRANSFORM_KINDS],
    unknownTransformFailsClosed: true,
    criticalDefaultForbidden: true,
    lossyCriticalForbidden: true,
    silentCriticalRenameForbidden: true,
    deterministicOrder: true,
    everyCriticalMapped: CRITICAL_SOURCE_FIELDS.every((f) => mappings.some((m) => m.sourceField === f)),
    targetCriticalFieldsAllCovered: CRITICAL_SOURCE_FIELDS.every((f) => mappings.some((m) => m.sourceField === f)),
    anyUnknownTransform: mappings.some((m) => m.transformAllowed === false),
    anyCriticalDefault: mappings.some((m) => m.critical === true && m.defaultAllowed === true),
    anyLossyCritical: mappings.some((m) => m.critical === true && m.losslessRequired === false),
    anyImplemented: mappings.some((m) => m.implemented === true),
  };
  return safeCloneGenericModel({ ...core, fieldMappingExecutionPlanDigest: bridgePlanDigest(core) });
}

export default createFieldMappingExecutionPlan;
