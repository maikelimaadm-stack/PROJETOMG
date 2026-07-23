import { deepFreeze } from './deepFreeze.js';
/** Aligns the future runtime issue model to Core Envelope v2; keeps atomic fail-closed containment. Declaration only. */
export const FAILURE_CONTAINMENT_ALIGNMENT = deepFreeze({
  kind: 'failure-containment-alignment',
  addedIssueCodes: deepFreeze([
    'RUNTIME_CORE_ENVELOPE_REQUIRED', 'RUNTIME_CORE_REQUIRED', 'RUNTIME_CORE_FIELD_MISSING',
    'RUNTIME_CORE_EXTRA_FIELD_FORBIDDEN', 'RUNTIME_CORE_DIGEST_MISMATCH', 'RUNTIME_CORE_CROSS_DECISION_MIX_FORBIDDEN',
    'RUNTIME_V1_ENVELOPE_NOT_ACCEPTED', 'RUNTIME_CORE_ENVELOPE_VERSION_UNSUPPORTED',
  ]),
  atomicDecision: true, targetNullOnBlocker: true, partialDescriptorAllowed: false, sourceMutationAllowed: false,
  sideEffectsAllowed: false, rollbackByNonConsumption: true, sanitizedEmergencyRejection: true,
});
export default FAILURE_CONTAINMENT_ALIGNMENT;
