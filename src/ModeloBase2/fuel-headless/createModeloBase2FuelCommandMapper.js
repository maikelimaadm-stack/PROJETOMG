import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  FUEL_DOMAIN,
  FUEL_OPERATION_TYPE,
  FUEL_COMMAND_TYPES,
} from './modeloBase2FuelHeadlessConfig.js';

/** Fuel command → ModeloBase2 operational command. */
const COMMAND_MAP = {
  createFuelDraft: 'createDraft',
  appendFuelEntry: 'appendEntry',
  updateFuelEntry: 'updateEntry',
  removeFuelEntry: 'removeEntry',
  validateFuelDraft: 'validateDraft',
  saveFuelDraft: 'saveDraft',
  submitFuelDraft: 'submitDraft',
  createFuelSnapshot: 'createSnapshot',
  restoreFuelSnapshot: 'restoreSnapshot',
  resetFuelDraft: 'resetDraft',
  inspectFuelDiagnostics: 'inspectDiagnostics',
};

/**
 * Maps FUEL commands to ModeloBase2 OPERATIONAL commands. Fail-closed on unknown
 * fuel commands. Pure; never mutates input.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} command mapper
 */
export function createModeloBase2FuelCommandMapper(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';

  /** @param {string} fuelCommandType @returns {string|null} */
  function map(fuelCommandType) {
    return Object.prototype.hasOwnProperty.call(COMMAND_MAP, fuelCommandType) ? COMMAND_MAP[fuelCommandType] : null;
  }

  /**
   * Maps a fuel command into a fuel command descriptor + operational command type.
   * @param {Object} input
   * @param {string} input.fuelCommandType
   * @param {unknown} [input.payload]
   * @returns {{ ok: boolean, fuelCommand: Object|null, operationalCommandType: string|null, errors: string[] }}
   */
  function mapCommand(input) {
    const i = isGenericModelPlainObject(input) ? input : {};
    const fuelCommandType = i.fuelCommandType;
    const operationalCommandType = map(fuelCommandType);
    if (!operationalCommandType || !FUEL_COMMAND_TYPES.includes(fuelCommandType)) {
      return { ok: false, fuelCommand: null, operationalCommandType: null, errors: [`fuel command "${String(fuelCommandType)}" is not known`] };
    }
    const fuelCommand = safeCloneGenericModel({
      kind: 'modelobase2-fuel-command',
      commandId: `fuel-cmd-${moduleId}-${fuelCommandType}`,
      fuelCommandType,
      operationalCommandType,
      domain: FUEL_DOMAIN,
      operationType: FUEL_OPERATION_TYPE,
      moduleId,
      modelId: MODELOBASE2_MODEL_ID,
      payload: isGenericModelPlainObject(i.payload) ? i.payload : (i.payload ?? null),
      localOnly: true,
      sent: false,
      persistenceReal: false,
    });
    return { ok: true, fuelCommand, operationalCommandType, errors: [] };
  }

  return {
    kind: 'modelobase2-fuel-command-mapper',
    moduleId,
    domain: FUEL_DOMAIN,
    commandMap: { ...COMMAND_MAP },
    fuelCommandTypes: [...FUEL_COMMAND_TYPES],
    map,
    mapCommand,
  };
}

export default createModeloBase2FuelCommandMapper;
