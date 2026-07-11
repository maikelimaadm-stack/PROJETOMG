import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { GENERIC_MODEL_TYPE_DEFINITIONS, GENERIC_MODEL_KNOWN_TYPES } from './genericModelTypes.js';
import { validateGenericModelTypeDefinition } from './validateGenericModelTypeDefinition.js';

/**
 * Builds a MODEL TYPE REGISTRY for the Generic Model Runtime. Pure/testable: it
 * holds validated model type definitions (cadastro/operacional/… future types),
 * lets callers register additional ones (validated, fail-closed), and never
 * enables dangerous capabilities. No adapter/UI/backend import.
 *
 * @param {Object} [options]
 * @param {Record<string, Object>} [options.definitions] Seed definitions (defaults to the canonical set).
 * @returns {Object} registry
 */
export function createGenericModelTypeRegistry(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const seed = isGenericModelPlainObject(o.definitions) ? o.definitions : GENERIC_MODEL_TYPE_DEFINITIONS;

  /** @type {Map<string, Object>} */
  const store = new Map();
  for (const [type, def] of Object.entries(seed)) {
    const validation = validateGenericModelTypeDefinition({ definition: def });
    if (validation.safeToRegister) store.set(type, safeCloneGenericModel(def));
  }

  function get(modelType) {
    const def = store.get(modelType);
    return def ? safeCloneGenericModel(def) : null;
  }
  function has(modelType) {
    return store.has(modelType);
  }
  function list() {
    return [...store.keys()].sort();
  }
  function register(definition) {
    const validation = validateGenericModelTypeDefinition({ definition });
    if (!validation.safeToRegister) return { ok: false, ...validation };
    store.set(definition.modelType, safeCloneGenericModel(definition));
    return { ok: true, ...validation };
  }

  return {
    kind: 'generic-model-type-registry',
    knownTypes: [...GENERIC_MODEL_KNOWN_TYPES],
    dangerousCapabilitiesDefaultFalse: true,
    localOnly: true,
    persistenceReal: false,
    get,
    has,
    list,
    register,
    get size() {
      return store.size;
    },
  };
}

export default createGenericModelTypeRegistry;
