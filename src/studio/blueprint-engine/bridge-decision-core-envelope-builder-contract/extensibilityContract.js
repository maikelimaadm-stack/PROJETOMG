import { FORBIDDEN_PROTOTYPE_KEYS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Extensibility / prototype rules. Core NOT extensible; no critical/capability/digest/core/version override. */
export const EXTENSIBILITY_CONTRACT = deepFreeze({
  kind: 'builder-extensibility-contract',
  sourceExtensionsAllowed: false, // the real bridge decision shape is closed (unknown source fields rejected)
  coreExtensionsAllowed: false,
  envelopeExtensionsAllowed: false, // Core Envelope v2 fields are closed
  unknownCriticalFieldsRejected: true, unknownCapabilityFlagsRejected: true,
  digestOverrideRejected: true, coreOverrideRejected: true, versionOverrideRejected: true,
  prototypePollutionKeysRejected: true,
  dangerousKeys: [...FORBIDDEN_PROTOTYPE_KEYS],
  issueCodes: deepFreeze([
    'BUILDER_EXTENSION_CORE_OVERRIDE_FORBIDDEN', 'BUILDER_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN',
    'BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN',
  ]),
});
export default EXTENSIBILITY_CONTRACT;
