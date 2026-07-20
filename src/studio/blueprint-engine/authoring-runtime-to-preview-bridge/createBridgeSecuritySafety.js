import { deepFreeze } from './deepFreeze.js';

/** SECURITY / SAFETY — every real-effect allowance is false; the bridge is headless/synthetic/metadata-only. */
export function createBridgeSecuritySafety() {
  const allowances = {
    networkAllowed: false,
    fetchAllowed: false,
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
    productionAllowed: false,
  };
  const anyForbiddenSideEffect = Object.values(allowances).some((v) => v === true);
  return deepFreeze({
    kind: 'bridge-security-safety',
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    headless: true,
    metadataOnly: true,
    allowances,
    allowanceCount: Object.keys(allowances).length,
  });
}

export default createBridgeSecuritySafety;
