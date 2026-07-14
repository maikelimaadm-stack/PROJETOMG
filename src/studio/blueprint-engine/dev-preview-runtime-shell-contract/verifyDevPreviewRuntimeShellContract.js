import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_SHELL_HEADLESS_CAPABILITIES, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Verifies a produced dev preview runtime shell contract for headless safety invariants.
 * Pure, metadata-only. Returns a verification report — it never throws, never mutates, never
 * performs I/O. Any violated invariant produces a blocker.
 *
 * Detects: React/JSX/TSX/DOM/CSS-runtime attempts, route/menu attempts, backend/Prisma
 * attempts, mutation/persistence attempts, production/staging attempts, real data read/write
 * attempts, unsafe event handler, unsafe `renderAllowed:true`, and forbidden flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract] the produced runtime shell contract (from the composer)
 * @returns {Object} verification report
 */
export function verifyDevPreviewRuntimeShellContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : RUNTIME_SHELL_HEADLESS_CAPABILITIES;

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

  // Render request: renderAllowed must never be true in this slice.
  const rr = isGenericModelPlainObject(contract.renderRequest) ? contract.renderRequest : {};
  if (rr.renderAllowed === true) blockers.push('unsafe_render_allowed_true');

  // Event contract: no real handler / listener / mutation.
  const ev = isGenericModelPlainObject(contract.eventContract) ? contract.eventContract : {};
  if (ev.anyRealHandler === true) blockers.push('unsafe_event_handler');
  if (ev.anyRealListener === true) blockers.push('unsafe_event_listener');
  if (ev.anyMutation === true) blockers.push('unsafe_event_mutation');

  // Data boundary: no real data read/write.
  const db = isGenericModelPlainObject(contract.dataBoundary) ? contract.dataBoundary : {};
  if (db.realDataRead === true) blockers.push('unsafe_real_data_read');
  if (db.realDataWrite === true) blockers.push('unsafe_real_data_write');

  // Mount boundary: nothing mounted.
  const mb = isGenericModelPlainObject(contract.mountBoundary) ? contract.mountBoundary : {};
  if (mb.mountCreated === true || mb.domTouched === true || mb.reactMounted === true) blockers.push('unsafe_mount');

  const ok = blockers.length === 0;
  const core = {
    kind: 'dev-preview-runtime-shell-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: shellDigest(core) });
}

export default verifyDevPreviewRuntimeShellContract;
