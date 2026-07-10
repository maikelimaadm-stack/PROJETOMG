import { isPlainObject, safeClone } from '../safety.js';

/**
 * Operations the local write plan MAY perform in this slice — all local,
 * planned or simulated. None persist anywhere.
 */
export const LOCAL_WRITE_ALLOWED_OPERATIONS = [
  'planCreate',
  'planUpdate',
  'planDelete',
  'planSave',
  'planSubmit',
  'simulateLocalMutation',
  'inspectLocalDraft',
  'validatePayload',
  'reportDiagnostics',
];

/**
 * Operations the local write plan MUST block — anything that would leave the
 * in-memory sandbox (backend, Prisma, fetch, storage, side effects, global
 * runtime / runtime bridge, production UI replacement).
 */
export const LOCAL_WRITE_BLOCKED_OPERATIONS = [
  'backendCreate',
  'backendUpdate',
  'backendDelete',
  'prismaCreate',
  'prismaUpdate',
  'prismaDelete',
  'fetchWrite',
  'persistStorage',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
  'mutateRuntimeBridge',
  'mutateGlobalRuntime',
  'replaceProductionUi',
];

/**
 * The simulated in-memory mutation verbs the controller understands (mapped from
 * the planned operations above).
 */
export const LOCAL_WRITE_MUTATION_OPERATIONS = ['createRow', 'updateRow', 'deleteRow', 'saveDraft', 'submitDraft'];

/**
 * Builds the LOCAL WRITE CONTRACT for a module. Pure, deterministic, passive —
 * a declarative description of what the controlled local write plan may/may not
 * do. No execution, no side effects. Returns a safe deep copy.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @returns {Object}
 */
export function createModeloBase1LocalWriteContract(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const enabled = Boolean(o.enabled);

  return safeClone({
    contractId: `modelobase1-local-write-${moduleId}`,
    mode: 'controlled_local_write_plan',
    moduleId,
    enabled,
    allowedOperations: [...LOCAL_WRITE_ALLOWED_OPERATIONS],
    blockedOperations: [...LOCAL_WRITE_BLOCKED_OPERATIONS],
    mutationOperations: [...LOCAL_WRITE_MUTATION_OPERATIONS],
    requiredInputs: ['moduleId', 'readState|runtimeReadModel', 'operation', 'payload'],
    producedOutputs: ['localDraft', 'nextReadModel', 'diagnostics'],
    safety: {
      localOnly: true,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistence: 'none',
      noSideEffects: true,
      dataSource: 'safe-copy-of-runtime-read-model',
    },
    fallback: {
      available: true,
      reason: 'flag off → beta read-only (no local write plan)',
    },
    rollback: {
      available: true,
      method: 'flag off / discard local draft (in-memory only)',
    },
    diagnostics: {
      localWritePlanEnabled: enabled,
      allowedOperationCount: LOCAL_WRITE_ALLOWED_OPERATIONS.length,
      blockedOperationCount: LOCAL_WRITE_BLOCKED_OPERATIONS.length,
    },
    nextAllowedStep: 'ModeloBase1 Controlled Local Write Activation',
  });
}

export default createModeloBase1LocalWriteContract;
