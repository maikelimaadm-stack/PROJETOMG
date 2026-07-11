/**
 * Capability vocabulary + per-model-type DEFAULTS for the Generic Model Runtime.
 * Pure data. Dangerous capabilities default to false for EVERY type in this slice
 * (future transaction/workflowState/backendWrite stay false until an explicit,
 * audited gate enables them).
 */

/** The full capability key set the matrix reasons about. */
export const GENERIC_MODEL_CAPABILITY_KEYS = [
  'read',
  'localWrite',
  'localPersistenceValidation',
  'eventAppend',
  'transaction',
  'reporting',
  'dashboarding',
  'workflowState',
  'backendWrite',
  'connector',
  'marketplacePublish',
  'studioEditable',
];

/** Capabilities that MUST be false unless an explicit allow-dangerous gate enables them. */
export const GENERIC_MODEL_DANGEROUS_CAPABILITY_KEYS = ['backendWrite', 'connector', 'marketplacePublish', 'workflowState', 'transaction'];

const ALL_FALSE = Object.fromEntries(GENERIC_MODEL_CAPABILITY_KEYS.map((k) => [k, false]));

/** @param {Partial<Record<string, boolean>>} over */
const caps = (over) => ({ ...ALL_FALSE, ...over });

/** @type {Record<string, Record<string, boolean>>} */
export const GENERIC_MODEL_CAPABILITY_DEFAULTS = {
  cadastro: caps({ read: true, localWrite: true, localPersistenceValidation: true }),
  operacional: caps({ read: true, localWrite: true, localPersistenceValidation: true, eventAppend: true }),
  // transaction is a future capability — stays false in this slice.
  movimentacao: caps({ read: true, localWrite: true, localPersistenceValidation: true, eventAppend: true }),
  // transaction/auditRequired are future — transaction stays false here.
  financeiro: caps({ read: true, localWrite: true, localPersistenceValidation: true }),
  relatorio: caps({ read: true, reporting: true }),
  dashboard: caps({ read: true, dashboarding: true }),
  // workflowState is a future capability with side effects — stays false here.
  workflow: caps({ read: true }),
  custom: caps({ read: true }),
};

export default GENERIC_MODEL_CAPABILITY_DEFAULTS;
