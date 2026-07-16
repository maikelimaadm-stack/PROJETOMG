import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Verifies a produced authoring foundation contract for headless / contract-only / metadata-only
 * safety invariants. Pure — returns a report; never throws, never mutates, never performs I/O. Any
 * violated invariant is a blocker.
 *
 * Detects: any authoring-runtime/UI/editor/persistence capability true, module generation / file
 * writes / module registration, draft self-certification / certified-contract overwrite / publish /
 * product exposure, menu/route creation, App touch, backend/Prisma/migration, fetch/mutation,
 * production/staging, real data read/write, prototype relink, SSOT inversion (draft canonical), missing
 * manual gate, and permission/tenancy bypass.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object}
 */
export function verifyAuthoringFoundationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'draftIsCanonical', 'authoringRuntimeImplemented', 'authoringUiImplemented', 'editorImplemented',
    'persistenceImplemented', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
    'mutationAllowed', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked',
    'productExposed', 'menuCreated', 'routeCreated',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = [
    'headless', 'contractOnly', 'metadataOnly', 'syntheticOnly', 'devOnly', 'ssotPreserved',
    'certifiedBlueprintRemainsSsot',
  ];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (contract.metadataOnly === false) blockers.push('contract_must_be_metadata_only');

  // SSOT boundary.
  const ss = isGenericModelPlainObject(contract.ssotBoundary) ? contract.ssotBoundary : {};
  if (ss.draftIsCanonical === true) blockers.push('unsafe_draft_canonical');
  if (ss.certifiedBlueprintRemainsSsot === false) blockers.push('unsafe_ssot_not_preserved');
  if (ss.draftSelfCertifies === true || ss.draftOverwritesCertifiedContract === true) blockers.push('unsafe_draft_self_certifies');

  // Draft descriptor (optional, when a sample draft is embedded).
  const draft = isGenericModelPlainObject(contract.sampleDraft) ? contract.sampleDraft : {};
  if (draft.canonical === true) blockers.push('unsafe_sample_draft_canonical');
  if (draft.selfCertifiable === true || draft.overwritesCertifiedContract === true) blockers.push('unsafe_sample_draft_self_certifies');
  if (draft.registersModule === true || draft.generatesFiles === true || draft.publishes === true) blockers.push('unsafe_sample_draft_generates');

  // Operation catalog authorizes nothing real.
  const oc = isGenericModelPlainObject(contract.operationCatalog) ? contract.operationCatalog : {};
  if (oc.anyImplemented === true) blockers.push('unsafe_operations_implemented');
  if (oc.anyMutatesCertifiedContract === true || oc.anyGeneratesModule === true) blockers.push('unsafe_operations_mutate');

  // Preview handoff synthetic only.
  const ph = isGenericModelPlainObject(contract.previewHandoff) ? contract.previewHandoff : {};
  if (ph.handoffToProduct === true) blockers.push('unsafe_preview_handoff_to_product');
  if (ph.syntheticOnly === false || ph.mountsPreview === true) blockers.push('unsafe_preview_handoff');

  // Certification candidate never certifies.
  const cc = isGenericModelPlainObject(contract.certificationCandidate) ? contract.certificationCandidate : {};
  if (cc.candidateIsCertification === true || cc.draftSelfCertifies === true) blockers.push('unsafe_candidate_certifies');
  if (cc.registersModule === true || cc.generatesFiles === true || cc.publishes === true) blockers.push('unsafe_candidate_generates');

  // Permission/tenancy boundary must not be bypassed and must not claim integration without a foundation.
  const pt = isGenericModelPlainObject(contract.permissionTenancy) ? contract.permissionTenancy : {};
  if (pt.bypassesPermission === true || pt.bypassesTenancy === true) blockers.push('unsafe_permission_tenancy_bypass');
  if (pt.crossesTenantBoundary === true || pt.readsTenantData === true) blockers.push('unsafe_tenant_crossing');
  if (pt.permissionModelIntegrated === true) blockers.push('unsafe_permission_model_integrated_without_foundation');
  if (pt.tenantModelIntegrated === true) blockers.push('unsafe_tenant_model_integrated_without_foundation');
  if (pt.serverSideAuthorizationIntegrated === true) blockers.push('unsafe_server_side_authorization_integrated');

  // Lifecycle must not surface any forbidden (productive/certified) state.
  const lc = isGenericModelPlainObject(contract.lifecycle) ? contract.lifecycle : {};
  if (lc.emitsForbiddenState === true) blockers.push('unsafe_lifecycle_emits_forbidden_state');
  if (lc.drivesRuntime === true) blockers.push('unsafe_lifecycle_drives_runtime');
  const FORBIDDEN_LC = ['published', 'production', 'registered', 'generated', 'deployed', 'persisted', 'certified'];
  if (Array.isArray(lc.states) && lc.states.some((s) => FORBIDDEN_LC.includes(s))) blockers.push('unsafe_lifecycle_forbidden_state_present');

  // Prototype relink prohibition.
  const pr = isGenericModelPlainObject(contract.prototypeRelinkProhibition) ? contract.prototypeRelinkProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Manual gate present and authorizes nothing real.
  const mg = isGenericModelPlainObject(contract.manualGate) ? contract.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesAuthoringRuntime === true || mg.authorizesModuleGeneration === true || mg.authorizesCertification === true) {
    blockers.push('unsafe_manual_gate_authorizes_real');
  }

  // Safety.
  const sc = isGenericModelPlainObject(contract.safety) ? contract.safety : {};
  if (sc.anyForbiddenSideEffect === true) blockers.push('unsafe_safety_side_effect');

  const ok = blockers.length === 0;
  const core = {
    kind: 'authoring-foundation-contract-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    metadataOnly: caps.metadataOnly === true,
    ssotPreserved: caps.ssotPreserved === true,
    draftIsCanonical: caps.draftIsCanonical === true,
    moduleGenerated: caps.moduleGenerated === true,
    productExposed: caps.productExposed === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: authoringFoundationDigest(core) });
}

export default verifyAuthoringFoundationContract;
