import { RegistryIndex } from './RegistryIndex.js';
import { RegistryCollection } from './RegistryCollection.js';
import { RegistryLookup } from './RegistryLookup.js';
import { RegistryResolver } from './RegistryResolver.js';
import { RegistryValidation } from './RegistryValidation.js';
import { REGISTRY_TYPES } from './registryTypes.js';
import { RegistryError } from './errors.js';

/**
 * Universal in-memory registry (M04).
 * @implements {import('../../types/registry.js').IRegistry}
 */
export class RegistryManager {
  constructor() {
    this._index = new RegistryIndex();
    this._collection = new RegistryCollection(this._index);
    this._lookup = new RegistryLookup(this._collection);
    this._resolver = new RegistryResolver(this._collection);
    /** @type {boolean} */
    this._frozen = false;
  }

  /**
   * @template T
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   * @param {() => T} factory
   */
  register(type, key, factory) {
    RegistryValidation.validateRegister(type, key, factory, this._frozen);
    this._collection.add(type, key, factory);
  }

  /**
   * @template T
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   * @returns {T}
   */
  resolve(type, key) {
    return this._resolver.resolve(type, key);
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   */
  has(type, key) {
    return this._lookup.has(type, key);
  }

  /**
   * @param {import('./registryTypes.js').RegistryType} type
   * @returns {string[]}
   */
  keys(type) {
    return this._lookup.keys(type);
  }

  /**
   * Rollback support (C.3 hydrate) — only when registry is not frozen.
   * @param {import('./registryTypes.js').RegistryType} type
   * @param {string} key
   */
  unregister(type, key) {
    if (this._frozen) {
      throw new RegistryError('MAK-L3-REGISTRY-003', 'Registry is frozen — unregister rejected');
    }
    this._collection.remove(type, key);
  }

  /** @returns {number} */
  countEntries() {
    let total = 0;
    for (const type of REGISTRY_TYPES) {
      total += this.keys(type).length;
    }
    return total;
  }

  /** Post-hydrate freeze (RT-3) — callable in tests; wired in C.3 hydrate */
  freeze() {
    this._frozen = true;
    Object.freeze(this);
  }

  get isFrozen() {
    return this._frozen;
  }
}

/** @returns {RegistryManager} */
export function createRegistry() {
  return new RegistryManager();
}
