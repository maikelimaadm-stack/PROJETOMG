import { RegistryIndex } from './RegistryIndex.js';
import { RegistryCollection } from './RegistryCollection.js';
import { RegistryLookup } from './RegistryLookup.js';
import { RegistryResolver } from './RegistryResolver.js';
import { RegistryValidation } from './RegistryValidation.js';

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
