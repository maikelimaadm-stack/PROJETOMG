/**
 * @typedef {'MAK-L3-SHADOW-PILOT-001'|'MAK-L3-SHADOW-PILOT-002'} EmpresasShadowPilotErrorCode
 */

/**
 * Structural/configuration failures of the Empresas Shadow Pilot itself
 * (invalid option, invalid input shape, prototype-pollution attempt) are
 * thrown as this typed error. Failures of the underlying RuntimeShadowMode
 * *pass* are never thrown — they are captured and returned in the pilot
 * report so a shadow failure can never reach the Empresas UI.
 */
export class EmpresasShadowPilotError extends Error {
  /**
   * @param {EmpresasShadowPilotErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'EmpresasShadowPilotError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
