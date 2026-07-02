import { LoaderError } from '../loader/errors.js';

/**
 * Resolves EnvironmentPin → bundle reference.
 */
export class BundleResolver {
  /**
   * @param {Map<string, import('../../types/crb.js').EnvironmentPin>} [pinStore]
   */
  constructor(pinStore = new Map()) {
    this._pins = pinStore;
  }

  /**
   * @param {import('../../types/crb.js').EnvironmentPin} pin
   */
  registerPin(pin) {
    const key = `${pin.tenantId}:${pin.applicationId}:${pin.environment}`;
    this._pins.set(key, pin);
  }

  /**
   * @param {string} tenantId
   * @param {string} applicationId
   * @param {'dev'|'staging'|'prod'} environment
   */
  resolvePin(tenantId, applicationId, environment) {
    const key = `${tenantId}:${applicationId}:${environment}`;
    const pin = this._pins.get(key);
    if (!pin) {
      throw new LoaderError('MAK-L3-LOADER-003', `EnvironmentPin not found: ${key}`);
    }
    return pin;
  }
}
