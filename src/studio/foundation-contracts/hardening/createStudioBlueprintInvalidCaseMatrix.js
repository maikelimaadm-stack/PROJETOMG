import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_HARDENING_MAX_BLUEPRINT_KEYS } from './studioBlueprintHardeningConfig.js';

const REQUIRED_KEYS = ['blueprintId', 'blueprintVersion', 'blueprintType', 'modelType', 'module', 'fields', 'permissions', 'persistenceBoundary', 'runtimeBinding'];
const KNOWN_STATUSES = new Set(['draft', 'validated', 'previewable', 'certified_local', 'ready_for_staging', 'blocked', 'deprecated']);
const KNOWN_MODEL_FAMILIES = new Set(['cadastro', 'operacional', 'reference', 'experimental']);
const KNOWN_MODEL_TYPES = new Set(['cadastro', 'operacional', 'dashboardPlanned', 'workflowPlanned', 'marketplacePlanned']);
const POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const KNOWN_KEYS = new Set([
  'blueprintId', 'blueprintVersion', 'blueprintType', 'status', 'owner', 'modelFamily', 'modelType',
  'module', 'fields', 'screens', 'validations', 'permissions', 'routeMenu', 'persistenceBoundary',
  'runtimeBinding', 'diagnostics', 'gates', 'compatibility', 'publicationPolicy', 'safetyPolicy', 'notes',
]);

/** Total key count across a nested object, and whether it is circular. */
function inspectShape(value) {
  let keyCount = 0;
  let circular = false;
  const seen = new WeakSet();
  const visit = (v) => {
    if (circular) return;
    if (!v || typeof v !== 'object') return;
    if (seen.has(v)) { circular = true; return; }
    seen.add(v);
    for (const k of Object.keys(v)) {
      keyCount += 1;
      visit(v[k]);
    }
  };
  try { visit(value); } catch { circular = true; }
  return { keyCount, circular };
}

/**
 * Classifies a single blueprint value as invalid/blocked when malformed, unsafe, or
 * incomplete. Pure and side-effect-free. Never mutates the input.
 *
 * @param {unknown} blueprint
 * @param {{ strict?: boolean }} [options]
 * @returns {{ valid: boolean, blocked: boolean, reasons: string[], errorCode: string }}
 */
export function evaluateStudioBlueprintValidity(blueprint, options = {}) {
  const strict = options && options.strict !== false; // strict by default
  /** @type {string[]} */ const reasons = [];

  if (blueprint === null) reasons.push('blueprint is null');
  else if (blueprint === undefined) reasons.push('blueprint is undefined');
  else if (typeof blueprint === 'string') reasons.push('blueprint is a string');
  else if (typeof blueprint === 'function') reasons.push('blueprint is a function');
  else if (Array.isArray(blueprint)) reasons.push('blueprint is an array');
  else if (!isGenericModelPlainObject(blueprint)) reasons.push('blueprint is not a plain object');

  if (isGenericModelPlainObject(blueprint) || (blueprint && typeof blueprint === 'object' && !Array.isArray(blueprint))) {
    const bp = /** @type {Record<string, unknown>} */ (blueprint);
    // Prototype pollution — own enumerable pollution keys.
    for (const k of Object.keys(bp)) if (POLLUTION_KEYS.has(k)) reasons.push(`prototype pollution key: ${k}`);

    const { keyCount, circular } = inspectShape(bp);
    if (circular) reasons.push('circular reference');
    if (keyCount > STUDIO_HARDENING_MAX_BLUEPRINT_KEYS) reasons.push(`oversized blueprint (${keyCount} keys)`);

    for (const key of REQUIRED_KEYS) {
      if (!(key in bp) || bp[key] === undefined || bp[key] === null) reasons.push(`missing ${key}`);
    }
    if ('fields' in bp && bp.fields !== undefined && !Array.isArray(bp.fields)) reasons.push('fields is not an array');
    if ('status' in bp && bp.status !== undefined && !KNOWN_STATUSES.has(String(bp.status))) reasons.push(`invalid status: ${String(bp.status)}`);
    if ('modelFamily' in bp && bp.modelFamily !== undefined && !KNOWN_MODEL_FAMILIES.has(String(bp.modelFamily))) reasons.push(`invalid modelFamily: ${String(bp.modelFamily)}`);
    if ('modelType' in bp && bp.modelType !== undefined && bp.modelType !== null && !KNOWN_MODEL_TYPES.has(String(bp.modelType))) reasons.push(`invalid modelType: ${String(bp.modelType)}`);
    // Dangerous defaults present at the top-level.
    for (const dk of ['productionAllowed', 'menuVisible', 'routeEnabled', 'mutationAllowed', 'backendAllowed', 'prismaAllowed', 'migrationAllowed']) {
      if (bp[dk] === true) reasons.push(`dangerous default: ${dk}`);
    }
    if (strict) {
      for (const k of Object.keys(bp)) {
        if (!KNOWN_KEYS.has(k) && !POLLUTION_KEYS.has(k)) reasons.push(`unknown key (strict): ${k}`);
      }
    }
  }

  const dangerous = reasons.some((r) => r.startsWith('dangerous default'));
  const valid = reasons.length === 0;
  return {
    valid,
    blocked: !valid,
    reasons,
    errorCode: valid ? '' : (dangerous ? 'STUDIO_HARDENING_DANGEROUS_BLUEPRINT' : 'STUDIO_HARDENING_INVALID_BLUEPRINT'),
  };
}

