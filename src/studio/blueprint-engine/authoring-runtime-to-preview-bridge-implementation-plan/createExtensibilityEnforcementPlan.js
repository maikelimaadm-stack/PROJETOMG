import { EXTENSION_PROTECTED_FIELDS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * EXTENSIBILITY ENFORCEMENT PLAN — plans fail-closed extensibility: unknown critical fields / capability
 * flags and un-namespaced extensions rejected; namespaced + schema'd extensions allowed but can NEVER
 * override protected fields. Metadata only. @returns {Object}
 */
export function createExtensibilityEnforcementPlan() {
  const core = {
    kind: 'bridge-extensibility-enforcement-plan',
    extensibilityEnforcementPlanned: true,
    extensibilityEnforcementImplemented: false,
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
  return safeCloneGenericModel({ ...core, extensibilityEnforcementPlanDigest: bridgePlanDigest(core) });
}

export default createExtensibilityEnforcementPlan;
