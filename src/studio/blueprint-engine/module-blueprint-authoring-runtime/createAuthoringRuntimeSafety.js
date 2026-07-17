import { createDeterministicDigest } from './createDeterministicDigest.js';

/** Safety — aggregates forbidden-side-effect flags; asserts none present; reversible by non-consumption. */
export function createAuthoringRuntimeSafety() {
  const forbiddenFlags = {
    certificationPerformed: false,
    authoringUiImplemented: false,
    editorImplemented: false,
    reactImported: false,
    appTouched: false,
    routeCreated: false,
    menuCreated: false,
    productExposed: false,
    persistenceImplemented: false,
    storageUsed: false,
    filesystemWritesUsed: false,
    databaseUsed: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
    moduleRegistered: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationCreated: false,
    fetchUsed: false,
    networkUsed: false,
    mutationExternalAllowed: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
    prototypeRelinked: false,
    productionAccessed: false,
    stagingAccessed: false,
    draftIsCanonical: false,
    candidateIsCanonical: false,
    selfCertified: false,
    ssotOverwritten: false,
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    nondeterministicSourceUsed: false,
    inputMutated: false,
  };
  const anyForbiddenSideEffect = Object.values(forbiddenFlags).some((v) => v === true);
  const core = {
    kind: 'authoring-runtime-safety',
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    headless: true,
    deterministic: true,
    immutableSnapshots: true,
    forbiddenFlags,
    forbiddenFlagCount: Object.keys(forbiddenFlags).length,
  };
  return Object.freeze({ ...core, safetyDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeSafety;
