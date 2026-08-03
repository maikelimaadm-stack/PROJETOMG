/**
 * Studio Scope Governance Guard — Post-Foundation C.
 *
 * Pure, deterministic, CALLER-AWARE classifier that the Studio slices' branch-relative
 * scope checks consume. Every check asks the same question with its OWN identity:
 *
 *   "which slice is this branch building, and is that slice the same as me or after me?"
 *
 * The previous API could not answer it. `isKnownLaterStudioHeadlessArtifact(path)` received
 * no caller identity, so a registered path was tolerated merely because it existed — not
 * because it was later. `evaluateStudioBranchScope(changedPaths, { callerSliceId })` fixes
 * that: it resolves exactly one ACTIVE slice from the changed set, refuses to proceed when
 * that resolution is empty or ambiguous, and then admits only artifacts the active slice
 * actually owns, is explicitly cross-authorized for, or shares.
 *
 * Import policy: this helper imports ONLY the registry (data). It runs no command, does no
 * network/backend/Prisma/fetch/mutation, reads no branch name, no clock and no environment,
 * and imports no production code.
 *
 * @module scripts/gates/lib/studioScopeGovernanceGuard
 */

import {
  FORBIDDEN_SCOPE_PATTERNS,
  KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  SCOPE_SHAPE_PATTERNS,
  STUDIO_SLICE_CATALOG,
} from './studioScopeGovernanceRegistry.mjs';

/** @typedef {'own_slice_allowed'|'known_later_studio_headless_artifact'|'evidence_only'|'test_only'|'gate_only'|'package_script_only'|'forbidden_scope'|'unknown_scope'} StudioScopeClass */

const asArray = (v) => (Array.isArray(v) ? v : []);
const isRegExp = (v) => v instanceof RegExp;
const matchesAny = (path, patterns) => asArray(patterns).some((re) => isRegExp(re) && re.test(path));
const isPath = (v) => typeof v === 'string' && v.length > 0;

// ---------------------------------------------------------------------------
// Catalog lookups
// ---------------------------------------------------------------------------

/** The catalog sorted oldest-first by ordinal. Pure, computed once, never mutated. */
const CATALOG_BY_ORDINAL = Object.freeze([...STUDIO_SLICE_CATALOG].sort((a, b) => a.sliceOrdinal - b.sliceOrdinal));

/** Returns the catalogued slice with this id, or null. Pure. */
export function getStudioSliceById(sliceId) {
  if (typeof sliceId !== 'string' || sliceId.length === 0) return null;
  return CATALOG_BY_ORDINAL.find((s) => s.sliceId === sliceId) || null;
}

/** Returns the catalogued slice with this ordinal, or null. Pure. */
export function getStudioSliceByOrdinal(sliceOrdinal) {
  if (!Number.isInteger(sliceOrdinal)) return null;
  return CATALOG_BY_ORDINAL.find((s) => s.sliceOrdinal === sliceOrdinal) || null;
}

/**
 * Every slice that OWNS this path (matches its `primaryArtifactPatterns`). Ownership never
 * overlaps in a well-formed catalog, so this returns zero or one entry — returning a list
 * lets the governance test prove that invariant instead of assuming it.
 */
export function findOwningStudioSlices(path) {
  if (!isPath(path)) return [];
  return CATALOG_BY_ORDINAL.filter((s) => matchesAny(path, s.primaryArtifactPatterns));
}

/** Every slice whose narrow branch markers match this path. */
export function findMarkingStudioSlices(path) {
  if (!isPath(path)) return [];
  return CATALOG_BY_ORDINAL.filter((s) => matchesAny(path, s.branchMarkerPatterns));
}

/** The union of what a slice may legitimately touch: own + cross-authorized + shared. */
function allowedPatternsFor(slice) {
  return [
    ...asArray(slice.primaryArtifactPatterns),
    ...asArray(slice.crossSliceAuthorizedPatterns),
    ...asArray(slice.sharedGovernancePatterns),
  ];
}

/**
 * The patterns a slice may legitimately touch, read from ITS OWN catalog entry. Pure. Returns an empty list for an
 * unknown slice id, so an unknown caller can never widen anything.
 */
