import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_CAPABILITIES, runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * Verifies a produced runtime UI for dev-only / isolated safety invariants. Pure — returns a
 * report; never throws, never mutates, never performs I/O. Any violated invariant is a blocker.
 *
 * Detects: old-prototype import, App/pages/components import, ReactDOM/createRoot, window/document,
 * `.tsx`/`.css` attempts, route/menu attempts, backend/Prisma attempts, fetch/storage attempts,
 * real mutation/navigation/submit/save, production/staging attempts, real data read/write, and
 * forbidden-flag inversion (including domRuntimeCreated true).
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object}
 */
export function verifyRuntimeUi(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : RUNTIME_UI_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'tsxCreated', 'domCreated', 'cssCreated', 'routeCreated', 'menuCreated', 'moduleGenerated',
    'filesWrittenToModule', 'moduleRegistered', 'domRuntimeCreated', 'cssRuntimeCreated',
    'routeRuntimeCreated', 'menuRuntimeCreated', 'moduleRuntimeCreated', 'backendAccessed',
    'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed',
    'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported',
    'appWired',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['devOnly', 'isolated', 'contractDriven', 'syntheticDataOnly', 'virtualFrameDriven', 'runtimeUiImplemented', 'uiCreated'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }

  // Isolation boundary: no wiring / mount / forbidden import.
  const ib = isGenericModelPlainObject(contract.isolationBoundary) ? contract.isolationBoundary : {};
  if (ib.oldPrototypeImported === true) blockers.push('unsafe_old_prototype_import');
  if (ib.componentsImported === true) blockers.push('unsafe_components_import');
  if (ib.pagesImported === true) blockers.push('unsafe_pages_import');
  if (ib.appWired === true) blockers.push('unsafe_app_wired');
  if (ib.routeWired === true) blockers.push('unsafe_route_wired');
  if (ib.menuWired === true) blockers.push('unsafe_menu_wired');
  if (ib.reactDomUsed === true) blockers.push('unsafe_react_dom');
  if (ib.createRootUsed === true) blockers.push('unsafe_create_root');
  if (ib.domGlobalsUsed === true) blockers.push('unsafe_dom_globals');

  // Interaction registry: no real handlers/mutation/navigation.
  const ir = isGenericModelPlainObject(contract.interactionRegistry) ? contract.interactionRegistry : {};
  if (ir.realMutation === true) blockers.push('unsafe_real_mutation');
  if (ir.realNavigation === true) blockers.push('unsafe_real_navigation');
  if (ir.realSubmit === true) blockers.push('unsafe_real_submit');
  if (ir.realSave === true) blockers.push('unsafe_real_save');

  // React tree: no real DOM mount.
  const rt = isGenericModelPlainObject(contract.reactTree) ? contract.reactTree : {};
  if (rt.mountedToRealDom === true) blockers.push('unsafe_mounted_to_real_dom');
  if (rt.tsxCreated === true) blockers.push('unsafe_tsx');

  // Virtual frame input: no real data.
  const vf = isGenericModelPlainObject(contract.virtualFrameInput) ? contract.virtualFrameInput : {};
  if (vf.realDataRead === true) blockers.push('unsafe_real_data_read');
  if (vf.realDataWrite === true) blockers.push('unsafe_real_data_write');

  const ok = blockers.length === 0;
  const core = {
    kind: 'runtime-ui-verification',
    ok,
    valid: ok,
    devOnly: caps.devOnly === true,
    isolated: caps.isolated === true,
    runtimeUiImplemented: caps.runtimeUiImplemented === true,
    visualRuntimeImplemented: caps.visualRuntimeImplemented === true,
    domRuntimeCreated: caps.domRuntimeCreated === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: runtimeUiDigest(core) });
}

export default verifyRuntimeUi;
