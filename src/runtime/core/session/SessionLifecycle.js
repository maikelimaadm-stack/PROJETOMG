import { SessionError } from './errors.js';
import { SessionState } from './SessionState.js';

export class SessionLifecycle {
  /**
   * @param {import('./SessionState.js').SessionStateValue} current
   * @param {'authenticate'|'refresh'|'logout'|'destroy'} event
   * @returns {import('./SessionState.js').SessionStateValue}
   */
  static transition(current, event) {
    if (current === SessionState.DESTROYED) {
      throw new SessionError('MAK-L3-SESSION-003', 'Session already destroyed');
    }

    switch (event) {
      case 'authenticate':
        if (current === SessionState.REFRESHING) {
          throw new SessionError('MAK-L3-SESSION-004', 'Cannot authenticate while refreshing');
        }
        return SessionState.AUTHENTICATED;
      case 'refresh':
        if (current === SessionState.ANONYMOUS) {
          throw new SessionError('MAK-L3-SESSION-003', 'No session to refresh');
        }
        return SessionState.REFRESHING;
      case 'logout':
      case 'destroy':
        return SessionState.DESTROYED;
      default:
        throw new SessionError('MAK-L3-SESSION-004', `Unknown lifecycle event: ${event}`);
    }
  }

  /**
   * @param {import('./SessionState.js').SessionStateValue} from
   * @param {import('./SessionState.js').SessionStateValue} to
   */
  static completeRefresh(from, to = SessionState.AUTHENTICATED) {
    if (from !== SessionState.REFRESHING) {
      throw new SessionError('MAK-L3-SESSION-004', 'Refresh completion requires refreshing state');
    }
    return to;
  }
}
