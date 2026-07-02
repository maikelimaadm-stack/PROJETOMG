import { SessionScope } from './SessionScope.js';
import { SessionState } from './SessionState.js';

/**
 * Immutable runtime session snapshot (M03).
 */
export class RuntimeSession {
  /**
   * @param {Object} params
   * @param {import('../context/RuntimeContext.js').RuntimeContext} params.context
   * @param {import('./SessionState.js').SessionStateValue} params.state
   * @param {SessionScope | null} params.scope
   */
  constructor({ context, state, scope }) {
    this.context = context;
    this.state = state;
    this.scope = scope;
    Object.freeze(this);
  }

  /** @returns {import('../../types/uec.js').AccessScope | null} */
  get accessScope() {
    return this.scope?.accessScope ?? null;
  }

  /** @returns {string} */
  get traceId() {
    return this.context.traceId;
  }

  /** @returns {boolean} */
  get isAuthenticated() {
    return this.state === SessionState.AUTHENTICATED;
  }
}
