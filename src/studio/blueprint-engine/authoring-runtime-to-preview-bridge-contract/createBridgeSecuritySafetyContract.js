import { bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the SECURITY / SAFETY contract — everything real is disallowed; the future bridge remains
 * synthetic/headless/metadata-only. Aggregates the forbidden-capability allowances (all false). Pure.
 * @returns {Object}
 */
export function createBridgeSecuritySafetyContract() {
  const allowances = {
    networkAllowed: false,
    storageAllowed: false,
    filesystemWritesAllowed: false,
    backendAllowed: false,
    prismaAllowed: false,
    realDataAllowed: false,
    productExposureAllowed: false,
    previewMountAllowed: false,
    appTouchAllowed: false,
    routeCreationAllowed: false,
    menuCreationAllowed: false,
    moduleGenerationAllowed: false,
    certificationAllowed: false,
  };
  const anyRealAllowed = Object.values(allowances).some((v) => v === true);
  const core = {
    kind: 'bridge-security-safety-contract',
    anyRealAllowed,
    reversibleByNonConsumption: true,
    headless: true,
    metadataOnly: true,
    allowances,
    allowanceCount: Object.keys(allowances).length,
  };
  return safeCloneGenericModel({ ...core, securitySafetyContractDigest: bridgeDigest(core) });
}

export default createBridgeSecuritySafetyContract;