export function getAuthorizedPatternsForStudioSlice(sliceId) {
  const slice = getStudioSliceById(sliceId);
  return slice ? Object.freeze(allowedPatternsFor(slice)) : Object.freeze([]);
}

/** True iff `path` is one of the artifacts `sliceId` is authorized to touch. Pure. */
export function isPathAuthorizedForStudioSlice(path, sliceId) {
  if (!isPath(path)) return false;
  return matchesAny(path, getAuthorizedPatternsForStudioSlice(sliceId));
}

/**
 * The forbidden paths a slice explicitly authorizes, read from ITS OWN catalog entry. This is the ONLY source of
 * such an authorization: it can never be supplied by a caller and can never be inherited by another slice.
 */
export function getExplicitlyAuthorizedForbiddenPatternsForStudioSlice(sliceId) {
  const slice = getStudioSliceById(sliceId);
  return slice ? Object.freeze([...asArray(slice.explicitlyAuthorizedForbiddenPatterns)]) : Object.freeze([]);
}

// ---------------------------------------------------------------------------
// Active slice resolution
// ---------------------------------------------------------------------------

/**
 * Resolves WHICH slice a branch is building, from its changed paths alone.
 *
 * Uses only `branchMarkerPatterns` — never the branch name, the network, GitHub, the clock
 * or the environment. Shared infrastructure (package manifests, the registry, the guard) is
 * never a marker, so touching it alone resolves nothing. Test and gate files are not markers
 * either, because a later slice may touch them through an exact cross-slice authorization.
 *
 * Fails closed: zero markers and two-or-more distinct markers are BOTH refusals.
 *
 * @param {string[]} changedPaths
 * @returns {{ok:boolean, sliceId:string|null, sliceOrdinal:number|null, candidates:string[], reason:string|null}}
 */
export function resolveActiveStudioSlice(changedPaths) {
  const paths = asArray(changedPaths).filter(isPath);
  const seen = new Map();
  for (const p of paths) {
    for (const s of findMarkingStudioSlices(p)) {
      if (!seen.has(s.sliceId)) seen.set(s.sliceId, s);
    }
  }
  const candidates = [...seen.keys()].sort();
  if (candidates.length === 0) {
    return { ok: false, sliceId: null, sliceOrdinal: null, candidates, reason: 'no_active_slice_resolved' };
  }
  if (candidates.length > 1) {
    return { ok: false, sliceId: null, sliceOrdinal: null, candidates, reason: 'ambiguous_active_slice' };
  }
  const slice = seen.get(candidates[0]);
  return { ok: true, sliceId: slice.sliceId, sliceOrdinal: slice.sliceOrdinal, candidates, reason: null };
}

// ---------------------------------------------------------------------------
// Single-path classification
// ---------------------------------------------------------------------------

