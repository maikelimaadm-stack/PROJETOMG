import { EXTENSION_PROTECTED_FIELDS, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the EXTENSIBILITY POLICY contract. Unknown critical fields / capability flags and
 * un-namespaced extensions are rejected; namespaced+schema'd extensions are allowed but can NEVER
 * override protected fields. Metadata only. @returns {Object}
 */
export function createBridgeExtensibilityPolicyContract() {
  const core = {
    kind: 'bridge-extensibility-policy-contract',
    unknownCriticalFieldsRejected: true,
    unknownCapabilityFlagsRejected: true,
    unnamespacedExtensionsRejected: true,
    namespacedExtensionsAllowed: true,
    extensionNamespaceRequired: true,
    extensionSchemaRequired: true,
    extensionCannotOverrideCriticalFields: true,
    protectedFields: [...EXTENSION_PROTECTED_FIELDS],
    protectedFieldCount: EXTENSION_PROTECTED_FIELDS.length,
  };
  return safeCloneGenericModel({ ...core, extensibilityPolicyContractDigest: bridgeDigest(core) });
}

export default createBridgeExtensibilityPolicyContract;
