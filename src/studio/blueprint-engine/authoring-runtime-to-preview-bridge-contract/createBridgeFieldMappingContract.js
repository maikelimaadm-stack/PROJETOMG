import {
  BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, CRITICAL_SOURCE_FIELDS, REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS, bridgeDigest,
} from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the FIELD MAPPING contract (source -> target), aligned to the REAL handoff shape. Metadata
 * only, deterministic order. Every mapping's sourceField exists in the real handoff (no invented alias);
 * critical fields are required + lossless; unknown transforms fail closed; defaults on critical fields and
 * lossy critical mappings are forbidden; no silent critical rename. The count derives from the real model.
 * @returns {Object}
 */
export function createBridgeFieldMappingContract() {
  const mappings = BRIDGE_FIELD_MAPPINGS.map((m) => ({
    ...m,
    syntheticOnly: true,
    deterministic: true,
    critical: CRITICAL_SOURCE_FIELDS.includes(m.sourceField),
    transformAllowed: ALLOWED_TRANSFORM_KINDS.includes(m.transformKind),
    sourceExistsInRealHandoff: REAL_HANDOFF_FIELDS.includes(m.sourceField),
    isLegacyAlias: FORBIDDEN_LEGACY_SOURCE_FIELDS.includes(m.sourceField),
  }));
  const targetFields = mappings.map((m) => m.targetField);
  const sourceFields = mappings.map((m) => m.sourceField);
  const core = {
    kind: 'bridge-field-mapping-contract',
    mappings,
    mappingCount: mappings.length,
    allowedTransformKinds: [...ALLOWED_TRANSFORM_KINDS],
    criticalFieldMissingIsBlocker: true,
    unknownTransformFailsClosed: true,
    lossyCriticalForbidden: true,
    criticalDefaultForbidden: true,
    deterministicOrder: true,
    silentCriticalRenameForbidden: true,
    everyCriticalMapped: CRITICAL_SOURCE_FIELDS.every((f) => mappings.some((m) => m.sourceField === f)),
    everyMappingSourceExistsInRealHandoff: mappings.every((m) => m.sourceExistsInRealHandoff === true),
    everyRequiredTargetMapped: targetFields.length === new Set(targetFields).size && targetFields.every((t) => typeof t === 'string' && t.length > 0),
    noDuplicateSourceField: sourceFields.length === new Set(sourceFields).size,
    noDuplicateTargetField: targetFields.length === new Set(targetFields).size,
    anyInventedSourceField: mappings.some((m) => m.sourceExistsInRealHandoff === false),
    anyLegacyAliasSourceField: mappings.some((m) => m.isLegacyAlias === true),
    anyUnknownTransform: mappings.some((m) => m.transformAllowed === false),
    anyCriticalDefault: mappings.some((m) => m.critical === true && m.defaultAllowed === true),
    anyLossyCritical: mappings.some((m) => m.critical === true && m.losslessRequired === false),
  };
  return safeCloneGenericModel({ ...core, fieldMappingContractDigest: bridgeDigest(core) });
}

export default createBridgeFieldMappingContract;
