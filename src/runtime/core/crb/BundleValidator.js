import { MMM_CRB_VERSION, V13_V20_ENGINES } from './crbConstants.js';
import { BundleMetadata } from './BundleMetadata.js';

/**
 * CRB structural and schema validation.
 */
export class BundleValidator {
  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @param {import('../../types/crb.js').EnvironmentPin} [pin]
   * @param {'dev'|'staging'|'prod'} [environment]
   */
  static validate(crb, pin, environment = 'dev') {
    const errors = [];
    let validationsExecuted = 0;

    if (!crb.crbVersion) {
      errors.push('Missing crbVersion');
    } else if (crb.crbVersion !== MMM_CRB_VERSION) {
      errors.push(`Unsupported crbVersion: ${crb.crbVersion}`);
    }
    validationsExecuted += 1;

    if (!crb.registries || typeof crb.registries !== 'object') {
      errors.push('Missing registries');
    }
    validationsExecuted += 1;

    if (!crb.contentHash || !crb.integrityHash) {
      errors.push('Missing contentHash or integrityHash');
    }
    validationsExecuted += 1;

    if (pin) {
      if (crb.tenantId && crb.tenantId !== pin.tenantId) {
        errors.push(`Tenant mismatch: ${crb.tenantId} ≠ ${pin.tenantId}`);
      }
      validationsExecuted += 1;

      const versionCheck = BundleMetadata.validateDefinitionVersion(crb, pin);
      if (!versionCheck.valid) {
        errors.push(versionCheck.error);
      }
      validationsExecuted += 1;
    }

    const engines = crb.capabilities?.engines ?? [];
    for (const engine of V13_V20_ENGINES) {
      if (!engines.includes(engine)) {
        errors.push(`Missing engine capability: ${engine}`);
      }
    }
    validationsExecuted += V13_V20_ENGINES.length;

    if (environment === 'prod' && !crb.signatureRef) {
      errors.push('signatureRef required in prod');
      validationsExecuted += 1;
    }

    return {
      valid: errors.length === 0,
      errors,
      validationsExecuted,
    };
  }
}
