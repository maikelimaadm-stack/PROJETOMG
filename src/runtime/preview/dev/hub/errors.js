/**
 * @typedef {'MAK-L3-DEV-HUB-001'|'MAK-L3-DEV-HUB-002'} RuntimeV2DevPreviewHubErrorCode
 */

/**
 * Structural/configuration failures of the dev preview hub (invalid option,
 * prototype-pollution attempt) are thrown as this typed error. A failure while
 * building one module's preview is captured into that module's entry, never
 * thrown — so the hub can never crash the dev harness.
 */
export class RuntimeV2DevPreviewHubError extends Error {
  /**
   * @param {RuntimeV2DevPreviewHubErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeV2DevPreviewHubError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
