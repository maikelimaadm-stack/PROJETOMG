/**
 * Barrel for the ModeloBase2 FUEL HEADLESS CANDIDATE.
 *
 * The first real-domain (fuel/abastecimento) candidate on the ModeloBase2
 * operational runtime — HEADLESS: no UI/route/menu/src-modules, no backend/Prisma/
 * fetch/runtimeBridge, no real persistence, never sends; dangerous capabilities
 * false; localOnly/sent:false/persistenceReal:false. Maps fuel entries to the
 * runtime's commands/events/draft/read-state/snapshot. Reversible by non-consumption.
 */

export { createModeloBase2FuelHeadlessCandidate } from './createModeloBase2FuelHeadlessCandidate.js';
export { createModeloBase2FuelOperationalAdapter } from './createModeloBase2FuelOperationalAdapter.js';
export { createModeloBase2FuelDomainSchema } from './createModeloBase2FuelDomainSchema.js';
export { createModeloBase2FuelDraft } from './createModeloBase2FuelDraft.js';
export { createModeloBase2FuelCommandMapper } from './createModeloBase2FuelCommandMapper.js';
export { createModeloBase2FuelEventMapper } from './createModeloBase2FuelEventMapper.js';
export { validateModeloBase2FuelPayload } from './validateModeloBase2FuelPayload.js';
export { applyModeloBase2FuelCommand } from './applyModeloBase2FuelCommand.js';
export { createModeloBase2FuelReadState, computeFuelSummary } from './createModeloBase2FuelReadState.js';
export {
  createModeloBase2FuelSnapshot,
  validateModeloBase2FuelSnapshot,
  restoreModeloBase2FuelSnapshot,
  roundtripModeloBase2FuelSnapshot,
} from './createModeloBase2FuelSnapshot.js';
export { createModeloBase2FuelDiagnostics } from './createModeloBase2FuelDiagnostics.js';
export { createModeloBase2FuelFallback } from './createModeloBase2FuelFallback.js';
export {
  resolveModeloBase2FuelHeadlessConfig,
  isModeloBase2FuelHeadlessCandidateEnabled,
  isModeloBase2FuelOperationalAdapterEnabled,
  isModeloBase2FuelLocalEventDraftEnabled,
  isModeloBase2FuelSnapshotValidationEnabled,
  FUEL_DOMAIN,
  FUEL_OPERATION_TYPE,
  FUEL_HEADLESS_MODE,
  FUEL_COMMAND_TYPES,
  FUEL_EVENT_TYPES,
  FUEL_ENTRY_STATUSES,
  FUEL_HEADLESS_CANDIDATE_FLAG,
  FUEL_OPERATIONAL_ADAPTER_FLAG,
  FUEL_LOCAL_EVENT_DRAFT_FLAG,
  FUEL_SNAPSHOT_VALIDATION_FLAG,
} from './modeloBase2FuelHeadlessConfig.js';
export { ModeloBase2FuelError, fuelError } from './errors.js';
