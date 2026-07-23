import { deepFreeze } from './deepFreeze.js';
/** Extensibility (declared). Core is NOT extensible; envelope extensions only namespaced + schema-known; no override. */
export const EXTENSIBILITY_CONTRACT = deepFreeze({
  kind: 'core-envelope-extensibility-contract',
  coreExtensionsAllowed: false,
  envelopeExtensionsAllowed: true,
  envelopeExtensionsMustBeNamespaced: true,
  envelopeExtensionsMustHaveSchema: true,
  forbiddenOverrides: deepFreeze(['critical', 'version', 'digest', 'core', 'canonical', 'certified', 'productExposed', 'previewMounted', 'moduleGenerated']),
  prototypePollutionKeysRejected: true,
  issueCodes: deepFreeze([
    'CORE_ENVELOPE_EXTENSION_UNNAMESPACED_FORBIDDEN', 'CORE_ENVELOPE_EXTENSION_MISSING_SCHEMA',
    'CORE_ENVELOPE_EXTENSION_CORE_OVERRIDE_FORBIDDEN', 'CORE_ENVELOPE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN',
  ]),
});
export default EXTENSIBILITY_CONTRACT;
