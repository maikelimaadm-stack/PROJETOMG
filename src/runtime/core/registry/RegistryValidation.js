import { isRegistryType } from './registryTypes.js';
import { RegistryError } from './errors.js';

export class RegistryValidation {
  /**
   * @param {string} type
   * @param {string} key
   * @param {unknown} factory
   * @param {boolean} frozen
   */
  static validateRegister(type, key, factory, frozen) {
    if (frozen) {
      throw new RegistryError(
        'MAK-L3-REGISTRY-003',
        'Registry is frozen — registration rejected (post-hydrate)',
      );
    }
    if (!isRegistryType(type)) {
      throw new RegistryError('MAK-L3-REGISTRY-002', `Invalid registry type: ${type}`);
    }
    if (!key || typeof key !== 'string') {
      throw new RegistryError('MAK-L3-REGISTRY-002', 'Registry key must be a non-empty string');
    }
    if (typeof factory !== 'function') {
      throw new RegistryError('MAK-L3-REGISTRY-002', 'Registry factory must be a function');
    }
  }

  /**
   * @param {string} type
   * @param {string} key
   */
  static validateLookup(type, key) {
    if (!isRegistryType(type)) {
      throw new RegistryError('MAK-L3-REGISTRY-002', `Invalid registry type: ${type}`);
    }
    if (!key || typeof key !== 'string') {
      throw new RegistryError('MAK-L3-REGISTRY-002', 'Registry key must be a non-empty string');
    }
  }
}
