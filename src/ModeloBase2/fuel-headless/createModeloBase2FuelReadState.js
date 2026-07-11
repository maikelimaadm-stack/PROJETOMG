import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2OperationalReadState } from '../operational-runtime/createModeloBase2OperationalReadState.js';
import { FUEL_DOMAIN, FUEL_OPERATION_TYPE } from './modeloBase2FuelHeadlessConfig.js';

/** The fuel value carried by an operational entry (entry.values) or the entry itself. */
function fuelValues(entry) {
  if (!isGenericModelPlainObject(entry)) return {};
  if (isGenericModelPlainObject(entry.values)) return entry.values;
  return entry;
}

/**
 * Computes the FUEL SUMMARY from operational entries. Pure.
 * @param {Array} entries
 * @returns {Object}
 */
export function computeFuelSummary(entries) {
  const list = Array.isArray(entries) ? entries : [];
  let totalLiters = 0;
  let validEntries = 0;
  let invalidEntries = 0;
  let removedEntries = 0;
  let lastEntryAt = null;
  const machines = new Set();
  const operators = new Set();
  for (const e of list) {
    const v = fuelValues(e);
    if (typeof v.quantityLiters === 'number' && Number.isFinite(v.quantityLiters)) totalLiters += v.quantityLiters;
    const status = isGenericModelPlainObject(e) && typeof e.status === 'string' ? e.status : (typeof v.status === 'string' ? v.status : 'pending');
    if (status === 'invalid') invalidEntries += 1;
    else if (status === 'removed') removedEntries += 1;
    else validEntries += 1;
    const machine = v.machineId || v.machineName;
    if (machine) machines.add(String(machine));
    const operator = v.operatorId || v.operatorName;
    if (operator) operators.add(String(operator));
    const ts = isGenericModelPlainObject(e) && typeof e.timestamp === 'string' ? e.timestamp : (typeof v.date === 'string' ? v.date : null);
    if (ts && (lastEntryAt === null || ts > lastEntryAt)) lastEntryAt = ts;
  }
  return {
    totalEntries: list.length,
    activeEntries: validEntries,
    validEntries,
    invalidEntries,
    removedEntries,
    totalLiters,
    lastEntryAt,
    machinesCount: machines.size,
    operatorsCount: operators.size,
  };
}

/** Suggested compatibility table columns. */
const FUEL_TABLE_COLUMNS = [
  { id: 'date' }, { id: 'machineName' }, { id: 'quantityLiters' }, { id: 'hourmeter' },
  { id: 'operatorName' }, { id: 'serviceDescription' }, { id: 'status' },
];
/** Suggested compatibility form fields. */
const FUEL_FORM_FIELDS = [
  { id: 'date' }, { id: 'machineId' }, { id: 'machineName' }, { id: 'operatorId' }, { id: 'operatorName' },
  { id: 'fuelType' }, { id: 'quantityLiters' }, { id: 'hourmeter' }, { id: 'serviceDescription' },
  { id: 'location' }, { id: 'notes' },
];

/**
 * Derives a FUEL READ STATE from a draft/session (entries + event log). Reuses the
 * operational read state (entries/timeline) and overlays the fuel summary + fuel
 * table/form. Pure; never mutates input.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft]
 * @param {Object|Array} [options.eventLog]
 * @param {string} [options.status]
 * @returns {Object} fuel read state
 */
export function createModeloBase2FuelReadState(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (typeof draft.moduleId === 'string' ? draft.moduleId : 'combustivel');
  const entries = Array.isArray(draft.entries) ? draft.entries : [];

  const base = createModeloBase2OperationalReadState({ moduleId, draft, eventLog: o.eventLog, status: o.status, operationType: FUEL_OPERATION_TYPE });
  const summary = computeFuelSummary(entries);

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-read-state',
    domain: FUEL_DOMAIN,
    operationType: FUEL_OPERATION_TYPE,
    moduleId,
    modelType: base.readState.modelType,
    status: base.readState.status,
    entries: base.readState.entries,
    summary,
    timeline: base.readState.timeline,
    table: { columns: FUEL_TABLE_COLUMNS.map((c) => ({ ...c })), rows: entries.map((e) => ({ id: isGenericModelPlainObject(e) ? e.entryId : null, cells: fuelValues(e) })) },
    form: { fields: FUEL_FORM_FIELDS.map((f) => ({ ...f })) },
    diagnostics: { domain: FUEL_DOMAIN, totalLiters: summary.totalLiters, entriesCount: entries.length, localOnly: true, sent: false, persistenceReal: false },
  });
}

export default createModeloBase2FuelReadState;