/**
 * Classifies a single changed path. Pure. Priority order (highest first):
 *  1. forbidden_scope — matches a forbidden pattern (unless the CURRENT slice explicitly
 *     authorizes that exact path via `options.explicitlyAuthorizedForbidden`).
 *  2. own_slice_allowed — the current slice's own authorized paths.
 *  3. known_later_studio_headless_artifact — registered in the catalog (chronology-free;
 *     `evaluateStudioBranchScope` is the chronological answer).
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
  if (!isPath(path)) return 'unknown_scope';
  const o = options && typeof options === 'object' ? options : {};
  const ownAuthorized = asArray(o.ownSliceAuthorized);
  const explicitForbidden = asArray(o.explicitlyAuthorizedForbidden);

  const isForbidden = matchesAny(path, FORBIDDEN_SCOPE_PATTERNS);
  if (isForbidden) {
    // A forbidden path can only escape if the current slice EXPLICITLY authorizes that
    // exact path. Catalog membership can NEVER release a forbidden path.
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

// ---------------------------------------------------------------------------
// Caller-aware branch evaluation — the chronological API
// ---------------------------------------------------------------------------

/**
 * Evaluates a whole changed-path set from the point of view of ONE calling slice.
 *
 * The ONLY source of a forbidden-path authorization is the ACTIVE slice's own catalog entry
 * (`explicitlyAuthorizedForbiddenPatterns`). There is deliberately NO caller-supplied option: a caller cannot
 * inject a wide regex, cannot authorize a path for a slice that does not declare it, and cannot inherit another
 * slice's authorization. A forbidden path the active slice DOES declare becomes `allowed` and is listed in
 * `explicitForbiddenAuthorized` — it never falls through into `unknown`.
 *
 * Rules, in order:
 *  1. a forbidden path blocks unless the ACTIVE slice's catalog entry explicitly authorizes it;
 *  2. an authorization belongs to the slice that declares it and is never inherited or supplied from outside;
 *  3. an unknown `callerSliceId` blocks;
 *  4. an unresolved or ambiguous active slice blocks (and then NOTHING is authorized, forbidden included);
 *  5. active === caller admits the caller's own primary / cross / shared paths;
 *  6. active AFTER caller admits only the ACTIVE slice's primary / cross / shared paths;
 *  7. active BEFORE caller blocks (an older slice cannot be building on top of a newer one);
 *  8. a path owned by another catalogued slice that the active slice is not explicitly cross-authorized for blocks;
 *  9. a path owned by nobody blocks (unknown fails closed);
 * 10. a cross authorization belongs to the slice that declares it and is never inherited.
 *
 * @param {string[]} changedPaths
 * @param {Object} options
 * @param {string} options.callerSliceId the slice performing the check
 * @returns {Object} deterministic, serializable report
 */
export function evaluateStudioBranchScope(changedPaths, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const paths = [...new Set(asArray(changedPaths).filter(isPath))].sort();

  const blockers = [];
  const forbidden = [];
  const allowed = [];
  const unknown = [];
  const chronologicalViolation = [];
  const crossAuthorized = [];
  const explicitForbiddenAuthorized = [];

  // Rule 3 — the caller must be catalogued.
  const caller = getStudioSliceById(o.callerSliceId);
  if (!caller) blockers.push('unknown_caller_slice');

  // Rule 4 — exactly one active slice, or refuse. Until it resolves, nothing is authorized.
  const active = resolveActiveStudioSlice(paths);
  if (!active.ok) blockers.push(active.reason);

  // Rules 1/2 — the authorization comes from the ACTIVE slice's catalog entry and nowhere else.
  const activeSlice = active.ok ? getStudioSliceById(active.sliceId) : null;
  const activeExplicitForbidden = activeSlice ? asArray(activeSlice.explicitlyAuthorizedForbiddenPatterns) : [];
  for (const p of paths) {
    if (!matchesAny(p, FORBIDDEN_SCOPE_PATTERNS)) continue;
    if (matchesAny(p, activeExplicitForbidden)) explicitForbiddenAuthorized.push(p);
    else forbidden.push(p);
  }
  if (forbidden.length > 0) blockers.push('forbidden_scope');

  if (caller && active.ok) {
    // Rule 7 — an older active slice under a newer caller's check is a chronology violation.
    if (activeSlice.sliceOrdinal < caller.sliceOrdinal) blockers.push('active_slice_before_caller');

    const admitted = allowedPatternsFor(activeSlice);
    const crossPatterns = asArray(activeSlice.crossSliceAuthorizedPatterns);
    for (const p of paths) {
      if (forbidden.includes(p)) continue;
      // An explicitly authorized forbidden path IS allowed — it must never fall through into `unknown`.
      if (explicitForbiddenAuthorized.includes(p)) { allowed.push(p); continue; }
      if (matchesAny(p, admitted)) {
        allowed.push(p);
        // Rule 10 — record what was admitted purely by the ACTIVE slice's cross list.
        if (matchesAny(p, crossPatterns)) crossAuthorized.push(p);
        continue;
      }
      // Rules 8/9 — not admitted: owned by another catalogued slice, or owned by nobody.
      if (findOwningStudioSlices(p).length > 0) chronologicalViolation.push(p);
      else unknown.push(p);
    }
    if (chronologicalViolation.length > 0) blockers.push('unauthorized_foreign_slice_path');
    if (unknown.length > 0) blockers.push('unknown_scope');
  } else {
    // Caller or active unresolved: nothing can be admitted, so everything non-forbidden is
    // reported as unknown and the caller fails closed with a complete picture.
    for (const p of paths) if (!forbidden.includes(p)) unknown.push(p);
    if (unknown.length > 0) blockers.push('unknown_scope');
  }

  const uniqueBlockers = [...new Set(blockers)].sort();
  return {
    kind: 'studio-branch-scope-evaluation',
    callerSliceId: caller ? caller.sliceId : null,
    callerSliceOrdinal: caller ? caller.sliceOrdinal : null,
    activeSliceId: active.ok ? active.sliceId : null,
    activeSliceOrdinal: active.ok ? active.sliceOrdinal : null,
    activeCandidates: [...active.candidates],
    total: paths.length,
    allowed: [...allowed].sort(),
    forbidden: [...forbidden].sort(),
    unknown: [...unknown].sort(),
    chronologicalViolation: [...chronologicalViolation].sort(),
    crossAuthorized: [...crossAuthorized].sort(),
    explicitForbiddenAuthorized: [...explicitForbiddenAuthorized].sort(),
    blockers: uniqueBlockers,
    safe: uniqueBlockers.length === 0,
    // This helper never performs a side effect.
    sideEffects: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
  };
}

