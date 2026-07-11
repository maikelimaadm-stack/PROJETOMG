/**
 * Barrel for the ModeloBase2 OPERATIONAL PROTOTYPE (headless).
 *
 * ModeloBase2 is the first proof that the Generic Model Runtime is not bound to
 * ModeloBase1: a second model family (operacional / lançamento / evento / append)
 * built purely on the generic kernel. Headless — no real UI/route/menu, no
 * backend/Prisma/fetch/runtimeBridge, no real persistence, dangerous capabilities
 * false. Coexists with ModeloBase1; reversible by non-consumption.
 */

export { createModeloBase2PrototypeAdapter } from './createModeloBase2PrototypeAdapter.js';
export {
  createModeloBase2OperationalReadModel,
  computeOperationalSummary,
  computeOperationalTimeline,
} from './createModeloBase2OperationalReadModel.js';
export { createModeloBase2OperationalWriteContract } from './createModeloBase2OperationalWriteContract.js';
export { createModeloBase2OperationalEventContract } from './createModeloBase2OperationalEventContract.js';
export { createModeloBase2OperationalDraft } from './createModeloBase2OperationalDraft.js';
export { applyModeloBase2OperationalMutation } from './applyModeloBase2OperationalMutation.js';
export {
  createModeloBase2OperationalSnapshot,
  validateModeloBase2OperationalSnapshot,
  roundTripModeloBase2OperationalSnapshot,
} from './createModeloBase2OperationalSnapshot.js';
export { createModeloBase2OperationalDiagnostics } from './createModeloBase2OperationalDiagnostics.js';
export { createModeloBase2OperationalFallback } from './createModeloBase2OperationalFallback.js';
export {
  resolveModeloBase2PrototypeConfig,
  isModeloBase2PrototypeEnabled,
  isModeloBase2OperationalAdapterEnabled,
  isModeloBase2LocalEventDraftEnabled,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_SOURCE,
  MODELOBASE2_EVENT_TYPES,
  MODELOBASE2_DRAFT_STATUSES,
  MODELOBASE2_ALLOWED_OPERATIONS,
  MODELOBASE2_BLOCKED_OPERATIONS,
  MODELOBASE2_PROTOTYPE_FLAG,
  MODELOBASE2_OPERATIONAL_ADAPTER_FLAG,
  MODELOBASE2_LOCAL_EVENT_DRAFT_FLAG,
} from './modeloBase2PrototypeConfig.js';
export { ModeloBase2PrototypeError, modeloBase2Error } from './errors.js';
