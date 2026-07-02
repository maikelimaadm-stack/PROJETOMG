import { randomUUID } from 'node:crypto';
import { SessionError } from './errors.js';

/** @typedef {Object} MockAuthResult
 * @property {import('../../types/uec.js').AccessScope} accessScope
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {number} expiresAt
 */

/** @typedef {Object} MockL1AuthAdapter
 * @property {(credentials: import('../../types/uec.js').AuthCredentials) => Promise<MockAuthResult>} authenticate
 * @property {(refreshToken: string) => Promise<MockAuthResult>} refresh
 * @property {(refreshToken: string) => Promise<void>} revoke
 */

const MOCK_USERS = Object.freeze({
  kaiman: { password: 'kaiman', userId: 'user-kaiman', permissions: ['read', 'write'] },
  maike: { password: 'maike', userId: 'user-maike', permissions: ['read'] },
});

/**
 * Mock L1 auth adapter — in-memory only, no DB (Foundation C.2).
 * @param {{ accessTokenTtlMs?: number }} [options]
 * @returns {MockL1AuthAdapter}
 */
export function createMockL1Auth(options = {}) {
  const accessTokenTtlMs = options.accessTokenTtlMs ?? 15 * 60 * 1000;

  /** @type {Map<string, { accessScope: import('../../types/uec.js').AccessScope, expiresAt: number, refreshToken: string }>} */
  const accessTokens = new Map();
  /** @type {Map<string, { accessScope: import('../../types/uec.js').AccessScope }>} */
  const refreshTokens = new Map();

  /**
   * @param {import('../../types/uec.js').AuthCredentials} credentials
   */
  function buildAccessScope(credentials) {
    const user = MOCK_USERS[credentials.username];
    if (!user || user.password !== credentials.password) {
      throw new SessionError('MAK-L3-SESSION-001', 'Authentication failed');
    }
    return Object.freeze({
      tenantId: credentials.tenantId,
      userId: user.userId,
      companies: [{ companyId: 'default', companyCode: 'DEFAULT' }],
      permissions: [...user.permissions],
      locale: credentials.locale ?? 'pt-BR',
    });
  }

  return {
    async authenticate(credentials) {
      const accessScope = buildAccessScope(credentials);
      const accessToken = randomUUID();
      const refreshToken = randomUUID();
      const expiresAt = Date.now() + accessTokenTtlMs;
      accessTokens.set(accessToken, { accessScope, expiresAt, refreshToken });
      refreshTokens.set(refreshToken, { accessScope });
      return { accessScope, accessToken, refreshToken, expiresAt };
    },

    async refresh(refreshToken) {
      const entry = refreshTokens.get(refreshToken);
      if (!entry) {
        throw new SessionError('MAK-L3-SESSION-002', 'Refresh token invalid or revoked');
      }
      const accessToken = randomUUID();
      const newRefreshToken = randomUUID();
      const expiresAt = Date.now() + accessTokenTtlMs;
      refreshTokens.delete(refreshToken);
      accessTokens.set(accessToken, {
        accessScope: entry.accessScope,
        expiresAt,
        refreshToken: newRefreshToken,
      });
      refreshTokens.set(newRefreshToken, { accessScope: entry.accessScope });
      return {
        accessScope: entry.accessScope,
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt,
      };
    },

    async revoke(refreshToken) {
      const entry = refreshTokens.get(refreshToken);
      if (!entry) return;
      refreshTokens.delete(refreshToken);
      for (const [token, data] of accessTokens.entries()) {
        if (data.refreshToken === refreshToken) {
          accessTokens.delete(token);
        }
      }
    },
  };
}
