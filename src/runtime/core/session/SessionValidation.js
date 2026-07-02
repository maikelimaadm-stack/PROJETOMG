import { SessionError } from './errors.js';
import { SessionState } from './SessionState.js';

export class SessionValidation {
  /**
   * @param {import('../../types/uec.js').AuthCredentials} credentials
   */
  static validateCredentials(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      throw new SessionError('MAK-L3-SESSION-001', 'Credentials required');
    }
    if (!credentials.username || !credentials.password) {
      throw new SessionError('MAK-L3-SESSION-001', 'Username and password required');
    }
    if (!credentials.tenantId) {
      throw new SessionError('MAK-L3-SESSION-001', 'Tenant id required');
    }
  }

  /**
   * @param {string} contextTenantId
   * @param {string} scopeTenantId
   */
  static validateTenantIsolation(contextTenantId, scopeTenantId) {
    if (contextTenantId && scopeTenantId && contextTenantId !== scopeTenantId) {
      throw new SessionError(
        'MAK-L2-SESSION-001',
        `Cross-tenant session forbidden: ${contextTenantId} → ${scopeTenantId}`,
      );
    }
  }

  /**
   * @param {import('./SessionState.js').SessionStateValue} state
   */
  static validateActiveSession(state) {
    if (state === SessionState.DESTROYED) {
      throw new SessionError('MAK-L3-SESSION-003', 'Session destroyed');
    }
    if (state === SessionState.ANONYMOUS) {
      throw new SessionError('MAK-L3-SESSION-003', 'No active session');
    }
  }

  /**
   * @param {import('../../types/uec.js').AccessScope | null | undefined} scope
   */
  static validateAccessScope(scope) {
    if (!scope?.tenantId || !scope?.userId) {
      throw new SessionError('MAK-L3-SESSION-002', 'Invalid access scope from auth provider');
    }
  }
}
