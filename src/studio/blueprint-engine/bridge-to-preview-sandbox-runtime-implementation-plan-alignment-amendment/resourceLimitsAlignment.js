import { RESOURCE_LIMIT_CONTRACT, CORE_FIELD_COUNT, REAL_TARGET_DESCRIPTOR_FIELDS_REF } from '../bridge-decision-core-envelope-contract/index.js';
import { deepFreeze } from './deepFreeze.js';
/** Aligns runtime resource dimensions to the REAL Core Envelope Contract values (no divergent limits). */
const dimByName = {};
for (const d of RESOURCE_LIMIT_CONTRACT.dimensions) dimByName[d.dimension] = d;
export const RESOURCE_LIMITS_ALIGNMENT = deepFreeze({
  kind: 'resource-limits-alignment',
  dimensions: deepFreeze([
    deepFreeze({ dimension: 'maxCoreEnvelopeBytes', value: dimByName.maxEnvelopeBytes.sourceLimit, source: 'core-envelope-contract:maxEnvelopeBytes' }),
    deepFreeze({ dimension: 'maxCoreBytes', value: dimByName.maxCoreBytes.sourceLimit, source: 'core-envelope-contract:maxCoreBytes' }),
    deepFreeze({ dimension: 'maxCoreFields', value: CORE_FIELD_COUNT, source: 'core-envelope-contract:CORE_FIELD_COUNT (derived)' }),
    deepFreeze({ dimension: 'maxTargetDescriptorFields', value: REAL_TARGET_DESCRIPTOR_FIELDS_REF.length, source: 'core-envelope-contract:REAL_TARGET_DESCRIPTOR_FIELDS (derived)' }),
  ]),
  consumesRealContractValues: true, divergentLimitsKept: false,
});
export default RESOURCE_LIMITS_ALIGNMENT;
