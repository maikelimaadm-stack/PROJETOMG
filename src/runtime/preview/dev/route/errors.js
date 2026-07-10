/**
 * @typedef {'MAK-L3-DEV-ROUTE-001'|'MAK-L3-DEV-ROUTE-002'} RuntimeV2DevPreviewRouteErrorCode
 */

/**
 * Structural/configuration failures of the dev preview route (invalid option,
 * prototype-pollution attempt) are thrown as this typed error. A failure while
 * building the underlying hub model is captured into the route model, never
 * thrown — so the route can never crash the app.
 */
export class RuntimeV2DevPreviewRouteError extends Error {
  /**
   * @param {RuntimeV2DevPreviewRouteErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'RuntimeV2DevPreviewRouteError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
