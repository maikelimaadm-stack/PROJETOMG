import { RegistryError } from './errors.js';
import { RegistryValidation } from './RegistryValidation.js';

export class RegistryResolver {
  /**
   * @param {import('./RegistryCollection.js').RegistryCollection} collection
   */
  constructor(collection) {
    this._collection = collection;
  }

  /**
   * @template T
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   * @returns {T}
   */
  resolve(type, key) {
    RegistryValidation.validateLookup(type, key);
    const factory = this._collection.getFactory(type, key);
    if (!factory) {
      throw new RegistryError('MAK-L3-REGISTRY-002', `Registry entry not found: ${type}/${key}`);
    }
    return factory();
  }
}
