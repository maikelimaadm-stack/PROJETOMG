import { RegistryError } from './errors.js';
import { RegistryValidation } from './RegistryValidation.js';

export class RegistryLookup {
  /**
   * @param {import('./RegistryCollection.js').RegistryCollection} collection
   */
  constructor(collection) {
    this._collection = collection;
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   */
  has(type, key) {
    RegistryValidation.validateLookup(type, key);
    return Boolean(this._collection.getFactory(type, key));
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @returns {string[]}
   */
  keys(type) {
    RegistryValidation.validateLookup(type, 'placeholder');
    return this._collection.keys(type);
  }
}
