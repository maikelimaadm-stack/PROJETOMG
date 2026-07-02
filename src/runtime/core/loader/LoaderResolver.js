import { LoaderError } from './errors.js';
import { LoaderValidation } from './LoaderValidation.js';

/**
 * Resolves bundle sources — in-memory provider or fetch adapter.
 */
export class LoaderResolver {
  /**
   * @param {Map<string, object>} [bundleStore]
   * @param {(bundleId: string) => Promise<object>} [fetchFn]
   */
  constructor(bundleStore = new Map(), fetchFn = null) {
    this._store = bundleStore;
    /** @type {((bundleId: string) => Promise<object>) | null} */
    this._fetchFn = fetchFn;
  }

  /**
   * @param {import('../../types/loader.js').ResourceRef} ref
   */
  async resolve(ref) {
    LoaderValidation.validateResourceRef(ref);
    if (this._store.has(ref.bundleId)) {
      return this._store.get(ref.bundleId);
    }
    if (this._fetchFn) {
      return this._fetchFn(ref.bundleId);
    }
    throw new LoaderError('MAK-L3-LOADER-001', `Bundle not found: ${ref.bundleId}`);
  }

  /**
   * @param {string} bundleId
   * @param {object} payload
   */
  register(bundleId, payload) {
    this._store.set(bundleId, payload);
  }

  clear() {
    this._store.clear();
  }
}
