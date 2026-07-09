/** @typedef {'MAK-L3-EXECUTION-001'|'MAK-L3-EXECUTION-002'|'MAK-L3-EXECUTION-003'|'MAK-L3-EXECUTION-004'|'MAK-L3-EXECUTION-005'|'MAK-L3-EXECUTION-006'} ExecutionErrorCode */

export class ExecutionError extends Error {
  /**
   * @param {ExecutionErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ExecutionError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
