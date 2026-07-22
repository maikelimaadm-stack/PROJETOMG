import { deepFreeze } from './deepFreeze.js';
export const EXTENSIBILITY_CONTRACT = deepFreeze({
  kind: 'envelope-extensibility-contract',
  unknownCriticalFieldsRejected: true, unknownCapabilityFlagsRejected: true, unnamespacedExtensionsRejected: true,
  extensionNamespaceRequired: true, extensionSchemaRequired: true, duplicateNamespaceRejected: true,
  extensionCannotOverrideCriticalFields: true, extensionCannotOverrideCapabilities: true,
  extensionCannotOverrideVersions: true, extensionCannotOverrideDigests: true, prototypePollutionKeysRejected: true,
  prototypePollutionKeys: ['__proto__', 'constructor', 'prototype'],
  extensionNeverEnables: ['canonical', 'certified', 'module', 'product', 'realData', 'mount', 'route', 'menu', 'persistence', 'network', 'production'],
});
export default EXTENSIBILITY_CONTRACT;
