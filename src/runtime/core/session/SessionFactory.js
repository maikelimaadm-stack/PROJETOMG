import { RuntimeSession } from './RuntimeSession.js';
import { SessionScope } from './SessionScope.js';
import { SessionState } from './SessionState.js';
import { createMockL1Auth } from './mockL1Auth.js';
import { WebSessionManager } from './webSession.js';

export class SessionFactory {
  /**
   * @param {import('../context/RuntimeContext.js').RuntimeContext} context
   * @param {import('./mockL1Auth.js').MockL1AuthAdapter} [authAdapter]
   * @returns {WebSessionManager}
   */
  static createManager(context, authAdapter = createMockL1Auth()) {
    return new WebSessionManager(context, authAdapter);
  }

  /**
   * @param {Object} params
   * @param {import('../context/RuntimeContext.js').RuntimeContext} params.context
   * @param {import('../../types/uec.js').AccessScope} params.accessScope
   * @returns {RuntimeSession}
   */
  static createSnapshot({ context, accessScope }) {
    const scope = new SessionScope({
      accessScope,
      traceId: context.traceId,
      tenantId: accessScope.tenantId,
    });
    return new RuntimeSession({
      context,
      state: SessionState.AUTHENTICATED,
      scope,
    });
  }
}

/** @param {import('../context/RuntimeContext.js').RuntimeContext} context */
export function createSessionManager(context) {
  return SessionFactory.createManager(context);
}
