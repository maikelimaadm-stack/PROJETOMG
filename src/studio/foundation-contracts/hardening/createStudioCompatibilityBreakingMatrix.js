import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { checkStudioContractCompatibility } from '../checkStudioContractCompatibility.js';

/** Capability flags that going false→true is breaking. */
const RELEASE_FLAGS = [
  'uiEnabled', 'routeEnabled', 'menuEnabled', 'productionEnabled', 'stagingEnabled',
  'backendEnabled', 'prismaEnabled', 'migrationEnabled', 'fetchEnabled', 'mutationAllowed',
  'generatedModuleAllowed', 'marketplaceEnabled', 'deleteDefaultAllowed', 'protectedFieldEditableDefault',
];
/** Guards that going true→false is breaking. */
const GUARD_FLAGS = ['defaultDeny', 'failClosed', 'tenantRequired', 'permissionRequired', 'noAutomaticPublication', 'noModuleRegistration'];

/**
 * Classifies a candidate contract vs a base contract. Pure. Extends the foundation
 * compatibility checker with the hardening-specific breaking cases (delete/protected
 * defaults, removed error codes / statuses / metamodel entities, unpolicied version).
 * @param {unknown} current
 * @param {unknown} next
 * @returns {{ classification: string, requiresMajorVersion: boolean, requiresMinorVersion: boolean, requiresPatchVersion: boolean, contractInvalidated: boolean, breakingChanges: string[], backwardCompatibleChanges: string[], warnings: string[] }}
 */
export function classifyStudioCompatibility(current, next) {
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (!isObj(current) || !isObj(next)) {
    return { classification: 'invalid', requiresMajorVersion: false, requiresMinorVersion: false, requiresPatchVersion: false, contractInvalidated: true, breakingChanges: [], backwardCompatibleChanges: [], warnings: ['non-object contract'] };
  }
  const c = /** @type {Record<string, unknown>} */ (current);
  const n = /** @type {Record<string, unknown>} */ (next);
  /** @type {string[]} */ const breakingChanges = [];
  /** @type {string[]} */ const backwardCompatibleChanges = [];
  /** @type {string[]} */ const warnings = [];

  for (const f of RELEASE_FLAGS) if (c[f] === false && n[f] === true) breakingChanges.push(`released: ${f}`);
  for (const f of GUARD_FLAGS) if (c[f] === true && n[f] === false) breakingChanges.push(`guard removed: ${f}`);

  // Delegate the shared subset to the foundation checker (safetyInvariants + gates + capability flags).
  const base = checkStudioContractCompatibility({ current: c, next: n });
  if (Array.isArray(base.breakingChanges)) for (const b of base.breakingChanges) if (!breakingChanges.includes(b)) breakingChanges.push(b);

  // Persistence default flipped to write.
  if (c.persistenceDefault === 'noPersistence' && typeof n.persistenceDefault === 'string' && /write/i.test(n.persistenceDefault)) breakingChanges.push('persistence default now write');

  // Removed error codes / statuses / metamodel entities.
  const removed = (key) => {
    const a = Array.isArray(c[key]) ? c[key] : [];
    const b = Array.isArray(n[key]) ? n[key] : [];
    return a.filter((x) => !b.includes(x));
  };
  for (const x of removed('errorCodes')) breakingChanges.push(`error code removed: ${x}`);
  for (const x of removed('blueprintStatuses')) breakingChanges.push(`blueprint status removed: ${x}`);
  for (const x of removed('metamodelEntities')) breakingChanges.push(`metamodel entity removed: ${x}`);

  // Version changed without a policy field.
  if (typeof c.contractVersion === 'string' && typeof n.contractVersion === 'string'
    && c.contractVersion !== n.contractVersion && n.versionPolicy == null) {
    breakingChanges.push('contractVersion changed without policy');
  }

  // Backward-compatible additions.
  const added = (key) => {
    const a = Array.isArray(c[key]) ? c[key] : [];
    const b = Array.isArray(n[key]) ? n[key] : [];
    return b.filter((x) => !a.includes(x));
  };
  for (const x of added('errorCodes')) backwardCompatibleChanges.push(`error code added: ${x}`);
  for (const x of added('optionalFields')) backwardCompatibleChanges.push(`optional field added: ${x}`);
  for (const x of added('plannedFieldTypes')) backwardCompatibleChanges.push(`planned field type added (disabled): ${x}`);
  for (const x of added('plannedScreenKinds')) backwardCompatibleChanges.push(`planned screen kind added (disabled): ${x}`);
  if (Array.isArray(base.additiveChanges)) for (const a of base.additiveChanges) if (!backwardCompatibleChanges.includes(a)) backwardCompatibleChanges.push(a);

  let classification;
  if (breakingChanges.length > 0) classification = 'breaking';
  else if (backwardCompatibleChanges.length > 0) classification = 'backward_compatible';
  else classification = 'compatible';

  return {
    classification,
    requiresMajorVersion: breakingChanges.length > 0,
    requiresMinorVersion: breakingChanges.length === 0 && backwardCompatibleChanges.length > 0,
    requiresPatchVersion: breakingChanges.length === 0 && backwardCompatibleChanges.length === 0,
    contractInvalidated: false,
    breakingChanges,
    backwardCompatibleChanges,
    warnings,
  };
}

