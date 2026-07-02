import { REGISTRY_TYPES } from './registryTypes.js';

/**
 * In-memory index: type → key → factory
 */
export class RegistryIndex {
  constructor() {
    /** @type {Map<string, Map<string, Function>>} */
    this._stores = new Map();
    for (const type of REGISTRY_TYPES) {
      this._stores.set(type, new Map());
    }
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @returns {Map<string, Function>}
   */
  collection(type) {
    return this._stores.get(type);
  }

  clear() {
    for (const store of this._stores.values()) {
      store.clear();
    }
  }
}
