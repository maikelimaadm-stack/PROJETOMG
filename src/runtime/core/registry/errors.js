/** @typedef {'MAK-L3-REGISTRY-001'|'MAK-L3-REGISTRY-002'|'MAK-L3-REGISTRY-003'} RegistryErrorCode */

export class RegistryError extends Error {
  /**
   * @param {RegistryErrorCode} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'RegistryError';
    this.code = code;
  }
}
