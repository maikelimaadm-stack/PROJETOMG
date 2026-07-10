/**
 * Shared constants for the Generic Model Runtime foundation. Pure data — no
 * behavior, no imports, no side effects. These are the vocabulary every generic
 * contract shares (model types, storage modes, write operations, capabilities).
 */

/** Model types the generic runtime is designed to serve. */
export const GENERIC_MODEL_TYPES = [
  'cadastro',
  'operacional',
  'movimentacao',
  'financeiro',
  'relatorio',
  'dashboard',
  'workflow',
  'custom',
];

/** Storage modes allowed by the foundation — never real/mandatory storage. */
export const GENERIC_MODEL_STORAGE_MODES = ['memory_validation', 'injected_adapter_validation'];

/** Local, non-persisting write operations the generic write contract allows. */
export const GENERIC_MODEL_ALLOWED_WRITE_OPERATIONS = [
  'create',
  'update',
  'delete',
  'saveDraft',
  'submitDraft',
  'resetDraft',
  'validatePayload',
  'simulateMutation',
];

/** Operations the generic write contract blocks by default (leave the sandbox). */
export const GENERIC_MODEL_BLOCKED_WRITE_OPERATIONS = [
  'backendCreate',
  'backendUpdate',
  'backendDelete',
  'prismaCreate',
  'prismaUpdate',
  'prismaDelete',
  'fetchWrite',
  'directDatabaseWrite',
  'persistStorageAutomatically',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
  'mutateRuntimeBridge',
  'mutateGlobalRuntime',
  'replaceProductionUi',
];

/** Runtime capabilities — dangerous ones default to false (fail-safe). */
export const GENERIC_MODEL_CAPABILITIES = [
  'read',
  'localWrite',
  'localPersistenceValidation',
  'backendWrite',
  'workflow',
  'connector',
  'marketplacePublish',
  'studioEditable',
];

/** Capabilities that MUST be false unless an explicit, audited gate enables them. */
export const GENERIC_MODEL_DANGEROUS_CAPABILITIES = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'];

/** Read-model sources the foundation recognizes as safe/local. */
export const GENERIC_MODEL_SAFE_SOURCES = ['runtime-v2-beta', 'controlled-dev-dataset', 'generic-model-local', 'structural-only'];

/** Current snapshot schema version. */
export const GENERIC_MODEL_SCHEMA_VERSION = 1;

/** The next planned step — NOT a full replacement of ModeloBase1. */
export const GENERIC_MODEL_NEXT_STEP = 'ModeloBase1 Adapter to Generic Kernel';
