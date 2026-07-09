/** @typedef {'MAK-L3-STATE-001'|'MAK-L3-STATE-002'|'MAK-L3-STATE-003'|'MAK-L3-STATE-004'|'MAK-L3-STATE-005'} StateErrorCode */

export class StateError extends Error {
  /**
   * @param {StateErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'StateError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
