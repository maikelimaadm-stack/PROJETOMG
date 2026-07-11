import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { FUEL_DOMAIN, FUEL_ENTRY_STATUSES, FUEL_DEFAULT_FUEL_TYPE } from './modeloBase2FuelHeadlessConfig.js';

/** Minimal fuel-entry field descriptors. */
const FUEL_FIELDS = [
  { id: 'fuelEntryId', type: 'string', required: false },
  { id: 'date', type: 'string', required: true },
  { id: 'machineId', type: 'string', required: false },
  { id: 'machineName', type: 'string', required: false },
  { id: 'operatorId', type: 'string', required: false },
  { id: 'operatorName', type: 'string', required: false },
  { id: 'fuelType', type: 'string', required: false, default: FUEL_DEFAULT_FUEL_TYPE },
  { id: 'quantityLiters', type: 'number', required: true },
  { id: 'hourmeter', type: 'number', required: false },
  { id: 'serviceDescription', type: 'string', required: false },
  { id: 'location', type: 'string', required: false },
  { id: 'notes', type: 'string', required: false },
  { id: 'status', type: 'string', required: false, default: 'draft' },
];

/**
 * Builds the minimal FUEL DOMAIN SCHEMA (headless). Pure. Provides `validateEntry`
 * (domain rules) and `normalizeEntry` (defaults + coercion). No financial/stock/
 * device modeling in this slice.
 *
 * @param {Object} [options]
 * @returns {Object} schema
 */
export function createModeloBase2FuelDomainSchema(options = {}) {
  void (isGenericModelPlainObject(options) ? options : {});

  /**
   * Validates a fuel entry against the domain rules.
   * @param {unknown} entry
   * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
   */
  function validateEntry(entry) {
    /** @type {string[]} */ const errors = [];
    /** @type {string[]} */ const warnings = [];
    if (!isGenericModelPlainObject(entry)) return { valid: false, errors: ['fuel entry must be a plain object'], warnings };
    if (typeof entry.date !== 'string' || entry.date.length === 0) errors.push('date is required');
    const hasMachine = (typeof entry.machineId === 'string' && entry.machineId.length > 0) || (typeof entry.machineName === 'string' && entry.machineName.length > 0);
    if (!hasMachine) errors.push('machineId or machineName is required');
    if (typeof entry.quantityLiters !== 'number' || !Number.isFinite(entry.quantityLiters) || entry.quantityLiters <= 0) errors.push('quantityLiters must be a number > 0');
    if (entry.hourmeter !== undefined && entry.hourmeter !== null) {
      if (typeof entry.hourmeter !== 'number' || !Number.isFinite(entry.hourmeter) || entry.hourmeter < 0) errors.push('hourmeter must be a number >= 0 when provided');
    }
    if (entry.operatorId === undefined && entry.operatorName === undefined) warnings.push('operator not provided');
    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Normalizes a fuel entry (defaults + safe invariants). Pure; returns a copy.
   * @param {Object} entry
   * @returns {Object}
   */
  function normalizeEntry(entry) {
    const e = isGenericModelPlainObject(entry) ? entry : {};
    return safeCloneGenericModel({
      fuelEntryId: typeof e.fuelEntryId === 'string' ? e.fuelEntryId : null,
      date: typeof e.date === 'string' ? e.date : null,
      machineId: typeof e.machineId === 'string' ? e.machineId : null,
      machineName: typeof e.machineName === 'string' ? e.machineName : null,
      operatorId: typeof e.operatorId === 'string' ? e.operatorId : null,
      operatorName: typeof e.operatorName === 'string' ? e.operatorName : null,
      fuelType: typeof e.fuelType === 'string' ? e.fuelType : FUEL_DEFAULT_FUEL_TYPE,
      quantityLiters: typeof e.quantityLiters === 'number' ? e.quantityLiters : null,
      hourmeter: typeof e.hourmeter === 'number' ? e.hourmeter : null,
      serviceDescription: typeof e.serviceDescription === 'string' ? e.serviceDescription : null,
      location: typeof e.location === 'string' ? e.location : null,
      notes: typeof e.notes === 'string' ? e.notes : null,
      status: typeof e.status === 'string' && FUEL_ENTRY_STATUSES.includes(e.status) ? e.status : 'draft',
      localOnly: true,
      sent: false,
      validation: { valid: validateEntry(e).valid },
    });
  }

  return {
    kind: 'modelobase2-fuel-domain-schema',
    domain: FUEL_DOMAIN,
    fields: FUEL_FIELDS.map((f) => ({ ...f })),
    statuses: [...FUEL_ENTRY_STATUSES],
    defaults: { fuelType: FUEL_DEFAULT_FUEL_TYPE, status: 'draft', localOnly: true, sent: false, persistenceReal: false },
    outOfScope: ['financial-calculation', 'stock/tank', 'real-machine-integration', 'sync'],
    validateEntry,
    normalizeEntry,
  };
}

export default createModeloBase2FuelDomainSchema;