// ---------------------------------------------------------------------------
// Branch-diff boundary — the ONLY place that knows what an empty diff means
// ---------------------------------------------------------------------------

/**
 * Evaluates a BRANCH DIFF from the point of view of ONE calling slice.
 *
 * This is the boundary API for branch-relative scope checks. It exists because the core
 * evaluation and the branch boundary answer two different questions:
 *
 *   `evaluateStudioBranchScope([])` answers "is this changed-path SET safe?" — an empty set
 *   resolves no active slice, so it is and must stay fail-closed. That semantics is NOT
 *   relaxed here and is proven by dedicated scenarios.
 *
 *   `evaluateStudioBranchDiffScope([])` answers "does this BRANCH DIFF violate my scope?" —
 *   an empty diff means there is nothing to judge (the check is running on `main`, where
 *   `git diff --name-only origin/main...HEAD` legitimately returns nothing). That is
 *   `notApplicable`, not a violation.
 *
 * An empty diff never authorizes anything: `allowed` stays empty and no path is admitted.
 * An unknown caller still blocks, even with an empty diff — `notApplicable` may never mask
 * an invalid caller identity.
 *
 * Invalid input (not an array, or any non-string / empty-string item) is NOT coerced into an
 * empty diff: it fails closed with `invalid_changed_paths`.
 *
 * Pure: runs no command, touches no filesystem, no env, no network, no clock, mutates nothing.
 *
 * @param {string[]} changedPaths the branch diff, possibly empty
 * @param {Object} options
 * @param {string} options.callerSliceId the slice performing the check
 * @returns {Object} deterministic, serializable report
 */
export function evaluateStudioBranchDiffScope(changedPaths, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const caller = getStudioSliceById(o.callerSliceId);

  const inputValid = Array.isArray(changedPaths) && changedPaths.every(isPath);

  const base = {
    kind: 'studio-branch-diff-scope-evaluation',
    callerSliceId: caller ? caller.sliceId : null,
    callerSliceOrdinal: caller ? caller.sliceOrdinal : null,
    activeSliceId: null,
    activeSliceOrdinal: null,
    activeCandidates: [],
    total: 0,
    allowed: [],
    forbidden: [],
    unknown: [],
    chronologicalViolation: [],
    crossAuthorized: [],
    explicitForbiddenAuthorized: [],
    sideEffects: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
  };

  // Invalid input fails closed and is never treated as "no changes".
  if (!inputValid) {
    const blockers = ['invalid_changed_paths'];
    if (!caller) blockers.push('unknown_caller_slice');
    return Object.freeze({
      ...base, applicable: false, notApplicable: false, reason: 'invalid_changed_paths',
      blockers: [...new Set(blockers)].sort(), safe: false,
    });
  }

  // Empty diff: nothing to judge. An unknown caller still blocks.
  if (changedPaths.length === 0) {
    if (!caller) {
      return Object.freeze({
        ...base, applicable: false, notApplicable: false, reason: 'unknown_caller_slice',
        blockers: ['unknown_caller_slice'], safe: false,
      });
    }
    return Object.freeze({
      ...base, applicable: false, notApplicable: true, reason: 'empty_branch_diff',
      blockers: [], safe: true,
    });
  }

  // Non-empty diff: the chronological core decides, unchanged.
  const inner = evaluateStudioBranchScope(changedPaths, { callerSliceId: o.callerSliceId });
  return Object.freeze({
    ...inner,
    kind: 'studio-branch-diff-scope-evaluation',
    applicable: true,
    notApplicable: false,
    reason: null,
  });
}

