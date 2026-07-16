import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Safety contract — aggregates the forbidden-side-effect flags and asserts none is present, and that
 * the foundation is reversible by non-consumption. Pure and deterministic.
 * @returns {Object}
 */
export function createAuthoringSafetyContract() {
  const forbiddenFlags = {
    authoringRuntimeImplemented: false,
    authoringUiImplemented: false,
    editorImplemented: false,
    persistenceImplemented: false,
    moduleGenerated: false,
    filesWrittenToModule: false,
    moduleRegistered: false,
    draftSelfCertified: false,
    certifiedContractOverwritten: false,
    published: false,
    productExposed: false,
    menuCreated: false,
    routeCreated: false,
    appTouched: false,
    reactImported: false,
    domTouched: false,
    backendAccessed: false,
    prismaAccessed: false,
    migrationCreated: false,
    fetchUsed: false,
    storageUsed: false,
    mutationAllowed: false,
    persistenceCreated: false,
    realDataRead: false,
    realDataWrite: false,
    rewriteEmpresas: false,
    oldPrototypeImported: false,
    productionAccessed: false,
    stagingAccessed: false,
  };
  const anyForbiddenSideEffect = Object.values(forbiddenFlags).some((v) => v === true);

  const core = {
    kind: 'authoring-safety-contract',
    anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    headless: true,
    contractOnly: true,
    metadataOnly: true,
    forbiddenFlags,
    forbiddenFlagCount: Object.keys(forbiddenFlags).length,
  };
  return safeCloneGenericModel({ ...core, safetyDigest: authoringFoundationDigest(core) });
}

export default createAuthoringSafetyContract;
