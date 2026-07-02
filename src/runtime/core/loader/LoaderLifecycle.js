/** @typedef {'idle'|'loading'|'loaded'|'invalidated'|'failed'} LoaderState */

export const LoaderLifecycle = Object.freeze({
  IDLE: /** @type {LoaderState} */ ('idle'),
  LOADING: /** @type {LoaderState} */ ('loading'),
  LOADED: /** @type {LoaderState} */ ('loaded'),
  INVALIDATED: /** @type {LoaderState} */ ('invalidated'),
  FAILED: /** @type {LoaderState} */ ('failed'),

  /**
   * @param {LoaderState} current
   * @param {'start'|'complete'|'invalidate'|'fail'} event
   * @returns {LoaderState}
   */
  transition(current, event) {
    switch (event) {
      case 'start':
        return this.LOADING;
      case 'complete':
        return this.LOADED;
      case 'invalidate':
        return this.INVALIDATED;
      case 'fail':
        return this.FAILED;
      default:
        return current;
    }
  },
});
