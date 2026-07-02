/** @typedef {'MAK-L2-SESSION-001'|'MAK-L3-SESSION-001'|'MAK-L3-SESSION-002'|'MAK-L3-SESSION-003'|'MAK-L3-SESSION-004'} SessionErrorCode */

export class SessionError extends Error {
  /**
   * @param {SessionErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'SessionError';
    this.code = code;
  }
}
