import {
  isPlainObject,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadSlotError } from './errors.js';

/** The ONLY operations a read-only slot may ever perform. */
export const SLOT_ALLOWED_OPERATIONS = [
  'receiveReadModel',
  'renderReadOnly',
  'inspectDiagnostics',
  'inspectParity',
  'inspectWriteGuard',
  'reportReadiness',
];

/** Everything a read-only slot must refuse — write, execution, legacy/bridge mutation, backend, storage, UI replacement. */
export const SLOT_BLOCKED_OPERATIONS = [
  'create',
  'update',
  'delete',
  'save',
  'submit',
  'bulkCreate',
  'bulkUpdate',
  'bulkDelete',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
  'mutateLegacyRuntime',
  'mutateRuntimeBridge',
  'writeBackend',
  'writeStorage',
  'replaceProductionUi',
];

/** The dev-only surfaces that may consume this read slot (never a public/production route). */
export const SLOT_CONSUMERS = ['devPreviewRoute', 'guardedReadUiOverlay', 'futureRuntimeBridgeReadSlot'];

/**
 * Builds the deterministic, plain READ-ONLY SLOT CONTRACT describing a FUTURE
 * controlled read slot between the Empresas runtime v2 read UI and the legacy
 * bridge environment — WITHOUT executing anything. Documentation-as-data: no
 * React element, no side-effect function, no backend/fetch, no Prisma/MMM, no
 * storage, no real data as primary source. Prototype pollution is blocked, the
 * result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {string} [options.contractId]
 * @param {string} [options.slotId]
 * @param {boolean} [options.dryRunVerified]
 * @returns {import('../../types/empresas-runtime-bridge-read-slot-candidate.js').EmpresasReadSlotContract}
 */
export function createEmpresasRuntimeBridgeReadSlotContract(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasReadSlotError('MAK-L3-EMP-READ-SLOT-003', 'createEmpresasRuntimeBridgeReadSlotContract() options must be a plain object');
  }
  const contractId = typeof options.contractId === 'string' && options.contractId.trim()
    ? options.contractId.trim()
    : 'empresas-runtime-bridge-read-slot-contract-v1';
  const slotId = typeof options.slotId === 'string' && options.slotId.trim()
    ? options.slotId.trim()
    : 'empresas-runtime-bridge-read-slot';

  const contract = {
    kind: 'empresas-runtime-bridge-read-slot-contract',
    contractId,
    slotId,
    moduleId: 'empresas',
    mode: 'read_only',
    candidate: true,
    dryRunVerified: options.dryRunVerified === true,
    allowedOperations: [...SLOT_ALLOWED_OPERATIONS],
    blockedOperations: [...SLOT_BLOCKED_OPERATIONS],
    requiredInputs: [
      'readOnlyViewModel',
      'guardedReadUiModel',
      'bridgeDryRun',
      'parityHardeningModel',
      'featureFlags',
    ],
    producedOutputs: [
      'readSlotPayload',
      'readOnlyRenderModel',
      'slotDiagnostics',
      'mountPlan',
      'rollbackPlan',
      'readinessStatus',
    ],
    slotConsumers: [...SLOT_CONSUMERS],
    fallback: {
      target: 'legacy Empresas screen',
      mechanism: 'flag off — the real screen stays legacy; the slot never activates',
      dataSource: 'legacy runtime (unchanged)',
    },
    rollback: {
      strategy: 'flag-off reversal',
      featureFlagDefault: 'off',
      destructive: false,
      schemaChange: false,
      realWrite: false,
    },
    safety: {
      readOnly: true,
      candidateOnly: true,
      noSideEffects: true,
      noBackend: true,
      noPrismaMmm: true,
      noStorage: true,
      noLegacyMutation: true,
      noRuntimeBridgeMutation: true,
      noProductionUiReplacement: true,
      writeImpossible: true,
    },
    diagnostics: {
      allowedCount: SLOT_ALLOWED_OPERATIONS.length,
      blockedCount: SLOT_BLOCKED_OPERATIONS.length,
      blocksWrite: SLOT_BLOCKED_OPERATIONS.includes('create') && SLOT_BLOCKED_OPERATIONS.includes('save'),
      blocksLegacyMutation: SLOT_BLOCKED_OPERATIONS.includes('mutateLegacyRuntime'),
      blocksRuntimeBridgeMutation: SLOT_BLOCKED_OPERATIONS.includes('mutateRuntimeBridge'),
      blocksBackend: SLOT_BLOCKED_OPERATIONS.includes('writeBackend'),
      blocksStorage: SLOT_BLOCKED_OPERATIONS.includes('writeStorage'),
      blocksProductionUiReplacement: SLOT_BLOCKED_OPERATIONS.includes('replaceProductionUi'),
    },
  };
  return /** @type {any} */ (safeClone(contract));
}
