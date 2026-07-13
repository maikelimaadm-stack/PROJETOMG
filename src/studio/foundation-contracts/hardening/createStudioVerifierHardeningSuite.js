import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { createStudioFoundationContract } from '../createStudioFoundationContract.js';
import { verifyStudioFoundationContracts } from '../verifyStudioFoundationContracts.js';

/** Deep clone a foundation so we can tamper safely (drops functions; contracts are data). */
const clone = (f) => JSON.parse(JSON.stringify(f));

/**
 * Runs the verifier hardening suite: for each tamper, the verifier must reject the
 * foundation (valid=false, safeToUse=false). Pure — builds fresh foundations.
 * @param {Object} [options]
 * @returns {Object} suite result
 */
export function createStudioVerifierHardeningSuite(options = {}) {
  void options;
  const good = createStudioFoundationContract();

  /** @type {{name: string, tamper: (f: any) => void}[]} */
  const tampers = [
    { name: 'manifest overall digest altered', tamper: (f) => { f.manifest.overallDigest = 'fnv1a-deadbeef'; } },
    { name: 'foundation digest altered', tamper: (f) => { f.manifest.foundationDigest = 'fnv1a-00000000'; } },
    { name: 'metamodel digest altered', tamper: (f) => { f.manifest.metamodelDigest = 'fnv1a-00000000'; } },
    { name: 'blueprint digest altered', tamper: (f) => { f.manifest.blueprintDigest = 'fnv1a-00000000'; } },
    { name: 'safety digest altered', tamper: (f) => { f.manifest.safetyPolicyDigest = 'fnv1a-00000000'; } },
    { name: 'persistence digest altered', tamper: (f) => { f.manifest.persistenceBoundaryDigest = 'fnv1a-00000000'; } },
    { name: 'route/menu digest altered', tamper: (f) => { f.manifest.routeMenuDigest = 'fnv1a-00000000'; } },
    { name: 'permission digest altered', tamper: (f) => { f.manifest.permissionBlueprintDigest = 'fnv1a-00000000'; } },
    { name: 'blockers not empty', tamper: (f) => { f.manifest.blockers = ['x']; } },
    { name: 'uiEnabled true', tamper: (f) => { f.uiEnabled = true; } },
    { name: 'routeEnabled true', tamper: (f) => { f.routeEnabled = true; } },
    { name: 'menuEnabled true', tamper: (f) => { f.menuEnabled = true; } },
    { name: 'backendEnabled true', tamper: (f) => { f.backendEnabled = true; } },
    { name: 'prismaEnabled true', tamper: (f) => { f.prismaEnabled = true; } },
    { name: 'migrationEnabled true', tamper: (f) => { f.migrationEnabled = true; } },
    { name: 'productionEnabled true', tamper: (f) => { f.productionEnabled = true; } },
    { name: 'mutationAllowed true', tamper: (f) => { f.mutationAllowed = true; } },
    { name: 'defaultDeny false', tamper: (f) => { f.permissionBlueprint.defaultDeny = false; } },
    { name: 'failClosed false', tamper: (f) => { f.safetyPolicy.invariants.failClosed = false; } },
  ];

  const scenarios = tampers.map(({ name, tamper }) => {
    const f = clone(good);
    tamper(f);
    const v = verifyStudioFoundationContracts({ foundation: f });
    return {
      name,
      rejected: v.valid === false,
      safeToUseAsFoundationReference: v.safeToUseAsFoundationReference === true,
      readiness: v.readiness,
      matchedExpectation: v.valid === false && v.safeToUseAsFoundationReference === false,
    };
  });

  // Sanity: the untampered foundation verifies true.
  const goodVerify = verifyStudioFoundationContracts({ foundation: good });
  const notRejected = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  const allOk = notRejected.length === 0 && goodVerify.valid === true;

  return safeCloneGenericModel({
    kind: 'studio-verifier-hardening-suite',
    goodFoundationValid: goodVerify.valid === true,
    scenarios,
    scenarioCount: scenarios.length,
    allRejected: notRejected.length === 0,
    allPassed: allOk,
    blockers: notRejected,
    warnings: [],
    readiness: allOk ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioVerifierHardeningSuite;
