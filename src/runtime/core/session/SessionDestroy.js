import { SessionLifecycle } from './SessionLifecycle.js';
import { SessionState } from './SessionState.js';

/**
 * Clears session artifacts — fail-closed; no residual AccessScope cache.
 */
export class SessionDestroy {
  /**
   * @param {{
   *   state: import('./SessionState.js').SessionStateValue,
   *   scope: import('./SessionScope.js').SessionScope | null,
   *   accessScopeCache: import('../../types/uec.js').AccessScope | null,
   *   accessToken: string | null,
   *   refreshToken: string | null,
   *   accessTokenExpiresAt: number | null,
   * }} session
   */
  static destroy(session) {
    session.state = SessionLifecycle.transition(session.state, 'destroy');
    session.scope = null;
    session.accessScopeCache = null;
    session.accessToken = null;
    session.refreshToken = null;
    session.accessTokenExpiresAt = null;
    return session;
  }

  /**
   * @param {{
   *   state: import('./SessionState.js').SessionStateValue,
   *   scope: import('./SessionScope.js').SessionScope | null,
   *   accessScopeCache: import('../../types/uec.js').AccessScope | null,
   *   accessToken: string | null,
   *   refreshToken: string | null,
   *   accessTokenExpiresAt: number | null,
   * }} session
   */
  static logout(session) {
    if (session.state === SessionState.DESTROYED) {
      return session;
    }
    session.state = SessionLifecycle.transition(session.state, 'logout');
    session.scope = null;
    session.accessScopeCache = null;
    session.accessToken = null;
    session.refreshToken = null;
    session.accessTokenExpiresAt = null;
    return session;
  }
}
