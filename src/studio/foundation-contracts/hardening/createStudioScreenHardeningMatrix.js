import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_SCREEN_KINDS } from '../createStudioScreenBlueprintContract.js';

const ALLOWED = new Set(STUDIO_SCREEN_KINDS);
const REQUIRED_STATES = ['emptyState', 'loadingState', 'errorState'];
const MUTATION_ACTIONS = new Set(['create', 'update', 'delete']);

function detectCircular(value) {
  const seen = new WeakSet();
  let circular = false;
  const visit = (v) => {
    if (circular || !v || typeof v !== 'object') return;
    if (seen.has(v)) { circular = true; return; }
    seen.add(v);
    for (const k of Object.keys(v)) visit(v[k]);
  };
  try { visit(value); } catch { circular = true; }
  return circular;
}

/**
 * Classifies a screen definition. Pure. A screen never generates a React component,
 * registers a route, or enables mutation actions by default.
 * @param {unknown} screen
 * @param {{ knownFields?: string[] }} [ctx]
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[] }}
 */
export function evaluateStudioScreen(screen, ctx = {}) {
  const s = isGenericModelPlainObject(screen) ? screen : {};
  const fields = Array.isArray(ctx.knownFields) ? ctx.knownFields : [];
  /** @type {string[]} */ const reasons = [];
  const kind = typeof s.kind === 'string' ? s.kind : '';

  if (!ALLOWED.has(kind)) reasons.push(`unknown screen kind: ${kind || '(none)'}`);
  if (!s.id) reasons.push('screen without id');
  if (!s.permission) reasons.push('screen without permission');
  if (s.generatesReactComponent === true || s.generatesUi === true) reasons.push('screen generates a React component');
  if (typeof s.componentPath === 'string' && s.componentPath.length > 0) reasons.push('screen binds a real component path');
  if (s.appJsxBinding === true || typeof s.appJsxBinding === 'string') reasons.push('screen binds App.jsx');
  if (s.routeAutoBinding === true) reasons.push('screen auto-binds a route');
  if (isGenericModelPlainObject(s.actions)) {
    for (const [action, cfg] of Object.entries(s.actions)) {
      const enabled = cfg === true || (isGenericModelPlainObject(cfg) && cfg.enabledByDefault === true);
      if (MUTATION_ACTIONS.has(action) && enabled) reasons.push(`${action} action enabled by default`);
      if (action === 'export' && isGenericModelPlainObject(cfg) && !cfg.permission) reasons.push('export without permission');
      if (isGenericModelPlainObject(cfg) && cfg.guardRequired === false) reasons.push(`toolbar action ${action} without guard`);
    }
  }
  if (isGenericModelPlainObject(s.diagnostics)) {
    const dj = JSON.stringify(s.diagnostics);
    if (/jwt|token|DATABASE[_]URL|password|secret/i.test(dj)) reasons.push('diagnostics contain a secret');
  }
  for (const st of REQUIRED_STATES) if (!(st in s)) reasons.push(`missing ${st}`);
  if (Array.isArray(s.columns)) {
    for (const c of s.columns) { const fn = isGenericModelPlainObject(c) ? c.field : c; if (typeof fn === 'string' && fields.length && !fields.includes(fn)) reasons.push(`references missing field: ${fn}`); }
  }
  if (detectCircular(s.layout)) reasons.push('circular layout');

  const valid = reasons.length === 0;
  return { valid, blocked: !valid, reasons };
}

const okStates = { emptyState: {}, loadingState: {}, errorState: {} };
const VALID_SCREENS = STUDIO_SCREEN_KINDS.map((k) => [`valid ${k}`, { id: `scr_${k}`, kind: k, permission: 'read', ...okStates }, true]);

const circularLayout = (() => { const o = {}; o.self = o; return o; })();
const INVALID_SCREENS = [
  ['unknown kind', { id: 's', kind: 'evil', permission: 'read', ...okStates }, false],
  ['missing id', { kind: 'table', permission: 'read', ...okStates }, false],
  ['missing permission', { id: 's', kind: 'table', ...okStates }, false],
  ['generates React component', { id: 's', kind: 'table', permission: 'read', generatesReactComponent: true, ...okStates }, false],
  ['real componentPath', { id: 's', kind: 'table', permission: 'read', componentPath: 'src/pages/X.jsx', ...okStates }, false],
  ['App.jsx binding', { id: 's', kind: 'table', permission: 'read', appJsxBinding: true, ...okStates }, false],
  ['route auto-binding', { id: 's', kind: 'table', permission: 'read', routeAutoBinding: true, ...okStates }, false],
  ['create action default', { id: 's', kind: 'form', permission: 'read', actions: { create: true }, ...okStates }, false],
  ['update action default', { id: 's', kind: 'form', permission: 'read', actions: { update: true }, ...okStates }, false],
  ['delete action default', { id: 's', kind: 'form', permission: 'read', actions: { delete: true }, ...okStates }, false],
  ['export without permission', { id: 's', kind: 'table', permission: 'read', actions: { export: {} }, ...okStates }, false],
  ['toolbar action without guard', { id: 's', kind: 'table', permission: 'read', actions: { refresh: { guardRequired: false } }, ...okStates }, false],
  ['diagnostics with secret', { id: 's', kind: 'table', permission: 'read', diagnostics: { jwt: 'abc' }, ...okStates }, false],
  ['missing empty/loading/error', { id: 's', kind: 'table', permission: 'read' }, false],
  ['references missing field', { id: 's', kind: 'table', permission: 'read', columns: [{ field: 'ghost' }], ...okStates }, false],
  ['circular layout', { id: 's', kind: 'table', permission: 'read', layout: circularLayout, ...okStates }, false],
];

/**
 * Runs the screen hardening matrix. Pure.
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioScreenHardeningMatrix(options = {}) {
  void options;
  const knownFields = ['codigo', 'nome'];
  const scenarios = [...VALID_SCREENS, ...INVALID_SCREENS].map(([name, screen, expectValid]) => {
    const r = evaluateStudioScreen(screen, { knownFields });
    return {
      name,
      valid: r.valid,
      blocked: r.blocked,
      expectValid: Boolean(expectValid),
      matchedExpectation: r.valid === Boolean(expectValid),
      generatesUi: false, routeRegistered: false, sideEffects: false,
      reasons: r.reasons.slice(0, 4),
    };
  });
  const mismatches = scenarios.filter((s) => !s.matchedExpectation).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-screen-hardening-matrix',
    kinds: [...STUDIO_SCREEN_KINDS],
    scenarios,
    scenarioCount: scenarios.length,
    allMatched: mismatches.length === 0,
    blockers: mismatches,
    warnings: [],
    readiness: mismatches.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioScreenHardeningMatrix;
