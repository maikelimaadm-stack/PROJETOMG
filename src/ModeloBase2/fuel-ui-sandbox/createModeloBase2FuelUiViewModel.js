import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  FUEL_DOMAIN,
  FUEL_UI_SANDBOX_TITLE,
  FUEL_UI_SANDBOX_SUBTITLE,
  FUEL_SANDBOX_ACTIONS,
} from './modeloBase2FuelUiSandboxConfig.js';

/** Form field descriptors (presentational). */
const FORM_FIELDS = [
  { id: 'date', label: 'Data', type: 'date', required: true },
  { id: 'machineName', label: 'Máquina', type: 'text', required: true },
  { id: 'operatorName', label: 'Operador', type: 'text', required: false },
  { id: 'fuelType', label: 'Combustível', type: 'text', required: false },
  { id: 'quantityLiters', label: 'Litros', type: 'number', required: true },
  { id: 'hourmeter', label: 'Horímetro', type: 'number', required: false },
  { id: 'serviceDescription', label: 'Serviço', type: 'text', required: false },
  { id: 'location', label: 'Local', type: 'text', required: false },
  { id: 'notes', label: 'Observações', type: 'text', required: false },
];

/** Table column descriptors (presentational). */
const TABLE_COLUMNS = [
  { id: 'date', label: 'Data' },
  { id: 'machineName', label: 'Máquina' },
  { id: 'quantityLiters', label: 'Litros' },
  { id: 'hourmeter', label: 'Horímetro' },
  { id: 'operatorName', label: 'Operador' },
  { id: 'serviceDescription', label: 'Serviço' },
  { id: 'status', label: 'Status' },
];

/** Value of an operational entry (entry.values) or the entry itself. */
function entryValues(entry) {
  if (!isGenericModelPlainObject(entry)) return {};
  return isGenericModelPlainObject(entry.values) ? entry.values : entry;
}

/**
 * Builds the FUEL SANDBOX VIEW MODEL (presentational) from the fuel headless read
 * state + draft + diagnostics + timeline. Pure; React-free; never mutates input.
 *
 * @param {Object} [options]
 * @param {Object} [options.draft] Fuel draft.
 * @param {Object} [options.readState] Fuel read state.
 * @param {Object} [options.diagnostics] Fuel/sandbox diagnostics.
 * @param {Array} [options.timeline] Fuel event timeline.
 * @returns {Object} view model
 */
export function createModeloBase2FuelUiViewModel(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const readState = isGenericModelPlainObject(o.readState) ? o.readState : {};
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const summary = isGenericModelPlainObject(readState.summary) ? readState.summary : (isGenericModelPlainObject(draft.summary) ? draft.summary : {});
  const entries = Array.isArray(readState.entries) ? readState.entries : (Array.isArray(draft.entries) ? draft.entries : []);
  const timelineEvents = Array.isArray(o.timeline) ? o.timeline : (isGenericModelPlainObject(readState.timeline) && Array.isArray(readState.timeline.events) ? readState.timeline.events : []);
  const status = typeof readState.status === 'string' ? readState.status : (typeof draft.status === 'string' ? draft.status : 'idle');

  const rows = entries.map((e) => {
    const v = entryValues(e);
    return {
      id: isGenericModelPlainObject(e) ? e.entryId : null,
      status: isGenericModelPlainObject(e) && typeof e.status === 'string' ? e.status : (typeof v.status === 'string' ? v.status : 'pending'),
      cells: {
        date: v.date ?? null,
        machineName: v.machineName ?? v.machineId ?? null,
        quantityLiters: typeof v.quantityLiters === 'number' ? v.quantityLiters : null,
        hourmeter: typeof v.hourmeter === 'number' ? v.hourmeter : null,
        operatorName: v.operatorName ?? v.operatorId ?? null,
        serviceDescription: v.serviceDescription ?? null,
      },
    };
  });

  const badges = [
    { id: 'localOnly', label: 'Local beta', tone: 'info' },
    { id: 'offlineFirst', label: 'Offline-first beta', tone: 'info' },
    { id: 'notSynced', label: 'Não sincronizado', tone: 'warn' },
    { id: 'sentFalse', label: 'sent:false', tone: 'muted' },
    { id: 'persistenceRealFalse', label: 'persistenceReal:false', tone: 'muted' },
  ];

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-ui-view-model',
    domain: FUEL_DOMAIN,
    title: FUEL_UI_SANDBOX_TITLE,
    subtitle: FUEL_UI_SANDBOX_SUBTITLE,
    status,
    badges,
    form: { fields: FORM_FIELDS.map((f) => ({ ...f })) },
    table: { columns: TABLE_COLUMNS.map((c) => ({ ...c })), rows },
    timeline: { events: timelineEvents.map((ev) => (isGenericModelPlainObject(ev) ? { eventId: ev.eventId, eventType: ev.eventType, sequence: ev.sequence, createdAt: ev.createdAt } : null)).filter(Boolean) },
    summaryCards: [
      { id: 'totalEntries', label: 'Lançamentos', value: typeof summary.totalEntries === 'number' ? summary.totalEntries : 0 },
      { id: 'totalLiters', label: 'Litros', value: typeof summary.totalLiters === 'number' ? summary.totalLiters : 0 },
      { id: 'machinesCount', label: 'Máquinas', value: typeof summary.machinesCount === 'number' ? summary.machinesCount : 0 },
      { id: 'operatorsCount', label: 'Operadores', value: typeof summary.operatorsCount === 'number' ? summary.operatorsCount : 0 },
      { id: 'status', label: 'Status', value: status },
    ],
    diagnostics: isGenericModelPlainObject(o.diagnostics) ? o.diagnostics : null,
    actions: [...FUEL_SANDBOX_ACTIONS],
    emptyState: rows.length === 0 ? { message: 'Nenhum lançamento de combustível ainda. Adicione o primeiro.' } : null,
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelUiViewModel;
