import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2OperationalRuntime } from '../operational-runtime/createModeloBase2OperationalRuntime.js';
import { createModeloBase2FuelCommandMapper } from './createModeloBase2FuelCommandMapper.js';
import { createModeloBase2FuelEventMapper } from './createModeloBase2FuelEventMapper.js';
import { createModeloBase2FuelDomainSchema } from './createModeloBase2FuelDomainSchema.js';
import { createModeloBase2FuelReadState } from './createModeloBase2FuelReadState.js';
import { createModeloBase2FuelDiagnostics } from './createModeloBase2FuelDiagnostics.js';
import { createModeloBase2FuelFallback } from './createModeloBase2FuelFallback.js';
import { applyModeloBase2FuelCommand } from './applyModeloBase2FuelCommand.js';
import {
  createModeloBase2FuelSnapshot,
  validateModeloBase2FuelSnapshot,
  restoreModeloBase2FuelSnapshot,
  roundtripModeloBase2FuelSnapshot,
} from './createModeloBase2FuelSnapshot.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  FUEL_DOMAIN,
  FUEL_OPERATION_TYPE,
  FUEL_MODULE_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2FuelHeadlessConfig.js';
import { fuelError } from './errors.js';

/**
 * The FUEL → ModeloBase2 OPERATIONAL ADAPTER. Owns an operational runtime + session
 * and translates fuel commands/events to/from the operational runtime. Headless;
 * dangerous capabilities false; localOnly/sent/persistenceReal safe.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {() => string} [options.clock]
 * @returns {Object} fuel operational adapter
 */
export function createModeloBase2FuelOperationalAdapter(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelError('MAK-MB2-FUEL-001', 'createModeloBase2FuelOperationalAdapter() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : FUEL_MODULE_ID;
  const clock = typeof options.clock === 'function' ? options.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;

  const runtime = createModeloBase2OperationalRuntime({ moduleId });
  const session = runtime.createSession({ clock });
  const commandMapper = createModeloBase2FuelCommandMapper({ moduleId });
  const eventMapper = createModeloBase2FuelEventMapper({ moduleId });
  const schema = createModeloBase2FuelDomainSchema();

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-fuel-operational-adapter',
    adapterId: `fuel-op-adapter-${moduleId}`,
    domain: FUEL_DOMAIN,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    operationType: FUEL_OPERATION_TYPE,
    capabilities: runtime.capabilities, // dangerous ones stay false
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });

  function dispatch(fuelCommand) {
    const c = typeof fuelCommand === 'string' ? { fuelCommandType: fuelCommand } : (isGenericModelPlainObject(fuelCommand) ? fuelCommand : {});
    return applyModeloBase2FuelCommand({ fuelCommandType: c.fuelCommandType, moduleId, payload: c.payload, session, commandMapper, eventMapper, schema });
  }

  const getState = () => session.getState();
  const getEventLog = () => (typeof session.getEventLog === 'function' ? session.getEventLog() : []);
  const getReadState = () => {
    const state = session.getState();
    return createModeloBase2FuelReadState({ moduleId, draft: isGenericModelPlainObject(state.draft) ? state.draft : {}, eventLog: Array.isArray(state.eventLog) ? state.eventLog : undefined, status: state.status });
  };
  const getDiagnostics = () => {
    const state = session.getState();
    return createModeloBase2FuelDiagnostics({ candidateId: `fuel-candidate-${moduleId}`, moduleId, draft: isGenericModelPlainObject(state.draft) ? state.draft : {}, status: state.status });
  };
  const createSnapshot = () => dispatch({ fuelCommandType: 'createFuelSnapshot' }).snapshot;
  const restoreSnapshot = (fuelSnapshot) => dispatch({ fuelCommandType: 'restoreFuelSnapshot', payload: { snapshot: fuelSnapshot } });
  const reset = () => dispatch({ fuelCommandType: 'resetFuelDraft' });

  return {
    ...descriptor,
    runtime,
    session,
    sessionFactory: (input) => runtime.createSession(isGenericModelPlainObject(input) ? input : {}),
    commandMapper,
    eventMapper,
    schema,
    readStateFactory: (input) => createModeloBase2FuelReadState({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    snapshotFactory: (input) => createModeloBase2FuelSnapshot({ moduleId, clock, ...(isGenericModelPlainObject(input) ? input : {}) }),
    validateSnapshot: (input) => validateModeloBase2FuelSnapshot(isGenericModelPlainObject(input) ? input : {}),
    restoreSnapshotDescriptor: (input) => restoreModeloBase2FuelSnapshot(isGenericModelPlainObject(input) ? input : {}),
    roundtripSnapshot: (input) => roundtripModeloBase2FuelSnapshot({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    diagnostics: getDiagnostics(),
    fallback: (input) => createModeloBase2FuelFallback({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    dispatch,
    getState,
    getEventLog,
    getReadState,
    getDiagnostics,
    createSnapshot,
    restoreSnapshot,
    reset,
  };
}

export default createModeloBase2FuelOperationalAdapter;
