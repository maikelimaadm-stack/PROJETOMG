import { computeIntegrityHash, verifySignature, MMM_CRB_VERSION } from './crbConstants.js';
import { CrbError } from './errors.js';

/**
 * CRB integrity — hash + signature verification (RT-2).
 */
export class BundleIntegrity {
  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @param {'dev'|'staging'|'prod'} environment
   * @param {string} [signingKey]
   */
  static verify(crb, environment, signingKey) {
    const errors = [];
    let validationsExecuted = 0;

    if (crb.crbVersion !== MMM_CRB_VERSION) {
      errors.push(`Invalid crbVersion: ${crb.crbVersion}`);
    }
    validationsExecuted += 1;

    const expectedHash = computeIntegrityHash(crb);
    if (crb.integrityHash !== expectedHash) {
      errors.push('integrityHash mismatch');
    }
    validationsExecuted += 1;

    if (environment === 'prod') {
      if (!crb.signatureRef) {
        errors.push('Unsigned CRB rejected in prod mode');
      } else if (!verifySignature(crb.integrityHash, crb.signatureRef, signingKey)) {
        errors.push('signatureRef HMAC invalid');
      }
      validationsExecuted += 2;
    } else if (crb.signatureRef && !verifySignature(crb.integrityHash, crb.signatureRef, signingKey)) {
      errors.push('signatureRef HMAC invalid');
      validationsExecuted += 1;
    }

    return {
      valid: errors.length === 0,
      errors,
      validationsExecuted,
    };
  }
}
