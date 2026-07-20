import {
  BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, CRITICAL_SOURCE_FIELDS, REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * FIELD MAPPING EXECUTION PLAN — plans (does not execute) the source->target mappings, aligned to the REAL
 * handoff. Each mapping is `planned`, `implemented` = false; every sourceField exists in the real handoff
 * (no invented alias); unknown transforms fail closed; critical defaults and lossy critical mappings
 * forbidden; deterministic order; every target critical field covered. Count derives from the real model.
 * @returns {Object}
 */
export function createFieldMappingExecutionPlan() {
  const mappings = BRIDGE_FIELD_MAPPINGS.map((m) => ({
    ...m,
    syntheticOnly: true,
    deterministic: true,
    critical: CRITICAL_SOURCE_FIELDS.includes(m.sourceField),
    transformAllowed: ALLOWED_TRANSFORM_KINDS.includes(m.transformKind),
    sourceExistsInRealHandoff: REAL_HANDOFF_FIELDS.includes(m.sourceField),
    isLegacyAlias: FORBIDDEN_LEGACY_SOURCE_FIELDS.includes(m.sourceField),
    executionStatus: 'planned',
    implemented: false,
  }));
  const targetFields = mappings.map((m) => m.targetField);
  const sourceFields = mappings.map((m) => m.sourceField);
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
    everyMappingSourceExistsInRealHandoff: mappings.every((m) => m.sourceExistsInRealHandoff === true),
    everyRequiredTargetMapped: targetFields.length === new Set(targetFields).size && targetFields.every((t) => typeof t === 'string' && t.length > 0),
    noDuplicateSourceField: sourceFields.length === new Set(sourceFields).size,
    noDuplicateTargetField: targetFields.length === new Set(targetFields).size,
    anyInventedSourceField: mappings.some((m) => m.sourceExistsInRealHandoff === false),
    anyLegacyAliasSourceField: mappings.some((m) => m.isLegacyAlias === true),
    anyUnknownTransform: mappings.some((m) => m.transformAllowed === false),
    anyCriticalDefault: mappings.some((m) => m.critical === true && m.defaultAllowed === true),
    anyLossyCritical: mappings.some((m) => m.critical === true && m.losslessRequired === false),
    anyImplemented: mappings.some((m) => m.implemented === true),
  };
  return safeCloneGenericModel({ ...core, fieldMappingExecutionPlanDigest: bridgePlanDigest(core) });
}

export default createFieldMappingExecutionPlan;
