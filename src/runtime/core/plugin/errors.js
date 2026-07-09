/**
 * @typedef {'MAK-L3-PLUGIN-001'|'MAK-L3-PLUGIN-002'|'MAK-L3-PLUGIN-003'|'MAK-L3-PLUGIN-004'|'MAK-L3-PLUGIN-005'|'MAK-L3-PLUGIN-006'|'MAK-L3-PLUGIN-007'|'MAK-L3-PLUGIN-008'|'MAK-L3-PLUGIN-009'} PluginErrorCode
 */

export class PluginError extends Error {
  /**
   * @param {PluginErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'PluginError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
