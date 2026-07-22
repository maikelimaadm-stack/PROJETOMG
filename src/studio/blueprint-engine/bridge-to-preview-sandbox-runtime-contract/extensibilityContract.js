import { deepFreeze } from './deepFreeze.js';
export const EXTENSIBILITY_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-extensibility-contract',
  unknownCriticalFieldsRejected: true, unknownCapabilityFlagsRejected: true, unnamespacedExtensionsRejected: true,
  extensionNamespaceRequired: true, extensionSchemaRequired: true, duplicateNamespaceRejected: true,
  extensionCannotOverrideCriticalFields: true, extensionCannotOverrideCapabilities: true,
  extensionCannotOverrideVersions: true, extensionCannotOverrideDigests: true, prototypePollutionKeysRejected: true,
  extensionNeverEnables: ['canonical', 'certified', 'module', 'product', 'realData', 'mount', 'route', 'menu', 'persistence', 'network', 'production'],
  prototypePollutionKeys: ['__proto__', 'constructor', 'prototype'],
});
export default EXTENSIBILITY_CONTRACT;
