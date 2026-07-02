import { RegistryError } from './errors.js';

export class RegistryCollection {
  /**
   * @param {import('./RegistryIndex.js').RegistryIndex} index
   */
  constructor(index) {
    this._index = index;
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   * @param {Function} factory
   */
  add(type, key, factory) {
    const store = this._index.collection(type);
    if (store.has(key)) {
      throw new RegistryError('MAK-L3-REGISTRY-001', `Duplicate registry key: ${type}/${key}`);
    }
    store.set(key, factory);
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   * @returns {Function|undefined}
   */
  getFactory(type, key) {
    return this._index.collection(type).get(key);
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @returns {string[]}
   */
  keys(type) {
    return [...this._index.collection(type).keys()];
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   */
  remove(type, key) {
    this._index.collection(type).delete(key);
  }
}
