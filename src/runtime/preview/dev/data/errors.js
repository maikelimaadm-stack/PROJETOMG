/**
 * @typedef {'MAK-L3-DEV-DATASET-001'|'MAK-L3-DEV-DATASET-002'} ControlledDevDatasetErrorCode
 */

/**
 * Structural/configuration failures of the controlled dev dataset (invalid
 * option, prototype-pollution attempt, record/depth limit exceeded) are thrown
 * as this typed error. The dataset never carries real data, never executes
 * behavior — these are the only failure modes.
 */
export class ControlledDevDatasetError extends Error {
  /**
   * @param {ControlledDevDatasetErrorCode} code
   * @param {string} message
   * @param {Object} [meta]
   */
  constructor(code, message, meta) {
    super(message);
    this.name = 'ControlledDevDatasetError';
    this.code = code;
    if (meta) this.meta = meta;
  }
}
