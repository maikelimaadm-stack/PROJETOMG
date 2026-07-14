/**
 * Studio Scope Governance Guard — Post-Foundation C.
 *
 * Pure, deterministic classifier that earlier Studio slices' branch-relative scope checks
 * (and this slice's own gate) consume so they can tolerate EXPLICITLY known later Studio
 * headless artifacts while still failing hard for forbidden or unknown paths.
 *
 * Import policy: this helper imports ONLY the registry (data). It runs no command, does no
 * network/backend/Prisma/fetch/mutation, and imports no production code.
 *
 * Branch-relative scope checks may run on later Studio headless slices before merge.
 * Known later Studio headless artifacts are tolerated here, but forbidden scopes still fail.
 *
 * @module scripts/gates/lib/studioScopeGovernanceGuard
 */

import {
  FORBIDDEN_SCOPE_PATTERNS,
  KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  SCOPE_SHAPE_PATTERNS,
} from './studioScopeGovernanceRegistry.mjs';

/** @typedef {'own_slice_allowed'|'known_later_studio_headless_artifact'|'evidence_only'|'test_only'|'gate_only'|'package_script_only'|'forbidden_scope'|'unknown_scope'} StudioScopeClass */

const asArray = (v) => (Array.isArray(v) ? v : []);
const isRegExp = (v) => v instanceof RegExp;
const matchesAny = (path, patterns) => asArray(patterns).some((re) => isRegExp(re) && re.test(path));

/**
 * Classifies a single changed path. Pure. Priority order (highest first):
 *  1. forbidden_scope — matches a forbidden pattern (unless the CURRENT slice explicitly
 *     authorizes that exact path via `options.ownSliceAuthorized`).
 *  2. own_slice_allowed — the current slice's own authorized paths.
 *  3. known_later_studio_headless_artifact — an explicitly registered later artifact.
 *  4. evidence_only / test_only / gate_only / package_script_only — structural shape.
 *  5. unknown_scope — anything else (fails by default).
 *
 * @param {string} path repo-relative path
 * @param {Object} [options]
 * @param {RegExp[]} [options.ownSliceAuthorized] paths the CURRENT slice authorizes
 * @param {RegExp[]} [options.explicitlyAuthorizedForbidden] forbidden paths the CURRENT
 *   slice explicitly authorizes (e.g. productionUiGuard when that IS the slice's scope)
 * @returns {StudioScopeClass}
 */
export function classifyStudioScopePath(path, options = {}) {
  if (typeof path !== 'string' || path.length === 0) return 'unknown_scope';
  const o = options && typeof options === 'object' ? options : {};
  const ownAuthorized = asArray(o.ownSliceAuthorized);
  const explicitForbidden = asArray(o.explicitlyAuthorizedForbidden);

  const isForbidden = matchesAny(path, FORBIDDEN_SCOPE_PATTERNS);
  if (isForbidden) {
    // A forbidden path can only escape if the current slice EXPLICITLY authorizes that
    // exact path. Known-later tolerance can NEVER release a forbidden path.
    if (matchesAny(path, explicitForbidden)) return 'own_slice_allowed';
    return 'forbidden_scope';
  }

  if (matchesAny(path, ownAuthorized)) return 'own_slice_allowed';
  if (matchesAny(path, KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS)) return 'known_later_studio_headless_artifact';

  if (SCOPE_SHAPE_PATTERNS.gate_only.test(path)) return 'gate_only';
  if (SCOPE_SHAPE_PATTERNS.test_only.test(path)) return 'test_only';
  if (SCOPE_SHAPE_PATTERNS.package_script_only.test(path)) return 'package_script_only';
  if (SCOPE_SHAPE_PATTERNS.evidence_only.test(path)) return 'evidence_only';

  return 'unknown_scope';
}

/** True only when the path is an explicitly registered later Studio headless artifact
 * AND not forbidden. This is the tolerance predicate old scope checks consume. */
export function isKnownLaterStudioHeadlessArtifact(path, options = {}) {
  return classifyStudioScopePath(path, options) === 'known_later_studio_headless_artifact';
}

/** Returns only the forbidden paths from a list. */
export function filterForbiddenScopePaths(paths, options = {}) {
  return asArray(paths).filter((p) => classifyStudioScopePath(p, options) === 'forbidden_scope');
}

/** Returns only the unknown paths (fail-by-default) from a list. */
export function filterUnknownScopePaths(paths, options = {}) {
  return asArray(paths).filter((p) => classifyStudioScopePath(p, options) === 'unknown_scope');
}

/** Returns only the explicitly-known later Studio headless artifacts from a list. */
export function filterKnownLaterStudioHeadlessArtifacts(paths, options = {}) {
  return asArray(paths).filter((p) => classifyStudioScopePath(p, options) === 'known_later_studio_headless_artifact');
}

/**
 * Throws if any path is forbidden. Never tolerant of forbidden scope. Returns the list
 * back when clean.
 * @param {string[]} paths
 * @param {Object} [options]
 * @returns {string[]}
 */
export function assertNoForbiddenScopePaths(paths, options = {}) {
  const forbidden = filterForbiddenScopePaths(paths, options);
  if (forbidden.length > 0) {
    const err = new Error(`forbidden scope paths detected: ${forbidden.join(', ')}`);
    err.code = 'STUDIO_SCOPE_FORBIDDEN';
    err.forbidden = forbidden;
    throw err;
  }
  return asArray(paths);
}

/**
 * Deterministic, serializable governance report for a changed-file list. Separates known
 * later artifacts, forbidden, and unknown. `blocked` is true when there is any forbidden
 * OR unknown path (unknown fails by default).
 *
 * @param {string[]} paths
 * @param {Object} [options]
 * @returns {Object}
 */
export function createStudioScopeGovernanceReport(paths, options = {}) {
  const list = asArray(paths).filter((p) => typeof p === 'string' && p.length > 0);
  /** @type {Record<StudioScopeClass, string[]>} */
  const byClass = {
    own_slice_allowed: [], known_later_studio_headless_artifact: [], evidence_only: [],
    test_only: [], gate_only: [], package_script_only: [], forbidden_scope: [], unknown_scope: [],
  };
  for (const p of [...list].sort()) byClass[classifyStudioScopePath(p, options)].push(p);

  const forbidden = byClass.forbidden_scope;
  const unknown = byClass.unknown_scope;
  const knownLater = byClass.known_later_studio_headless_artifact;

  return {
    kind: 'studio-scope-governance-report',
    total: list.length,
    byClass,
    forbidden,
    unknown,
    knownLater,
    blocked: forbidden.length > 0 || unknown.length > 0,
    safe: forbidden.length === 0 && unknown.length === 0,
    // This helper never performs a side effect.
    sideEffects: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
  };
}

export default classifyStudioScopePath;
