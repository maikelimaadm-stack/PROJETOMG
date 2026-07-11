/**
 * Barrel for the ModeloBase2 OPERATIONAL RUNTIME FOUNDATION (headless).
 *
 * A reusable operational foundation (session + state machine + command resolver +
 * event log + derived read state + snapshot bridge + diagnostics + fallback) built
 * on the generic-model kernel and the ModeloBase2 prototype adapter. Headless — no
 * real UI/route/menu/module, no backend/Prisma/fetch/runtimeBridge, no real
 * persistence, never sends; dangerous capabilities false. Coexists with
 * ModeloBase1; reversible by non-consumption. Prepares future real operational
 * modules (combustível, pesagem, apontamento, …).
 */

export { createModeloBase2OperationalRuntime } from './createModeloBase2OperationalRuntime.js';
export { createModeloBase2OperationalSession } from './createModeloBase2OperationalSession.js';
export { createModeloBase2OperationalStateMachine } from './createModeloBase2OperationalStateMachine.js';
export { resolveModeloBase2OperationalCommand, getModeloBase2CommandMapping } from './resolveModeloBase2OperationalCommand.js';
export { applyModeloBase2OperationalCommand } from './applyModeloBase2OperationalCommand.js';
export { validateModeloBase2OperationalCommandPayload } from './validateModeloBase2OperationalCommandPayload.js';
export { createModeloBase2OperationalEventLog } from './createModeloBase2OperationalEventLog.js';
export { createModeloBase2OperationalReadState } from './createModeloBase2OperationalReadState.js';
export { createModeloBase2OperationalSnapshotBridge } from './createModeloBase2OperationalSnapshotBridge.js';
export { createModeloBase2OperationalRuntimeDiagnostics } from './createModeloBase2OperationalRuntimeDiagnostics.js';
export { createModeloBase2OperationalRuntimeFallback } from './createModeloBase2OperationalRuntimeFallback.js';
export {
  resolveModeloBase2OperationalRuntimeConfig,
  isModeloBase2OperationalRuntimeFoundationEnabled,
  isModeloBase2OperationalSessionEnabled,
  isModeloBase2OperationalEventLogEnabled,
  isModeloBase2OperationalSnapshotBridgeEnabled,
  MODELOBASE2_RUNTIME_STATES,
  MODELOBASE2_COMMAND_TYPES,
  MODELOBASE2_RUNTIME_EVENT_TYPES,
  MODELOBASE2_OPERATIONAL_RUNTIME_MODE,
  MODELOBASE2_OPERATIONAL_RUNTIME_FOUNDATION_FLAG,
  MODELOBASE2_OPERATIONAL_SESSION_FLAG,
  MODELOBASE2_OPERATIONAL_EVENT_LOG_FLAG,
  MODELOBASE2_OPERATIONAL_SNAPSHOT_BRIDGE_FLAG,
} from './modeloBase2OperationalRuntimeConfig.js';
export { ModeloBase2OperationalRuntimeError, operationalRuntimeError } from './errors.js';
