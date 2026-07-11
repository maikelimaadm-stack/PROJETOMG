import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Deterministic, fictional machines (no real data, no sensitive data). */
const MACHINES = [
  { id: 'maq-7230', name: 'Trator 7230' },
  { id: 'maq-jacto', name: 'Pulverizador Jacto' },
  { id: 'maq-1550', name: 'Colheitadeira 1550' },
];
/** Deterministic, fictional operators. */
const OPERATORS = [
  { id: 'op-joao', name: 'João da Silva' },
  { id: 'op-maria', name: 'Maria Oliveira' },
];
/** Two deterministic, fictional fuel entries. */
const ENTRIES = [
  { date: '2025-01-10', machineId: 'maq-7230', machineName: 'Trator 7230', operatorId: 'op-joao', operatorName: 'João da Silva', fuelType: 'diesel', quantityLiters: 120, hourmeter: 3420, serviceDescription: 'Preparo de solo', location: 'Talhão 1' },
  { date: '2025-01-11', machineId: 'maq-1550', machineName: 'Colheitadeira 1550', operatorId: 'op-maria', operatorName: 'Maria Oliveira', fuelType: 'diesel', quantityLiters: 240, hourmeter: 5810, serviceDescription: 'Colheita', location: 'Talhão 3' },
];

const MODES = new Set(['empty', 'basic', 'withDraft', 'withEvents']);

/**
 * Builds DETERMINISTIC dev fixtures for the fuel preview. Fictional data only —
 * no real/sensitive data, no external source. Pure. `seedActions` is a list of
 * sandbox actions the preview state can dispatch to reach the requested mode.
 *
 * @param {Object} [options]
 * @param {'empty'|'basic'|'withDraft'|'withEvents'} [options.mode] Default 'basic'.
 * @returns {Object} fixtures
 */
export function createModeloBase2FuelDevPreviewFixtures(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const mode = typeof o.mode === 'string' && MODES.has(o.mode) ? o.mode : 'basic';

  /** @type {Array<{ action: string, payload?: Object }>} */
  const seedActions = [];
  if (mode !== 'empty') {
    seedActions.push({ action: 'newDraft', payload: {} });
    if (mode === 'basic' || mode === 'withDraft' || mode === 'withEvents') {
      for (const entry of ENTRIES) seedActions.push({ action: 'addFuelEntry', payload: { entry } });
    }
    if (mode === 'withEvents') {
      seedActions.push({ action: 'validate' });
      seedActions.push({ action: 'saveLocal' });
    }
  }

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-dev-preview-fixtures',
    mode,
    fictional: true,
    hasSensitiveData: false,
    machines: MACHINES.map((m) => ({ ...m })),
    operators: OPERATORS.map((op) => ({ ...op })),
    entries: mode === 'empty' ? [] : ENTRIES.map((e) => ({ ...e })),
    seedActions,
    modes: [...MODES],
    localOnly: true,
    sent: false,
    persistenceReal: false,
  });
}

export default createModeloBase2FuelDevPreviewFixtures;
