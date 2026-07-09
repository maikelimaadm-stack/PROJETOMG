/** @typedef {'MAK-L3-RENDER-001'|'MAK-L3-RENDER-002'|'MAK-L3-RENDER-003'|'MAK-L3-RENDER-004'|'MAK-L3-RENDER-005'|'MAK-L3-RENDER-006'} RenderErrorCode */

export class RenderError extends Error {
  /**
   * @param {RenderErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RenderError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
