import { BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, CRITICAL_SOURCE_FIELDS, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the FIELD MAPPING contract (source -> target). Metadata only, deterministic order. Critical
 * fields are required + lossless; unknown transforms fail closed; defaults on critical fields and lossy
 * critical mappings are forbidden; no silent critical rename. @returns {Object}
 */
export function createBridgeFieldMappingContract() {
  const mappings = BRIDGE_FIELD_MAPPINGS.map((m) => ({
    ...m,
    syntheticOnly: true,
    deterministic: true,
    critical: CRITICAL_SOURCE_FIELDS.includes(m.sourceField),
    transformAllowed: ALLOWED_TRANSFORM_KINDS.includes(m.transformKind),
  }));
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
    anyUnknownTransform: mappings.some((m) => m.transformAllowed === false),
    anyCriticalDefault: mappings.some((m) => m.critical === true && m.defaultAllowed === true),
    anyLossyCritical: mappings.some((m) => m.critical === true && m.losslessRequired === false),
  };
  return safeCloneGenericModel({ ...core, fieldMappingContractDigest: bridgeDigest(core) });
}

export default createBridgeFieldMappingContract;
