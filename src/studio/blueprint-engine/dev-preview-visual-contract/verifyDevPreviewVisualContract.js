import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
  BLOCKED_VISUAL_PLACEHOLDER_KINDS,
  ALLOWED_VISUAL_PLACEHOLDER_KINDS,
  visualDigest,
} from './devPreviewVisualContractConfig.js';

/**
 * Verifies a produced dev preview visual contract for headless safety invariants. Pure,
 * metadata-only. Returns a verification report — it never throws, never mutates, never
 * performs I/O. Any violated invariant produces a blocker.
 *
 * Detects: React/JSX/TSX/DOM/CSS-runtime attempts, route/menu attempts, backend/Prisma
 * attempts, mutation/persistence attempts, production/staging attempts, unknown/forbidden
 * placeholder kinds, unsafe interactions, and forbidden flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract] the produced visual contract (from the composer)
 * @returns {Object} verification report
 */
export function verifyDevPreviewVisualContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : VISUAL_CONTRACT_HEADLESS_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
    'mutationAllowed', 'persistenceCreated', 'rewriteEmpresas',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (contract.metadataOnly === false) blockers.push('contract_must_be_metadata_only');

  // Placeholder registry: every allowed entry must be an allowed, non-blocked kind.
  const registry = isGenericModelPlainObject(contract.placeholderRegistry) ? contract.placeholderRegistry : {};
  const registryKinds = Array.isArray(registry.allowedKinds) ? registry.allowedKinds : [];
  for (const kind of registryKinds) {
    if (!ALLOWED_VISUAL_PLACEHOLDER_KINDS.includes(kind)) blockers.push('placeholder_unknown');
    if (BLOCKED_VISUAL_PLACEHOLDER_KINDS.includes(kind)) blockers.push('placeholder_blocked');
  }

  // Interactions: no real handler, no enabled mutation.
  const interaction = isGenericModelPlainObject(contract.visualInteraction) ? contract.visualInteraction : {};
  if (interaction.anyRealHandler === true) blockers.push('unsafe_interaction_real_handler');
  if (interaction.anyMutationEnabled === true) blockers.push('unsafe_interaction_mutation_enabled');

  const ok = blockers.length === 0;
  const core = {
    kind: 'dev-preview-visual-contract-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: visualDigest(core) });
}

export default verifyDevPreviewVisualContract;
