/**
 * Loader execution context — binds RuntimeContext + EnvironmentPin.
 */
export class LoaderContext {
  /**
   * @param {Object} params
   * @param {import('../context/RuntimeContext.js').RuntimeContext} params.runtimeContext
   * @param {import('../../types/crb.js').EnvironmentPin} [params.pin]
   * @param {'dev'|'staging'|'prod'} [params.environment]
   */
  constructor({ runtimeContext, pin, environment = 'dev' }) {
    this.runtimeContext = runtimeContext;
    this.pin = pin ?? null;
    this.environment = environment;
    this.traceId = runtimeContext.traceId;
    Object.freeze(this);
  }
}
