import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { classifyStudioCompatibility } from '../hardening/createStudioCompatibilityBreakingMatrix.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/** Every capability whose false→true release must classify as breaking. */
const RELEASE_FLAGS = [
  'uiEnabled', 'routeEnabled', 'menuEnabled', 'moduleRegistrationEnabled', 'backendEnabled',
  'prismaEnabled', 'migrationEnabled', 'productionEnabled', 'stagingEnabled', 'fetchEnabled',
  'mutationAllowed', 'generatedModuleAllowed', 'marketplaceEnabled', 'deleteDefaultAllowed',
  'protectedFieldEditableDefault',
];
/** Guards whose true→false relaxation must classify as breaking. */
const GUARD_FLAGS = ['defaultDeny', 'failClosed', 'tenantRequired', 'permissionRequired', 'noAutomaticPublication', 'noModuleRegistration'];

/**
 * Certifies the canonical compatibility rules, using the hardening classifier to prove
 * every breaking rule holds and additive changes are backward-compatible. Pure.
 *
 * @param {Object} [options]
 * @returns {Object} canonical compatibility rules
 */
export function createStudioCanonicalCompatibilityRules(options = {}) {
  void options;

  const breakingRules = [];
  for (const f of RELEASE_FLAGS) breakingRules.push({ rule: `${f} false->true`, breaking: classifyStudioCompatibility({ [f]: false }, { [f]: true }).classification === 'breaking' });
  for (const f of GUARD_FLAGS) breakingRules.push({ rule: `${f} true->false`, breaking: classifyStudioCompatibility({ [f]: true }, { [f]: false }).classification === 'breaking' });
  breakingRules.push({ rule: 'persistence default noPersistence->write', breaking: classifyStudioCompatibility({ persistenceDefault: 'noPersistence' }, { persistenceDefault: 'localWriteDraft' }).classification === 'breaking' });
  breakingRules.push({ rule: 'error code removed', breaking: classifyStudioCompatibility({ errorCodes: ['A', 'B'] }, { errorCodes: ['A'] }).classification === 'breaking' });
  breakingRules.push({ rule: 'metamodel entity removed', breaking: classifyStudioCompatibility({ metamodelEntities: ['A', 'B'] }, { metamodelEntities: ['A'] }).classification === 'breaking' });
  breakingRules.push({ rule: 'blueprint status removed', breaking: classifyStudioCompatibility({ blueprintStatuses: ['draft', 'blocked'] }, { blueprintStatuses: ['draft'] }).classification === 'breaking' });
  breakingRules.push({ rule: 'contractVersion changed without policy', breaking: classifyStudioCompatibility({ contractVersion: '1.0.0' }, { contractVersion: '2.0.0' }).classification === 'breaking' });

  const backwardRules = [
    { rule: 'new optional field', backward: classifyStudioCompatibility({ optionalFields: ['a'] }, { optionalFields: ['a', 'b'] }).classification === 'backward_compatible' },
    { rule: 'new error code', backward: classifyStudioCompatibility({ errorCodes: ['A'] }, { errorCodes: ['A', 'B'] }).classification === 'backward_compatible' },
    { rule: 'new disabled placeholder screen', backward: classifyStudioCompatibility({ plannedScreenKinds: [] }, { plannedScreenKinds: ['timeline'] }).classification === 'backward_compatible' },
    { rule: 'new disabled field type', backward: classifyStudioCompatibility({ plannedFieldTypes: [] }, { plannedFieldTypes: ['geo'] }).classification === 'backward_compatible' },
  ];

  const allBreakingHold = breakingRules.every((r) => r.breaking);
  const allBackwardHold = backwardRules.every((r) => r.backward);

  const body = {
    kind: 'studio-canonical-compatibility-rules',
    breakingRules,
    backwardRules,
    allBreakingHold,
    allBackwardHold,
    valid: allBreakingHold && allBackwardHold,
  };
  return safeCloneGenericModel({ ...body, canonicalCompatibilityRulesDigest: certificationDigest({ breaking: breakingRules.map((r) => r.rule), backward: backwardRules.map((r) => r.rule) }) });
}

export default createStudioCanonicalCompatibilityRules;