const CIRCULAR = (() => { const o = {}; o.self = o; return o; })();

/** The invalid-case scenario catalog. Each entry is a malformed/unsafe blueprint. */
const INVALID_CASES = [
  ['blueprint null', null],
  ['blueprint undefined', undefined],
  ['blueprint string', 'not-a-blueprint'],
  ['blueprint array', []],
  ['blueprint function', function bp() {}],
  ['prototype pollution', JSON.parse('{"__proto__":{"polluted":true},"blueprintId":"x"}')],
  ['missing blueprintId', { blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['missing blueprintVersion', { blueprintId: 'b', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['missing blueprintType', { blueprintId: 'b', blueprintVersion: '1.0.0', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['invalid status', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', status: 'live', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['invalid modelFamily', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelFamily: 'evil', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['missing modelType', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['invalid modelType', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'evil', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['missing module', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['fields not array', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: {}, permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }],
  ['missing permissions', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], persistenceBoundary: {}, runtimeBinding: {} }],
  ['missing persistenceBoundary', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, runtimeBinding: {} }],
  ['missing runtimeBinding', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {} }],
  ['unknown keys strict', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {}, evilKey: 1 }],
  ['circular reference', CIRCULAR],
  ['oversized blueprint', (() => { const bp = { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {} }; const big = {}; for (let i = 0; i < STUDIO_HARDENING_MAX_BLUEPRINT_KEYS + 5; i += 1) big[`k${i}`] = i; bp.module = big; return bp; })()],
  ['dangerous defaults', { blueprintId: 'b', blueprintVersion: '1.0.0', blueprintType: 'module', modelType: 'cadastro', module: {}, fields: [], permissions: {}, persistenceBoundary: {}, runtimeBinding: {}, productionAllowed: true, mutationAllowed: true }],
];

/**
 * Runs the full invalid-case matrix. Every case must be blocked. Pure.
 *
 * @param {Object} [options]
 * @returns {Object} matrix result
 */
export function createStudioBlueprintInvalidCaseMatrix(options = {}) {
  const strict = !(options && options.strict === false);
  const scenarios = INVALID_CASES.map(([name, input]) => {
    const r = evaluateStudioBlueprintValidity(input, { strict });
    return {
      name,
      valid: r.valid,
      blocked: r.blocked,
      safeToUse: false,
      sideEffects: false,
      noUi: true, noRoute: true, noMenu: true, noBackend: true, noPrisma: true,
      noMigration: true, noProduction: true, noMutation: true, noFetch: true,
      errorCode: r.errorCode || 'STUDIO_HARDENING_INVALID_BLUEPRINT',
      reasons: r.reasons.slice(0, 6),
    };
  });

  const blockers = scenarios.filter((s) => !s.blocked).map((s) => s.name);
  return safeCloneGenericModel({
    kind: 'studio-blueprint-invalid-case-matrix',
    strict,
    scenarios,
    scenarioCount: scenarios.length,
    allBlocked: blockers.length === 0,
    blockers,
    warnings: [],
    readiness: blockers.length === 0 ? 'blueprint_contract_hardened' : 'blocked',
  });
}

export default createStudioBlueprintInvalidCaseMatrix;
