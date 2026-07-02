import { LoaderPipeline } from './LoaderPipeline.js';
import { LoaderResolver } from './LoaderResolver.js';
import { LoaderContext } from './LoaderContext.js';
import { LoaderLifecycle } from './LoaderLifecycle.js';
import { LoaderError } from './errors.js';

/**
 * Universal Loader (M05) — in-memory cache; no distributed cache in C.3.
 * @implements {import('../../types/loader.js').ILoader}
 */
export class LoaderManager {
  /**
   * @param {import('./LoaderResolver.js').LoaderResolver} [resolver]
   */
  constructor(resolver = new LoaderResolver()) {
    this._resolver = resolver;
    this._pipeline = new LoaderPipeline(resolver);
    /** @type {Map<string, object>} */
    this._cache = new Map();
    /** @type {import('./LoaderLifecycle.js').LoaderState} */
    this._state = LoaderLifecycle.IDLE;
  }

  /**
   * @param {import('../../types/loader.js').ResourceRef} ref
   * @param {import('./LoaderContext.js').LoaderContext} [ctx]
   */
  async load(ref, ctx) {
    if (!ctx) {
      throw new LoaderError('MAK-L3-LOADER-002', 'LoaderContext is required');
    }
    this._state = LoaderLifecycle.LOADING;
    try {
      const payload = await this._pipeline.run(ref, ctx);
      this._cache.set(ref.bundleId, payload);
      this._state = LoaderLifecycle.LOADED;
      return payload;
    } catch (err) {
      this._state = LoaderLifecycle.FAILED;
      throw err;
    }
  }

  /**
   * @param {import('../../types/loader.js').ResourceRef} ref
   */
  async loadCached(ref, ctx) {
    if (this._cache.has(ref.bundleId)) {
      return this._cache.get(ref.bundleId);
    }
    return this.load(ref, ctx);
  }

  /**
   * @param {import('../../types/loader.js').ResourceRef} ref
   */
  invalidate(ref) {
    this._cache.delete(ref.bundleId);
    this._pipeline.invalidate();
    this._state = LoaderLifecycle.INVALIDATED;
  }

  /** @param {string} bundleId @param {object} payload */
  registerBundle(bundleId, payload) {
    this._resolver.register(bundleId, payload);
  }

  get validationsExecuted() {
    return this._pipeline.validationsExecuted;
  }

  get state() {
    return this._state;
  }
}

/** @returns {LoaderManager} */
export function createLoader(resolver) {
  return new LoaderManager(resolver);
}

export { LoaderError };
