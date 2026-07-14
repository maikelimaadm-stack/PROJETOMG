import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_CONTRACT_CAPABILITIES, uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Verifies a produced runtime UI contract for headless safety invariants. Pure — returns a
 * verification report; it never throws, never mutates, never performs I/O. Any violated
 * invariant produces a blocker.
 *
 * Detects: React/JSX/TSX/DOM/CSS-runtime attempts, route/menu attempts, backend/Prisma attempts,
 * mutation/persistence attempts, production/staging attempts, real data read/write attempts,
 * unsafe `renderAllowed:true`, `bindingAllowed:true`, `handlerCreated:true`, and forbidden flag
 * inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract] the produced runtime UI contract (from the composer)
 * @returns {Object} verification report
 */
export function verifyRuntimeUiContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : RUNTIME_UI_CONTRACT_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'reactComponentCreated', 'jsxCreated', 'tsxCreated', 'domCreated', 'cssCreated', 'uiCreated',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'visualRuntimeImplemented', 'reactRuntimeCreated', 'domRuntimeCreated', 'cssRuntimeCreated',
    'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed',
    'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed',
    'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'uiContractOnly', 'virtualFrameDriven'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (contract.metadataOnly === false) blockers.push('contract_must_be_metadata_only');

  // Render boundary: renderAllowed must never be true.
  const rb = isGenericModelPlainObject(contract.renderBoundary) ? contract.renderBoundary : {};
  if (rb.renderAllowed === true) blockers.push('unsafe_render_allowed_true');
  if (rb.realRenderProduced === true) blockers.push('unsafe_real_render_produced');

  // Component binding: bindingAllowed must never be true.
  const cb = isGenericModelPlainObject(contract.componentBinding) ? contract.componentBinding : {};
  if (cb.anyBindingAllowed === true) blockers.push('unsafe_binding_allowed_true');
  if (cb.anyRealComponentPath === true) blockers.push('unsafe_real_component_path');

  // Interaction binding: no handler created, no mutation.
  const ib = isGenericModelPlainObject(contract.interactionBinding) ? contract.interactionBinding : {};
  if (ib.anyHandlerCreated === true) blockers.push('unsafe_handler_created');
  if (ib.anyMutationAllowed === true) blockers.push('unsafe_interaction_mutation');

  // UI node: no react element / dom node.
  const nc = isGenericModelPlainObject(contract.nodeContract) ? contract.nodeContract : {};
  if (nc.reactElement === true || nc.domNode === true) blockers.push('unsafe_ui_node');

  const ok = blockers.length === 0;
  const core = {
    kind: 'runtime-ui-contract-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    visualRuntimeImplemented: caps.visualRuntimeImplemented === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: uiContractDigest(core) });
}

export default verifyRuntimeUiContract;
