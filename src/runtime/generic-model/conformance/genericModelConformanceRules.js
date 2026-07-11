/**
 * ADAPTER CONFORMANCE RULES for the Generic Model Runtime. Pure data describing
 * WHAT a model adapter must expose to be conformant. The validator interprets
 * these tolerantly (an adapter may expose a contract directly or via its runtime
 * contract / bridge). `appliesWhen` gates a rule on a `supports` capability.
 */

/** @type {Array<{ id: string, description: string, appliesWhen: string|null, severity: 'blocker'|'warning' }>} */
export const GENERIC_MODEL_CONFORMANCE_RULES = [
  { id: 'adapterId', description: 'adapter exposes a string adapterId', appliesWhen: null, severity: 'blocker' },
  { id: 'modelFamily', description: 'adapter declares a modelFamily', appliesWhen: null, severity: 'blocker' },
  { id: 'modelType', description: 'adapter declares a modelType (matching the expected type)', appliesWhen: null, severity: 'blocker' },
  { id: 'supports', description: 'adapter declares a coherent supports object', appliesWhen: null, severity: 'blocker' },
  { id: 'readContract', description: 'adapter provides a read contract (directly or via runtimeContract/map)', appliesWhen: null, severity: 'blocker' },
  { id: 'writeContract', description: 'adapter provides a write contract when localWrite is supported', appliesWhen: 'localWrite', severity: 'blocker' },
  { id: 'eventContract', description: 'adapter provides an event contract when eventAppend is supported', appliesWhen: 'eventAppend', severity: 'blocker' },
  { id: 'persistence', description: 'adapter provides persistence/snapshot when localPersistenceValidation is supported', appliesWhen: 'localPersistenceValidation', severity: 'blocker' },
  { id: 'diagnostics', description: 'adapter provides diagnostics', appliesWhen: null, severity: 'blocker' },
  { id: 'fallback', description: 'adapter provides fallback', appliesWhen: null, severity: 'blocker' },
  { id: 'dangerousCapabilitiesFalse', description: 'dangerous capabilities are all false', appliesWhen: null, severity: 'blocker' },
  { id: 'localOnly', description: 'localOnly is true when local write is supported', appliesWhen: 'localWrite', severity: 'blocker' },
  { id: 'persistenceRealFalse', description: 'persistenceReal is false', appliesWhen: null, severity: 'blocker' },
  { id: 'sentFalse', description: 'sent is false for operational adapters', appliesWhen: 'eventAppend', severity: 'blocker' },
  { id: 'noForbiddenTargets', description: 'descriptor carries no forbidden backend/Prisma/runtimeBridge target keys', appliesWhen: null, severity: 'blocker' },
];

/**
 * @param {Object} supports
 * @returns {Array} rules that apply given the adapter's supports object
 */
export function getApplicableConformanceRules(supports) {
  const s = supports && typeof supports === 'object' ? supports : {};
  return GENERIC_MODEL_CONFORMANCE_RULES.filter((r) => r.appliesWhen === null || s[r.appliesWhen] === true);
}

export default GENERIC_MODEL_CONFORMANCE_RULES;
