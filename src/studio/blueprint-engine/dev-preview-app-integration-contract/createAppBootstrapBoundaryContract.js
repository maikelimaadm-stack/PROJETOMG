import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * App bootstrap boundary contract — asserts the App bootstrap stays untouched; no auto-mount, no
 * mount-on-import, no side-effect on import. Pure and deterministic.
 * @returns {Object}
 */
export function createAppBootstrapBoundaryContract() {
  const core = {
    kind: 'app-integration-bootstrap-boundary-contract',
    bootstrapTouched: false,
    bootstrapIntegrationCreated: false,
    autoMountAllowed: false,
    mountOnImportAllowed: false,
    sideEffectOnImportAllowed: false,
    requiresExplicitFutureSlice: true,
  };
  return safeCloneGenericModel({ ...core, bootstrapBoundaryDigest: appIntegrationDigest(core) });
}

export default createAppBootstrapBoundaryContract;