// ---------------------------------------------------------------------------
// Consumer applicability — the boundary a branch-relative CHECK uses about itself
// ---------------------------------------------------------------------------

/**
 * Evaluates whether a branch-relative CHECK is even applicable to the branch it is running on,
 * and, when it is not, whether the branch is nevertheless safe under its OWN active slice.
 *
 * This exists because branch certification and consumer applicability are two different questions,
 * and the core answers only the first one:
 *
 *   `evaluateStudioBranchDiffScope(diff, { callerSliceId })` answers
 *   "can this branch be certified FROM THIS SLICE'S point of view?" — and when the branch is
 *   building an EARLIER slice, the honest answer is no: `active_slice_before_caller`. That is
 *   correct and is NOT relaxed here.
 *
 *   `evaluateStudioBranchConsumerScope(diff, { callerSliceId })` answers
 *   "am I, a later check, applicable to this branch — and if not, is the branch still sound?"
 *
 * The second question matters because a merged later slice ships tests and gates that run inside
 * an older slice's still-open branch. Such a check is a passenger, not the certifier.
 *
 * Inapplicability is deliberately NARROW and requires BOTH of the following, in this order:
 *
 *   1. the branch's own active slice declares `historicalBranchConsumerCompatibility: true` in the
 *      catalog. Being chronologically earlier is not enough — otherwise every merged slice would
 *      become reopenable by any later consumer. The authorization is catalog-bound, explicit, not
 *      inherited, and never inferred from `sliceOrdinal`, `status`, a branch name, a PR number or
 *      any environment signal. When it is absent or false the core's `active_slice_before_caller`
 *      refusal is returned verbatim and self-certification is not attempted;
 *   2. the exact same changed-path set re-certifies cleanly against that active slice. Declaring a
 *      consumer inapplicable must never certify anything by omission.
 *
 * A later consumer therefore can never mask a forbidden path, an unknown path, a foreign slice
 * path, an unauthorized cross, an explicit-forbidden path the active slice does not declare, an
 * unresolved active slice, an ambiguous one, or an earlier slice that was never authorized to
 * carry later consumers — every one of those still fails.
 *
 * Pure: no command, no filesystem, no env, no network, no clock, no mutation.
 *
 * @param {string[]} changedPaths the branch diff, possibly empty
 * @param {Object} options
 * @param {string} options.callerSliceId the slice whose CHECK is running
 * @returns {Object} deterministic, serializable, frozen report
 */
