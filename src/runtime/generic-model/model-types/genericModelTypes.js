import { GENERIC_MODEL_TYPES } from '../contracts/genericModelContractConstants.js';

/**
 * Canonical MODEL TYPE DEFINITIONS for the Generic Model Runtime. Pure data — no
 * behavior, no imports of any adapter/UI/backend. Each definition declares the
 * contracts, capabilities, safety and shapes a model of that type is expected to
 * honor. `cadastro` covers ModeloBase1; `operacional` covers ModeloBase2; the rest
 * are future definitions with no real adapter yet. Dangerous capabilities are
 * declared but default to false everywhere in this slice.
 */

const READONLY_SAFETY = { localOnly: true, persistenceReal: false, sent: false, noSideEffects: true };

/** @type {Record<string, Object>} */
export const GENERIC_MODEL_TYPE_DEFINITIONS = {
  cadastro: {
    modelType: 'cadastro',
    family: 'modeloBase1',
    description: 'Cadastro/config-driven model (table + form, local CRUD). Covers ModeloBase1.',
    requiredContracts: ['runtimeContract', 'readContract', 'writeContract'],
    optionalContracts: ['persistenceContract', 'diagnostics', 'fallback'],
    allowedCapabilities: ['read', 'localWrite', 'localPersistenceValidation'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: ['table', 'form'], central: 'table/form' },
    expectedWriteShape: { style: 'crud-local', operations: ['create', 'update', 'delete', 'saveDraft', 'submitDraft'] },
    persistencePolicy: 'local_validation',
    sideEffectPolicy: 'none',
    futureAdapters: [],
  },
  operacional: {
    modelType: 'operacional',
    family: 'modeloBase2',
    description: 'Operational/launch/event model (entries + local event timeline, append-only). Covers ModeloBase2.',
    requiredContracts: ['runtimeContract', 'readContract', 'writeContract', 'eventContract'],
    optionalContracts: ['persistenceContract', 'diagnostics', 'fallback'],
    allowedCapabilities: ['read', 'localWrite', 'localPersistenceValidation', 'eventAppend'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: ['entries', 'timeline'], central: 'entries/timeline', compat: ['table', 'form'] },
    expectedWriteShape: { style: 'event-append', operations: ['appendLocalEvent', 'amendLocalEvent', 'discardLocalEvent', 'saveOperationalDraft', 'submitOperationalDraft'] },
    persistencePolicy: 'local_validation',
    sideEffectPolicy: 'none',
    futureAdapters: ['ModeloBase2 Operational Runtime Foundation'],
  },
  movimentacao: {
    modelType: 'movimentacao',
    family: null,
    description: 'Movement/transfer model (future). Event-append with future transaction support.',
    requiredContracts: ['runtimeContract', 'readContract', 'writeContract'],
    optionalContracts: ['eventContract', 'persistenceContract', 'diagnostics', 'fallback'],
    allowedCapabilities: ['read', 'localWrite', 'localPersistenceValidation', 'eventAppend'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish', 'transaction'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: ['entries'], central: 'movements' },
    expectedWriteShape: { style: 'event-append', operations: ['appendLocalEvent'] },
    persistencePolicy: 'local_validation',
    sideEffectPolicy: 'none',
    futureAdapters: ['ModeloBase3 (movimentacao) — future'],
  },
  financeiro: {
    modelType: 'financeiro',
    family: null,
    description: 'Financial model (future). Audit-required with future transaction support.',
    requiredContracts: ['runtimeContract', 'readContract', 'writeContract'],
    optionalContracts: ['persistenceContract', 'diagnostics', 'fallback'],
    allowedCapabilities: ['read', 'localWrite', 'localPersistenceValidation'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish', 'transaction'],
    defaultSafety: { ...READONLY_SAFETY, auditRequired: true },
    expectedReadShape: { requires: ['table'], central: 'ledger' },
    expectedWriteShape: { style: 'crud-local', operations: ['create', 'update'] },
    persistencePolicy: 'local_validation',
    sideEffectPolicy: 'none',
    futureAdapters: [],
  },
  relatorio: {
    modelType: 'relatorio',
    family: null,
    description: 'Report model (future). Read-only.',
    requiredContracts: ['runtimeContract', 'readContract'],
    optionalContracts: ['diagnostics', 'fallback'],
    allowedCapabilities: ['read', 'reporting'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: ['table'], central: 'report' },
    expectedWriteShape: { style: 'none', operations: [] },
    persistencePolicy: 'none',
    sideEffectPolicy: 'none',
    futureAdapters: [],
  },
  dashboard: {
    modelType: 'dashboard',
    family: null,
    description: 'Dashboard model (future). Read-only.',
    requiredContracts: ['runtimeContract', 'readContract'],
    optionalContracts: ['diagnostics', 'fallback'],
    allowedCapabilities: ['read', 'dashboarding'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: [], central: 'widgets' },
    expectedWriteShape: { style: 'none', operations: [] },
    persistencePolicy: 'none',
    sideEffectPolicy: 'none',
    futureAdapters: [],
  },
  workflow: {
    modelType: 'workflow',
    family: null,
    description: 'Workflow model (future). Workflow-state has NO side effects in this slice.',
    requiredContracts: ['runtimeContract', 'readContract'],
    optionalContracts: ['writeContract', 'diagnostics', 'fallback'],
    allowedCapabilities: ['read'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish', 'workflowState'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: [], central: 'states' },
    expectedWriteShape: { style: 'none', operations: [] },
    persistencePolicy: 'none',
    sideEffectPolicy: 'none',
    futureAdapters: [],
  },
  custom: {
    modelType: 'custom',
    family: null,
    description: 'Custom/user-defined model (future). Minimal read surface.',
    requiredContracts: ['runtimeContract'],
    optionalContracts: ['readContract', 'writeContract', 'diagnostics', 'fallback'],
    allowedCapabilities: ['read'],
    dangerousCapabilities: ['backendWrite', 'workflow', 'connector', 'marketplacePublish'],
    defaultSafety: { ...READONLY_SAFETY },
    expectedReadShape: { requires: [], central: 'custom' },
    expectedWriteShape: { style: 'none', operations: [] },
    persistencePolicy: 'none',
    sideEffectPolicy: 'none',
    futureAdapters: [],
  },
};

/** The model types the registry knows about (mirrors GENERIC_MODEL_TYPES). */
export const GENERIC_MODEL_KNOWN_TYPES = [...GENERIC_MODEL_TYPES];

export default GENERIC_MODEL_TYPE_DEFINITIONS;
