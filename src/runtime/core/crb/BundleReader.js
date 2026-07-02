import { CrbError } from './errors.js';

/**
 * Reads and parses CRB JSON payloads.
 */
export class BundleReader {
  /**
   * @param {ArrayBuffer|object|string} raw
   * @returns {import('../../types/crb.js').CrbPayload}
   */
  static read(raw) {
    try {
      let parsed = raw;
      if (typeof raw === 'string') {
        parsed = JSON.parse(raw);
      } else if (raw instanceof ArrayBuffer) {
        parsed = JSON.parse(Buffer.from(raw).toString('utf8'));
      }
      if (!parsed || typeof parsed !== 'object') {
        throw new CrbError('MAK-L3-RUNTIME-002', 'CRB payload is not an object');
      }
      return /** @type {import('../../types/crb.js').CrbPayload} */ (parsed);
    } catch (err) {
      if (err instanceof CrbError) throw err;
      throw new CrbError('MAK-L3-RUNTIME-002', 'CRB parsing failed');
    }
  }
}
