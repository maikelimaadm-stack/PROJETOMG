import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_RUNTIME_CAPABILITIES, runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Verifies a produced isolated runtime for dev-only safety invariants. Pure — returns a
 * verification report; it never throws, never mutates, never performs I/O. Any violated
 * invariant produces a blocker.
 *
 * Detects: React/JSX/TSX/DOM/CSS-runtime attempts, route/menu attempts, backend/Prisma attempts,
 * mutation/persistence attempts, production/staging attempts, real data read/write attempts,
 * unsafe `renderAllowed:true`, a missing manual gate, and forbidden flag inversion. It requires
 * `isolatedRuntimeImplemented:true` (this slice DOES implement the dev-only runtime) but
 * `visualRuntimeImplemented:false`.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtime] the produced isolated runtime (from the composer)
 * @returns {Object} verification report
 */
export function verifyIsolatedRuntime(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const runtime = isGenericModelPlainObject(o.runtime) ? o.runtime : {};
  const caps = isGenericModelPlainObject(runtime.capabilities) ? runtime.capabilities : ISOLATED_RUNTIME_CAPABILITIES;

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
  const mustBeTrue = ['headless', 'devOnly', 'isolated', 'syntheticDataOnly', 'isolatedRuntimeImplemented'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (runtime.metadataOnly === false) blockers.push('runtime_output_must_be_metadata_only');

  // Render request: renderAllowed must never be true.
  const rr = isGenericModelPlainObject(runtime.renderRequest) ? runtime.renderRequest : {};
  if (rr.renderAllowed === true) blockers.push('unsafe_render_allowed_true');
  if (rr.realRenderProduced === true) blockers.push('unsafe_real_render_produced');

  // Manual gate: must be present + approved dev-only, must not open production/route-menu/module/backend/prisma.
  const mg = isGenericModelPlainObject(runtime.manualGate) ? runtime.manualGate : {};
  if (mg.approvedForDevOnlyIsolatedRuntime !== true) blockers.push('missing_manual_gate');
  if (mg.productionGate === true || mg.routeMenuGate === true || mg.moduleGenerationGate === true || mg.backendGate === true || mg.prismaGate === true) blockers.push('manual_gate_opens_forbidden');

  // Data boundary: no real data read/write.
  const db = isGenericModelPlainObject(runtime.dataBoundary) ? runtime.dataBoundary : {};
  if (db.realDataRead === true) blockers.push('unsafe_real_data_read');
  if (db.realDataWrite === true) blockers.push('unsafe_real_data_write');

  // Virtual frame: no React element / DOM node.
  const vf = isGenericModelPlainObject(runtime.virtualFrame) ? runtime.virtualFrame : {};
  if (vf.reactElement === true || vf.domNode === true) blockers.push('unsafe_virtual_frame');

  const ok = blockers.length === 0;
  const core = {
    kind: 'isolated-runtime-verification',
    ok,
    valid: ok,
    devOnly: caps.devOnly === true,
    isolated: caps.isolated === true,
    isolatedRuntimeImplemented: caps.isolatedRuntimeImplemented === true,
    visualRuntimeImplemented: caps.visualRuntimeImplemented === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: runtimeDigest(core) });
}

export default verifyIsolatedRuntime;
