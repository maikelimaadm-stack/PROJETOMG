import {
  isPlainObject,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasBridgeDryRunError } from './errors.js';

/** The ONLY operations a read-only bridge may ever perform. */
export const BRIDGE_ALLOWED_OPERATIONS = [
  'readModel',
  'renderReadOnly',
  'inspectDiagnostics',
  'compareSnapshots',
  'reportReadiness',
];

/** Everything a read-only bridge must refuse — write, execution, legacy mutation, backend, storage. */
export const BRIDGE_BLOCKED_OPERATIONS = [
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
  'writeBackend',
  'writeStorage',
];

/**
 * Builds the deterministic, plain READ-ONLY BRIDGE CONTRACT describing how a
 * FUTURE bridge could connect the Empresas read UI (runtime v2) to the legacy
 * bridge environment — WITHOUT executing anything. It is documentation-as-data:
 * no React element, no side-effect function, no backend/fetch, no Prisma/MMM,
 * no storage, no real data as primary source. Sensitive keys are masked,
 * prototype pollution is blocked, the result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {string} [options.contractId]
 * @returns {import('../../types/empresas-read-ui-runtime-bridge-dry-run.js').EmpresasRuntimeBridgeReadContract}
 */
export function createEmpresasRuntimeBridgeReadContract(options = {}) {
  if (!isPlainObject(options)) {
    throw new EmpresasBridgeDryRunError('MAK-L3-EMP-BRIDGE-DRY-003', 'createEmpresasRuntimeBridgeReadContract() options must be a plain object');
  }
  const contractId = typeof options.contractId === 'string' && options.contractId.trim()
    ? options.contractId.trim()
    : 'empresas-runtime-bridge-read-contract-v1';

  const contract = {
    kind: 'empresas-runtime-bridge-read-contract',
    contractId,
    moduleId: 'empresas',
    mode: 'read_only',
    dryRun: true,
    allowedOperations: [...BRIDGE_ALLOWED_OPERATIONS],
    blockedOperations: [...BRIDGE_BLOCKED_OPERATIONS],
    requiredInputs: [
      'guardedReadUiModel',
      'parityHardeningModel',
      'readOnlyCandidate',
      'dualReadCompare',
      'featureFlags',
    ],
    producedOutputs: [
      'readOnlyViewModel',
      'bridgeDiagnostics',
      'mountPlan',
      'rollbackPlan',
      'readinessStatus',
    ],
    sourceModel: 'runtime-v2 read-only view model (mock/controlled dataset)',
    targetConsumer: 'dev-preview-only surface (never the real Empresas screen)',
    fallback: {
      target: 'legacy Empresas screen',
      mechanism: 'flag off — the real screen stays legacy; the bridge never activates',
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
      noSideEffects: true,
      noBackend: true,
      noPrismaMmm: true,
      noStorage: true,
      noLegacyMutation: true,
      writeImpossible: true,
    },
    diagnostics: {
      allowedCount: BRIDGE_ALLOWED_OPERATIONS.length,
      blockedCount: BRIDGE_BLOCKED_OPERATIONS.length,
      blocksWrite: BRIDGE_BLOCKED_OPERATIONS.includes('create') && BRIDGE_BLOCKED_OPERATIONS.includes('save'),
      blocksLegacyMutation: BRIDGE_BLOCKED_OPERATIONS.includes('mutateLegacyRuntime'),
      blocksBackend: BRIDGE_BLOCKED_OPERATIONS.includes('writeBackend'),
      blocksStorage: BRIDGE_BLOCKED_OPERATIONS.includes('writeStorage'),
    },
  };
  return /** @type {any} */ (safeClone(contract));
}