export function evaluateStudioBranchConsumerScope(changedPaths, options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const consumer = getStudioSliceById(o.callerSliceId);
  const inputValid = Array.isArray(changedPaths) && changedPaths.every(isPath);

  const base = {
    kind: 'studio-branch-consumer-scope-evaluation',
    consumerSliceId: consumer ? consumer.sliceId : null,
    consumerSliceOrdinal: consumer ? consumer.sliceOrdinal : null,
    activeSliceId: null,
    activeSliceOrdinal: null,
    evaluatedAsSliceId: null,
    activeCandidates: [],
    total: 0,
    allowed: [],
    forbidden: [],
    unknown: [],
    chronologicalViolation: [],
    crossAuthorized: [],
    explicitForbiddenAuthorized: [],
    certifiedAgainstActiveSlice: false,
    sideEffects: false,
    backendAccessed: false,
    prismaAccessed: false,
    fetchUsed: false,
    mutationAllowed: false,
  };

  // Invalid input fails closed and is never treated as "no changes".
  if (!inputValid) {
    const blockers = ['invalid_changed_paths'];
    if (!consumer) blockers.push('unknown_caller_slice');
    return Object.freeze({
      ...base, consumerApplicable: false, applicable: false, notApplicable: false,
      reason: 'invalid_changed_paths', blockers: [...new Set(blockers)].sort(), safe: false,
    });
  }

  // An unknown consumer identity blocks, empty diff or not.
  if (!consumer) {
    return Object.freeze({
      ...base, consumerApplicable: false, applicable: false, notApplicable: false,
      reason: 'unknown_caller_slice', blockers: ['unknown_caller_slice'], safe: false,
    });
  }

  // Nothing to judge.
  if (changedPaths.length === 0) {
    return Object.freeze({
      ...base, consumerApplicable: false, applicable: false, notApplicable: true,
      reason: 'empty_branch_diff', blockers: [], safe: true,
    });
  }

  // The branch must still name exactly one slice. Unresolved and ambiguous both block.
  const active = resolveActiveStudioSlice(changedPaths);
  if (!active.ok) {
    const inner = evaluateStudioBranchDiffScope(changedPaths, { callerSliceId: consumer.sliceId });
    return Object.freeze({
      ...base,
      activeCandidates: [...active.candidates],
      total: inner.total,
      forbidden: [...inner.forbidden],
      unknown: [...inner.unknown],
      chronologicalViolation: [...inner.chronologicalViolation],
      consumerApplicable: false, applicable: false, notApplicable: false,
      reason: active.reason, blockers: [...inner.blockers], safe: false,
    });
  }

  const activeSlice = getStudioSliceById(active.sliceId);

  // The consumer is at or before the active slice: it IS the certifier, so delegate untouched.
  if (activeSlice.sliceOrdinal >= consumer.sliceOrdinal) {
    const inner = evaluateStudioBranchDiffScope(changedPaths, { callerSliceId: consumer.sliceId });
    return Object.freeze({
      ...base,
      activeSliceId: inner.activeSliceId,
      activeSliceOrdinal: inner.activeSliceOrdinal,
      evaluatedAsSliceId: consumer.sliceId,
      activeCandidates: [...inner.activeCandidates],
      total: inner.total,
      allowed: [...inner.allowed],
      forbidden: [...inner.forbidden],
      unknown: [...inner.unknown],
      chronologicalViolation: [...inner.chronologicalViolation],
      crossAuthorized: [...inner.crossAuthorized],
      explicitForbiddenAuthorized: [...inner.explicitForbiddenAuthorized],
      consumerApplicable: true, applicable: true, notApplicable: false,
      reason: null, certifiedAgainstActiveSlice: false,
      blockers: [...inner.blockers], safe: inner.safe,
    });
  }

  // The branch is building an EARLIER slice. Being earlier is NOT, by itself, permission to carry
  // later consumers: that would silently reopen every merged slice. The active slice must declare
  // the authorization EXPLICITLY in the catalog. Absent or false, the chronological refusal of the
  // core stands verbatim and self-certification is not even attempted.
  if (activeSlice.historicalBranchConsumerCompatibility !== true) {
    return Object.freeze({
      ...base,
      activeSliceId: activeSlice.sliceId,
      activeSliceOrdinal: activeSlice.sliceOrdinal,
      activeCandidates: [...active.candidates],
      consumerApplicable: false, applicable: false, notApplicable: false,
      reason: 'historical_branch_consumer_compatibility_not_authorized',
      certifiedAgainstActiveSlice: false,
      blockers: ['active_slice_before_caller'], safe: false,
    });
  }

  // Authorized historical branch. This consumer is a passenger — but the branch is only declared
  // sound after the SAME path set is certified against its own active slice.
  const self = evaluateStudioBranchScope(changedPaths, { callerSliceId: activeSlice.sliceId });
  const common = {
    ...base,
    activeSliceId: activeSlice.sliceId,
    activeSliceOrdinal: activeSlice.sliceOrdinal,
    evaluatedAsSliceId: activeSlice.sliceId,
    activeCandidates: [...self.activeCandidates],
    total: self.total,
    forbidden: [...self.forbidden],
    unknown: [...self.unknown],
    chronologicalViolation: [...self.chronologicalViolation],
    certifiedAgainstActiveSlice: true,
    consumerApplicable: false,
    applicable: false,
  };
  if (!self.safe) {
    return Object.freeze({
      ...common, notApplicable: false, reason: 'active_slice_scope_invalid',
      blockers: [...self.blockers], safe: false,
    });
  }
  return Object.freeze({
    ...common,
    allowed: [...self.allowed],
    crossAuthorized: [...self.crossAuthorized],
    explicitForbiddenAuthorized: [...self.explicitForbiddenAuthorized],
    notApplicable: true, reason: 'consumer_slice_after_active_slice',
    blockers: [], safe: true,
  });
}

// ---------------------------------------------------------------------------
// Resolved-active-slice path authorizer — the ONLY historical-exemption source
// ---------------------------------------------------------------------------

/**
 * Builds the single authorizer that historical substring checks use to drop false positives.
 *
 * It takes the COMPLETE changed-path set, resolves exactly one active slice from the catalog's
 * narrow branch markers, and authorizes a path only when that exact active slice is authorized
 * for that exact path. There is no slice-id prefix, no injectable "expected slice" that could
 * widen it, no chronology-free catalog lookup, and no hardcoded slice.
 *
 * It authorizes NOTHING when the diff is empty, when the active slice is unresolved, or when it
 * is ambiguous — a historical check whose regex does not fire is unaffected either way, and one
 * whose regex does fire keeps failing exactly as it did before the Studio catalog existed.
 *
 * This API never certifies a branch. Certification belongs to `evaluateStudioBranchDiffScope`.
 *
 * Pure: no command, no filesystem, no env, no network, no clock, no mutation.
 *
 * @param {string[]} changedPaths the COMPLETE changed-path set
 * @returns {{kind:string, ok:boolean, activeSliceId:string|null, activeSliceOrdinal:number|null,
 *            reason:string|null, isAuthorized:(path:string)=>boolean}}
 */
export function createResolvedActiveStudioSlicePathAuthorizer(changedPaths) {
  const inputValid = Array.isArray(changedPaths) && changedPaths.every(isPath);
  const deny = (reason) => Object.freeze({
    kind: 'resolved-active-studio-slice-path-authorizer',
    ok: false, activeSliceId: null, activeSliceOrdinal: null, reason,
    isAuthorized: () => false,
  });

  if (!inputValid) return deny('invalid_changed_paths');
  if (changedPaths.length === 0) return deny('empty_branch_diff');

  const active = resolveActiveStudioSlice(changedPaths);
  if (!active.ok) return deny(active.reason);

  const activeSliceId = active.sliceId;
  return Object.freeze({
    kind: 'resolved-active-studio-slice-path-authorizer',
    ok: true,
    activeSliceId,
    activeSliceOrdinal: active.sliceOrdinal,
    reason: null,
    isAuthorized: (path) => isPathAuthorizedForStudioSlice(path, activeSliceId),
  });
}

// ---------------------------------------------------------------------------
// Legacy, chronology-free helpers (kept so unmigrated consumers keep working)
// ---------------------------------------------------------------------------

/** True only when the path is catalogued AND not forbidden. Carries NO chronology —
 * prefer `evaluateStudioBranchScope` with a `callerSliceId`. */
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

/** Returns only the catalogued Studio headless artifacts from a list. */
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
 * OR unknown path (unknown fails by default). Chronology-free — see
 * `evaluateStudioBranchScope` for the caller-aware answer.
 *
 * @param {string[]} paths
 * @param {Object} [options]
 * @returns {Object}
 */
export function createStudioScopeGovernanceReport(paths, options = {}) {
  const list = asArray(paths).filter(isPath);
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
