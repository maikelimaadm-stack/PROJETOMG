/** @typedef {'MAK-L3-ACTION-001'|'MAK-L3-ACTION-002'|'MAK-L3-ACTION-003'|'MAK-L3-ACTION-004'|'MAK-L3-ACTION-005'|'MAK-L3-ACTION-006'} ActionErrorCode */

export class ActionError extends Error {
  /**
   * @param {ActionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ActionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
