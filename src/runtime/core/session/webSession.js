import { SessionDestroy } from './SessionDestroy.js';
import { SessionError } from './errors.js';
import { SessionFactory } from './SessionFactory.js';
import { SessionLifecycle } from './SessionLifecycle.js';
import { RuntimeSession } from './RuntimeSession.js';
import { SessionScope } from './SessionScope.js';
import { SessionState } from './SessionState.js';
import { SessionValidation } from './SessionValidation.js';

/**
 * Web session manager (M03) — mock L1 auth, fail-closed.
 * @implements {import('../../types/session.js').ISessionManager}
 */
export class WebSessionManager {
  /**
   * @param {import('../context/RuntimeContext.js').RuntimeContext} context
   * @param {import('./mockL1Auth.js').MockL1AuthAdapter} authAdapter
   */
  constructor(context, authAdapter) {
    /** @type {import('../context/RuntimeContext.js').RuntimeContext} */
    this._context = context;
    /** @type {import('./mockL1Auth.js').MockL1AuthAdapter} */
    this._auth = authAdapter;
    /** @type {import('./SessionState.js').SessionStateValue} */
    this.state = SessionState.ANONYMOUS;
    /** @type {import('../../types/uec.js').AccessScope | null} */
    this.accessScopeCache = null;
    /** @type {SessionScope | null} */
    this.scope = null;
    /** @type {string | null} */
    this.accessToken = null;
    /** @type {string | null} */
    this.refreshToken = null;
    /** @type {number | null} */
    this.accessTokenExpiresAt = null;
    /** @type {RuntimeSession | null} */
    this._snapshot = null;
  }

  /** @returns {import('../../types/uec.js').AccessScope | null} */
  getAccessScope() {
    if (this.state === SessionState.DESTROYED) {
      return null;
    }
    return this.accessScopeCache;
  }

  /** @returns {RuntimeSession | null} */
  getSnapshot() {
    return this._snapshot;
  }

  /** @returns {import('../context/RuntimeContext.js').RuntimeContext} */
  getContext() {
    return this._context;
  }

  /**
   * @param {import('../../types/uec.js').AuthCredentials} credentials
   * @returns {Promise<import('../../types/uec.js').AccessScope>}
   */
  async authenticate(credentials) {
    if (this.state === SessionState.DESTROYED) {
      throw new SessionError('MAK-L3-SESSION-003', 'Session destroyed');
    }

    SessionValidation.validateCredentials(credentials);
    SessionValidation.validateTenantIsolation(this._context.tenantId, credentials.tenantId);

    this.state = SessionLifecycle.transition(this.state, 'authenticate');

    try {
      const result = await this._auth.authenticate(credentials);
      SessionValidation.validateAccessScope(result.accessScope);
      SessionValidation.validateTenantIsolation(this._context.tenantId, result.accessScope.tenantId);

      this.accessScopeCache = Object.freeze({ ...result.accessScope });
      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken;
      this.accessTokenExpiresAt = result.expiresAt;

      this._context = this._context.child({
        tenantId: result.accessScope.tenantId,
        userId: result.accessScope.userId,
        accessScope: this.accessScopeCache,
      });

      this.scope = new SessionScope({
        accessScope: this.accessScopeCache,
        traceId: this._context.traceId,
        tenantId: result.accessScope.tenantId,
      });

      this._snapshot = SessionFactory.createSnapshot({
        context: this._context,
        accessScope: this.accessScopeCache,
      });

      this.state = SessionState.AUTHENTICATED;
      return this.accessScopeCache;
    } catch (err) {
      this.state = SessionState.ANONYMOUS;
      this.accessScopeCache = null;
      this.scope = null;
      this._snapshot = null;
      if (err instanceof SessionError) {
        throw err;
      }
      throw new SessionError('MAK-L3-SESSION-001', 'Authentication failed');
    }
  }

  /** @returns {Promise<import('../../types/uec.js').AccessScope>} */
  async refresh() {
    if (this.state === SessionState.DESTROYED) {
      throw new SessionError('MAK-L3-SESSION-003', 'Session destroyed');
    }
    SessionValidation.validateActiveSession(this.state);

    if (!this.refreshToken) {
      throw new SessionError('MAK-L3-SESSION-002', 'No refresh token available');
    }

    const previousState = this.state;
    this.state = SessionLifecycle.transition(this.state, 'refresh');

    try {
      const result = await this._auth.refresh(this.refreshToken);
      SessionValidation.validateAccessScope(result.accessScope);
      SessionValidation.validateTenantIsolation(this._context.tenantId, result.accessScope.tenantId);

      this.accessScopeCache = Object.freeze({ ...result.accessScope });
      this.accessToken = result.accessToken;
      this.refreshToken = result.refreshToken;
      this.accessTokenExpiresAt = result.expiresAt;

      this._context = this._context.child({
        accessScope: this.accessScopeCache,
      });

      this.scope = new SessionScope({
        accessScope: this.accessScopeCache,
        traceId: this._context.traceId,
        tenantId: result.accessScope.tenantId,
      });

      this._snapshot = SessionFactory.createSnapshot({
        context: this._context,
        accessScope: this.accessScopeCache,
      });

      this.state = SessionLifecycle.completeRefresh(SessionState.REFRESHING);
      return this.accessScopeCache;
    } catch (err) {
      this.state = previousState;
      if (err instanceof SessionError) {
        throw err;
      }
      throw new SessionError('MAK-L3-SESSION-002', 'Session refresh failed');
    }
  }

  /** Silent refresh when access token expired (FE D-PB-14). */
  async ensureFreshAccessScope() {
    if (!this.accessTokenExpiresAt || Date.now() < this.accessTokenExpiresAt) {
      return this.getAccessScope();
    }
    return this.refresh();
  }

  async logout() {
    if (this.refreshToken) {
      await this._auth.revoke(this.refreshToken);
    }
    SessionDestroy.logout(this);
    this._snapshot = null;
  }

  destroy() {
    SessionDestroy.destroy(this);
    this._snapshot = null;
  }
}
