import { isPlainObject } from './safety.js';
import { readModeloBase1RuntimeReadModel } from '../config/modeloBase1RuntimeReadModel.js';

/**
 * Detects and normalizes the runtime read model attached to a ModeloBase1
 * config. Pure and side-effect-free. Reuses the existing injection-point reader
 * (`readModeloBase1RuntimeReadModel`) so absent/disabled models resolve to
 * `null` (the no-op / fallback signal).
 *
 * @param {object|null|undefined} config A built ModeloBase1 config.
 * @returns {import('./types.js').ModeloBase1RuntimeReadResolution}
 */
export function resolveModeloBase1RuntimeReadModel(config) {
  if (!isPlainObject(config)) {
    return { present: false, enabled: false, readModel: null };
  }
  const present = config.runtimeReadModel != null;
  const readModel = readModeloBase1RuntimeReadModel(config); // null when absent/disabled
  const enabled = readModel != null && readModel.enabled === true;
  return { present, enabled, readModel: enabled ? readModel : null };
}

export default resolveModeloBase1RuntimeReadModel;
