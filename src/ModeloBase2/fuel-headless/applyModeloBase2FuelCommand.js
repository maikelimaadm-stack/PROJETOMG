import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2FuelCommandMapper } from './createModeloBase2FuelCommandMapper.js';
import { createModeloBase2FuelEventMapper } from './createModeloBase2FuelEventMapper.js';
import { validateModeloBase2FuelPayload } from './validateModeloBase2FuelPayload.js';
import { createModeloBase2FuelDomainSchema } from './createModeloBase2FuelDomainSchema.js';
import { createModeloBase2FuelReadState } from './createModeloBase2FuelReadState.js';
import { createModeloBase2FuelDraft } from './createModeloBase2FuelDraft.js';
import { FUEL_DOMAIN, FUEL_OPERATION_TYPE, MODELOBASE2_MODEL_ID } from './modeloBase2FuelHeadlessConfig.js';
import { fuelError } from './errors.js';

/**
 * Applies a FUEL command by mapping it onto the ModeloBase2 operational runtime:
 * map command → validate fuel payload → dispatch on the operational session → map
 * the operational event to a fuel event → derive fuel read state/draft. Fail-closed
 * and side-effect-free (no backend/Prisma/fetch/runtimeBridge; never sends; never
 * real-persists). Returns safe copies.
 *
 * @param {Object} [options]
 * @param {string} [options.fuelCommandType]
 * @param {string} [options.moduleId]
 * @param {unknown} [options.payload]
 * @param {Object} [options.session] The ModeloBase2 operational session (stateful).
 * @param {Object} [options.commandMapper]
 * @param {Object} [options.eventMapper]
 * @param {Object} [options.schema]
 * @returns {Object} fuel result envelope
 */
export function applyModeloBase2FuelCommand(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelError('MAK-MB2-FUEL-001', 'applyModeloBase2FuelCommand() options must be a plain object');
  }
  const fuelCommandType = options.fuelCommandType;
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'combustivel';
  const payload = options.payload;
  const session = options.session;
  const commandMapper = isGenericModelPlainObject(options.commandMapper) ? options.commandMapper : createModeloBase2FuelCommandMapper({ moduleId });
  const eventMapper = isGenericModelPlainObject(options.eventMapper) ? options.eventMapper : createModeloBase2FuelEventMapper({ moduleId });
  const schema = isGenericModelPlainObject(options.schema) ? options.schema : createModeloBase2FuelDomainSchema();

  if (!isGenericModelPlainObject(session) || typeof session.dispatch !== 'function') {
    throw fuelError('MAK-MB2-FUEL-005', 'applyModeloBase2FuelCommand() requires an operational session');
  }

  const fail = (errors, warnings = []) => finalize({ ok: false, fuelCommandType, moduleId, operationalCommandType: null, session, event: null, snapshot: null, errors, warnings, eventMapper });

  // 1. Map command.
  const mapped = commandMapper.mapCommand({ fuelCommandType, payload });
  if (!mapped.ok) return fail(mapped.errors);
  const operationalCommandType = mapped.operationalCommandType;

  // 2. Validate fuel payload.
  const validation = validateModeloBase2FuelPayload({ commandType: fuelCommandType, payload, moduleId, schema });
  if (!validation.valid) return fail([...validation.errors, ...validation.blockers], validation.warnings);

  // 3. Build the operational payload.
  let operationalPayload;
  switch (fuelCommandType) {
    case 'appendFuelEntry':
      operationalPayload = { values: validation.normalizedFuelEntry };
      break;
    case 'updateFuelEntry':
      operationalPayload = { entryId: isGenericModelPlainObject(payload) ? payload.entryId : undefined, values: validation.normalizedFuelEntry };
      break;
    case 'removeFuelEntry':
      operationalPayload = { entryId: isGenericModelPlainObject(payload) ? payload.entryId : undefined };
      break;
    case 'restoreFuelSnapshot': {
      const snap = isGenericModelPlainObject(payload) ? payload.snapshot : null;
      operationalPayload = { snapshot: isGenericModelPlainObject(snap) && isGenericModelPlainObject(snap.snapshot) ? snap.snapshot : snap };
      break;
    }
    case 'createFuelDraft':
      operationalPayload = isGenericModelPlainObject(payload) ? payload : { operationType: FUEL_OPERATION_TYPE };
      break;
    default:
      operationalPayload = isGenericModelPlainObject(payload) ? payload : undefined;
      break;
  }

  // 4. Dispatch on the operational session.
  const result = session.dispatch({ commandType: operationalCommandType, payload: operationalPayload });
  if (!result.ok) return finalize({ ok: false, fuelCommandType, moduleId, operationalCommandType, session, event: result.event, snapshot: null, errors: result.errors, warnings: result.warnings, eventMapper });

  // 5. Wrap the snapshot (createFuelSnapshot) as a fuel snapshot descriptor.
  let fuelSnapshot = null;
  if (fuelCommandType === 'createFuelSnapshot' && isGenericModelPlainObject(result.snapshot)) {
    fuelSnapshot = safeCloneGenericModel({
      kind: 'modelobase2-fuel-snapshot',
      ok: true,
      domain: FUEL_DOMAIN,
      operationType: FUEL_OPERATION_TYPE,
      moduleId,
      snapshot: result.snapshot,
      snapshotId: result.snapshot.snapshotId,
      checksum: result.snapshot.checksum,
      localOnly: true,
      sent: false,
      persistenceReal: false,
    });
  }

  return finalize({ ok: true, fuelCommandType, moduleId, operationalCommandType, session, event: result.event, snapshot: fuelSnapshot, errors: [], warnings: result.warnings, eventMapper });
}

/** Wraps the result with the fuel envelope: fuel event, fuel draft/read state, diagnostics. */
function finalize(input) {
  const session = input.session;
  const state = typeof session.getState === 'function' ? session.getState() : {};
  const operationalDraft = isGenericModelPlainObject(state.draft) ? state.draft : {};
  const fuelDraft = createModeloBase2FuelDraft({ moduleId: input.moduleId, operationalDraft, status: state.status });
  const readState = createModeloBase2FuelReadState({ moduleId: input.moduleId, draft: operationalDraft, eventLog: Array.isArray(state.eventLog) ? state.eventLog : undefined, status: state.status });
  const fuelEvent = input.event ? input.eventMapper.mapEvent(input.event) : null;

  return {
    ok: input.ok === true,
    fuelCommand: typeof input.fuelCommandType === 'string' ? input.fuelCommandType : null,
    operationalCommand: input.operationalCommandType,
    event: fuelEvent,
    draft: fuelDraft,
    readState,
    snapshot: input.snapshot ?? null,
    localOnly: true,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    diagnostics: {
      domain: FUEL_DOMAIN,
      modelId: MODELOBASE2_MODEL_ID,
      fuelCommand: typeof input.fuelCommandType === 'string' ? input.fuelCommandType : null,
      ok: input.ok === true,
      totalLiters: fuelDraft.summary.totalLiters,
      entriesCount: fuelDraft.summary.totalEntries,
      localOnly: true,
      sent: false,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
    },
    errors: Array.isArray(input.errors) ? input.errors : [],
    warnings: Array.isArray(input.warnings) ? input.warnings : [],
  };
}

export default applyModeloBase2FuelCommand;