const BREAKING_CASES = [
  ['uiEnabled false->true', { uiEnabled: false }, { uiEnabled: true }],
  ['routeEnabled false->true', { routeEnabled: false }, { routeEnabled: true }],
  ['menuEnabled false->true', { menuEnabled: false }, { menuEnabled: true }],
  ['productionEnabled false->true', { productionEnabled: false }, { productionEnabled: true }],
  ['backendEnabled false->true', { backendEnabled: false }, { backendEnabled: true }],
  ['prismaEnabled false->true', { prismaEnabled: false }, { prismaEnabled: true }],
  ['migrationEnabled false->true', { migrationEnabled: false }, { migrationEnabled: true }],
  ['fetchEnabled false->true', { fetchEnabled: false }, { fetchEnabled: true }],
  ['mutationAllowed false->true', { mutationAllowed: false }, { mutationAllowed: true }],
  ['generatedModuleAllowed false->true', { generatedModuleAllowed: false }, { generatedModuleAllowed: true }],
  ['marketplaceEnabled false->true', { marketplaceEnabled: false }, { marketplaceEnabled: true }],
  ['defaultDeny true->false', { defaultDeny: true }, { defaultDeny: false }],
  ['failClosed true->false', { failClosed: true }, { failClosed: false }],
  ['tenantRequired true->false', { tenantRequired: true }, { tenantRequired: false }],
  ['permissionRequired true->false', { permissionRequired: true }, { permissionRequired: false }],
  ['delete default false->true', { deleteDefaultAllowed: false }, { deleteDefaultAllowed: true }],
  ['protected editable false->true', { protectedFieldEditableDefault: false }, { protectedFieldEditableDefault: true }],
  ['error code removed', { errorCodes: ['A', 'B'] }, { errorCodes: ['A'] }],
];

const BACKWARD_CASES = [
  ['optional disabled field added', { optionalFields: ['a'] }, { optionalFields: ['a', 'b'] }],
  ['new error code added', { errorCodes: ['A'] }, { errorCodes: ['A', 'B'] }],
  ['planned field type disabled', { plannedFieldTypes: [] }, { plannedFieldTypes: ['geo'] }],
  ['planned screen kind disabled', { plannedScreenKinds: [] }, { plannedScreenKinds: ['timeline'] }],
];

/**
 * Runs the compatibility breaking matrix. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioCompatibilityBreakingMatrix(options = {}) {
  void options;
  const breaking = BREAKING_CASES.map(([name, current, next]) => {
    const r = classifyStudioCompatibility(current, next);
    return { name, classification: r.classification, isBreaking: r.classification === 'breaking', requiresMajorVersion: r.requiresMajorVersion, matchedExpectation: r.classification === 'breaking' };
  });
  const backward = BACKWARD_CASES.map(([name, current, next]) => {
    const r = classifyStudioCompatibility(current, next);
    return { name, classification: r.classification, isBreaking: r.classification === 'breaking', requiresMinorVersion: r.requiresMinorVersion, matchedExpectation: r.classification === 'backward_compatible' };
  });
  const invalid = classifyStudioCompatibility(null, {});
  const identical = classifyStudioCompatibility({ headless: true }, { headless: true });

  const scenarios = [...breaking, ...backward];
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-compatibility-breaking-matrix',
    breaking,
    backward,
    invalidClassification: invalid.classification,
    identicalClassification: identical.classification,
    scenarioCount: scenarios.length,
    allMatched: mismatches.length === 0 && invalid.classification === 'invalid' && identical.classification === 'compatible',
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioCompatibilityBreakingMatrix;
