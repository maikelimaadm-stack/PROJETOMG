/** @typedef {'MAK-L3-PERMISSION-001'|'MAK-L3-PERMISSION-002'|'MAK-L3-PERMISSION-003'} PermissionErrorCode */

export class PermissionError extends Error {
  /**
   * @param {PermissionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'PermissionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
