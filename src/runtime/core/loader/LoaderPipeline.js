import { LoaderError } from './errors.js';
import { LoaderValidation } from './LoaderValidation.js';
import { LoaderLifecycle } from './LoaderLifecycle.js';

/**
 * Loader pipeline — fetch → validate structure → emit raw CRB.
 */
export class LoaderPipeline {
  /**
   * @param {import('./LoaderResolver.js').LoaderResolver} resolver
   */
  constructor(resolver) {
    this._resolver = resolver;
    /** @type {import('./LoaderLifecycle.js').LoaderState} */
    this._state = LoaderLifecycle.IDLE;
    /** @type {number} */
    this.validationsExecuted = 0;
  }

  get state() {
    return this._state;
  }

  /**
   * @param {import('../../types/loader.js').ResourceRef} ref
   * @param {import('./LoaderContext.js').LoaderContext} ctx
   */
  async run(ref, ctx) {
    this._state = LoaderLifecycle.transition(this._state, 'start');
    this.validationsExecuted = 0;

    try {
      LoaderValidation.validateResourceRef(ref);
      this.validationsExecuted += 1;

      if (ctx.pin) {
        LoaderValidation.validateEnvironmentPin(ctx.pin, ctx.runtimeContext);
        this.validationsExecuted += 1;

        if (ctx.pin.bundleId !== ref.bundleId) {
          throw new LoaderError(
            'MAK-L3-LOADER-003',
            `ResourceRef bundleId mismatch with EnvironmentPin: ${ref.bundleId}`,
          );
        }
        this.validationsExecuted += 1;
      }

      const payload = await this._resolver.resolve(ref);
      LoaderValidation.validateBundleStructure(payload);
      this.validationsExecuted += 1;

      this._state = LoaderLifecycle.transition(this._state, 'complete');
      return payload;
    } catch (err) {
      this._state = LoaderLifecycle.transition(this._state, 'fail');
      if (err instanceof LoaderError) {
        throw err;
      }
      throw new LoaderError('MAK-L3-LOADER-001', err instanceof Error ? err.message : 'Loader pipeline failed');
    }
  }

  invalidate() {
    this._state = LoaderLifecycle.transition(this._state, 'invalidate');
  }
}
