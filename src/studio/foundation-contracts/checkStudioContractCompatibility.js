import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/**
 * Classifies a proposed change to a Studio foundation contract.
 *
 * Classification (pure, deterministic):
 *  - `invalid`                  → either side is not a plain object → contract invalidated.
 *  - `breaking`                 → a safety-relevant flag was released/relaxed. Requires a MAJOR version.
 *  - `backward_compatible`      → additive only (new safe entities/types/kinds/actions).
 *  - `conditionally_compatible` → non-additive but non-breaking (renames, reorders, notes).
 *  - `compatible`              → nothing changed.
 *
 * A "breaking" change is any of: releasing UI/route/menu/mutation/production/backend/
 * Prisma/migration; removing tenantRequired/permissionRequired; disabling failClosed/
 * defaultDeny; removing the safety/persistence/route-menu gate; enabling automatic
 * module registration or marketplace publication.
 *
 * @param {Object} [options]
 * @param {Object} [options.current] the current (baseline) contract
 * @param {Object} [options.next] the proposed contract
 * @returns {Object} compatibility result
 */
export function checkStudioContractCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const current = o.current;
  const next = o.next;

  if (!isGenericModelPlainObject(current) || !isGenericModelPlainObject(next)) {
    return safeCloneGenericModel({
      kind: 'studio-compatibility-result',
      classification: 'invalid',
      compatible: false,
      requiresMajorVersion: false,
      contractInvalidated: true,
      breakingChanges: [],
      additiveChanges: [],
      neutralChanges: [],
      reason: 'both current and next must be plain contract objects',
    });
  }

  /** Flags that MUST stay false; flipping true is breaking (a released capability). */
  const MUST_STAY_FALSE = [
    'uiEnabled', 'routeEnabled', 'menuEnabled', 'mutationAllowed', 'productionEnabled',
    'backendEnabled', 'prismaEnabled', 'migrationEnabled', 'moduleRegistrationEnabled',
    'stagingEnabled', 'fetchEnabled', 'marketplaceEnabled', 'generatedModuleAllowed',
  ];
  /** Flags that MUST stay true; flipping false is breaking (a removed guard). */
  const MUST_STAY_TRUE = ['headless'];

  /** @type {string[]} */ const breakingChanges = [];
  /** @type {string[]} */ const additiveChanges = [];
  /** @type {string[]} */ const neutralChanges = [];

  for (const flag of MUST_STAY_FALSE) {
    if (current[flag] === false && next[flag] === true) breakingChanges.push(`released capability: ${flag}`);
  }
  for (const flag of MUST_STAY_TRUE) {
    if (current[flag] === true && next[flag] === false) breakingChanges.push(`removed guard: ${flag}`);
  }

  // Safety-invariant relaxations (fail-closed / default-deny / tenant / permission).
  const curInv = isGenericModelPlainObject(current.safetyInvariants) ? current.safetyInvariants : {};
  const nextInv = isGenericModelPlainObject(next.safetyInvariants) ? next.safetyInvariants : {};
  const GUARD_INVARIANTS = ['failClosed', 'defaultDeny', 'tenantRequired', 'permissionRequired', 'noAutomaticPublication', 'noAutomaticMarketplace'];
  for (const inv of GUARD_INVARIANTS) {
    if (curInv[inv] === true && nextInv[inv] === false) breakingChanges.push(`relaxed safety invariant: ${inv}`);
  }

  // Required gates (safety / persistence / route-menu). Removing one is breaking.
  const curGates = Array.isArray(current.requiredGates) ? current.requiredGates : [];
  const nextGates = Array.isArray(next.requiredGates) ? next.requiredGates : [];
  for (const g of curGates) {
    if (!nextGates.includes(g)) breakingChanges.push(`removed required gate: ${g}`);
  }

  // Additive (backward-compatible) changes: new allowlist entries.
  const listPairs = [
    ['entityNames', 'entity'], ['allowedTypes', 'field type'], ['allowedKinds', 'validation kind'],
    ['kindNames', 'screen kind'], ['actions', 'permission action'], ['levels', 'permission level'],
    ['states', 'state'], ['types', 'runtime binding type'],
  ];
  for (const [key, label] of listPairs) {
    const cur = Array.isArray(current[key]) ? current[key] : [];
    const nxt = Array.isArray(next[key]) ? next[key] : [];
    for (const v of nxt) if (!cur.includes(v)) additiveChanges.push(`added ${label}: ${v}`);
    for (const v of cur) if (!nxt.includes(v)) neutralChanges.push(`removed ${label}: ${v}`);
  }

  // Version bump alone is neutral.
  if (typeof current.contractVersion === 'string' && typeof next.contractVersion === 'string'
    && current.contractVersion !== next.contractVersion) {
    neutralChanges.push(`version: ${current.contractVersion} -> ${next.contractVersion}`);
  }

  let classification;
  if (breakingChanges.length > 0) classification = 'breaking';
  else if (additiveChanges.length > 0) classification = 'backward_compatible';
  else if (neutralChanges.length > 0) classification = 'conditionally_compatible';
  else classification = 'compatible';

  return safeCloneGenericModel({
    kind: 'studio-compatibility-result',
    classification,
    compatible: breakingChanges.length === 0,
    requiresMajorVersion: breakingChanges.length > 0,
    contractInvalidated: false,
    breakingChanges,
    additiveChanges,
    neutralChanges,
    reason: breakingChanges.length > 0
      ? 'a safety-relevant capability was released or a guard removed'
      : 'no breaking change detected',
  });
}

export default checkStudioContractCompatibility;
