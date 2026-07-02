import { LoaderError } from './errors.js';

export class LoaderValidation {
  /**
   * @param {import('../../types/loader.js').ResourceRef} ref
   */
  static validateResourceRef(ref) {
    if (!ref?.bundleId || typeof ref.bundleId !== 'string') {
      throw new LoaderError('MAK-L3-LOADER-002', 'ResourceRef.bundleId is required');
    }
  }

  /**
   * @param {import('../../types/crb.js').EnvironmentPin} pin
   * @param {import('../context/RuntimeContext.js').RuntimeContext} context
   */
  static validateEnvironmentPin(pin, context) {
    if (!pin?.tenantId || !pin?.applicationId || !pin?.environment) {
      throw new LoaderError('MAK-L3-LOADER-003', 'EnvironmentPin incomplete');
    }
    if (!pin.bundleId || !pin.definitionVersionId) {
      throw new LoaderError('MAK-L3-LOADER-003', 'EnvironmentPin missing bundle reference');
    }
    if (context.tenantId && pin.tenantId !== context.tenantId) {
      throw new LoaderError('MAK-L3-LOADER-004', `EnvironmentPin tenant mismatch: ${context.tenantId} → ${pin.tenantId}`);
    }
  }

  /**
   * @param {unknown} payload
   */
  static validateBundleStructure(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new LoaderError('MAK-L3-LOADER-001', 'Bundle payload is not an object');
    }
    const crb = /** @type {Record<string, unknown>} */ (payload);
    if (!crb.crbVersion || !crb.registries || !crb.contentHash || !crb.integrityHash) {
      throw new LoaderError('MAK-L3-LOADER-001', 'Bundle structure invalid — missing CRB fields');
    }
  }
}
