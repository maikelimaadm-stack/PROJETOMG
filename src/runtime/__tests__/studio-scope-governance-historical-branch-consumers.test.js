import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED,
  CHRONOLOGICAL_MIGRATION_SLICE_ID,
  MAIN_DIFF_CORRECTION_SLICE_ID,
  HISTORICAL_BRANCH_CONSUMERS_SLICE_ID,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, findOwningStudioSlices, resolveActiveStudioSlice,
  classifyStudioScopePath, evaluateStudioBranchScope, evaluateStudioBranchDiffScope,
  evaluateStudioBranchConsumerScope, createResolvedActiveStudioSlicePathAuthorizer,
  isPathAuthorizedForStudioSlice,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const EV_REL = 'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/';
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readEv = (n) => readSrc(`${EV_REL}${n}`);

const CONSUMERS = HISTORICAL_BRANCH_CONSUMERS_SLICE_ID;
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const MAINTENANCE = 'studio-scope-governance-maintenance';
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';

const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

/** A minimal, deterministic diff that resolves THIS slice as the active one. */
const OWN_DIFF = [REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, `${EV_REL}READINESS.md`];

/**
 * The representative diff of PR #495 — the Builder, ordinal 41. Every path is either owned or
 * shared by that slice, so the branch is sound from ITS point of view while every later slice
 * is merely a passenger.
 */
const BUILDER41_FIXTURE = [
  'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
  'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
  'package.json',
];

/**
 * Representative diffs of slices that are MERGED and therefore must NOT be reopenable by any
 * later consumer, no matter how sound their own paths are.
 */
const MERGED24_FIXTURE = [
  'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
  'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/CERTIFICATION-REPORT.md',
  'src/runtime/__tests__/studio-dev-preview-app-integration.test.js',
  'scripts/gates/g423-studio-dev-preview-app-integration.mjs',
];
const MERGED42_FIXTURE = [
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
  'scripts/gates/lib/studioScopeGovernanceRegistry.mjs',
];
const MERGED43_FIXTURE = [
  'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
  'scripts/gates/lib/studioScopeGovernanceGuard.mjs',
];

const BUILDER_GOVERNANCE_INTEGRATION_CROSS = [
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
  'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js',
  'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs',
];
const BUILDER_LIFECYCLE_CROSS = [
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
];

const NINE_TESTS = [
  ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-contract.test.js', 'authoring-runtime-to-preview-bridge-contract'],
  ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js', 'authoring-runtime-to-preview-bridge-implementation-plan'],
  ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js', 'authoring-runtime-to-preview-bridge'],
  ['src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js', 'dev-preview-app-integration-contract'],
  ['src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js', 'dev-preview-app-integration-implementation-plan'],
  ['src/runtime/__tests__/studio-dev-preview-app-integration.test.js', APP_INTEGRATION],
  ['src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js', 'module-blueprint-authoring-foundation-contract'],
  ['src/runtime/__tests__/studio-module-blueprint-authoring-implementation-plan.test.js', 'module-blueprint-authoring-implementation-plan'],
  ['src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js', 'module-blueprint-authoring-runtime'],
];

const TWENTY_TWO_GATES = [
  'g423-studio-foundation-audit', 'g423-studio-module-preview-sandbox-contract',
  'g423-studio-dev-preview-contract-bridge', 'g423-studio-dev-preview-visual-contract',
  'g423-studio-dev-preview-runtime-shell-contract', 'g423-studio-dev-preview-isolated-runtime-implementation-plan',
  'g423-studio-dev-preview-isolated-runtime', 'g423-studio-dev-preview-runtime-ui-contract',
  'g423-studio-dev-preview-runtime-ui-implementation-plan', 'g423-studio-dev-preview-runtime-ui',
  'g423-studio-dev-preview-route-menu-contract', 'g423-studio-dev-preview-route-menu-implementation-plan',
  'g423-studio-dev-preview-route-menu', 'g423-studio-dev-preview-app-integration-contract',
  'g423-studio-dev-preview-app-integration-implementation-plan', 'g423-studio-dev-preview-app-integration',
  'g423-studio-module-blueprint-authoring-foundation-contract', 'g423-studio-module-blueprint-authoring-implementation-plan',
  'g423-studio-module-blueprint-authoring-runtime', 'g423-studio-authoring-runtime-to-preview-bridge-contract',
  'g423-studio-authoring-runtime-to-preview-bridge-implementation-plan', 'g423-studio-authoring-runtime-to-preview-bridge',
].map((g) => `scripts/gates/${g}.mjs`);

const GOVERNANCE_CONSUMERS = [
  'scripts/gates/g423-studio-scope-governance-maintenance.mjs',
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
];

/** Later slices, each of which is a passenger on the AUTHORIZED Builder-41 branch. */
const LATER_CALLERS = [MIGRATION, CORRECTION, CONSUMERS];

const MARKER = {
  24: 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  41: 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md',
  42: 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
  43: 'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
  44: `${EV_REL}READINESS.md`,
};

const changedOnThisBranch = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { return null; }
};
const OWN_SCOPE_CALLER = CONSUMERS;

// ---------------------------------------------------------------------------
// OWN-SCOPE APPLICABILITY
//
// A branch-relative SELF-SCOPE assertion of this slice — "this branch touches no X" — is only a
// true statement when this slice is the one the branch is certifying. Exactly two states are
// accepted, and nothing else:
//
//   A. `consumerApplicable === true` — this slice IS the certifier. Its own-scope assertions run
//      in full, unchanged.
//   B. safely inapplicable — the diff is empty, or it belongs to an EARLIER slice that the catalog
//      explicitly authorizes to carry later consumers AND that re-certified cleanly against
//      itself. The own-scope sentence then describes a branch this slice does not own, so
//      asserting it would assert something false about someone else's work.
//
// EVERY other state fails: unknown caller, invalid input, unresolved or ambiguous active slice,
// `historical_branch_consumer_compatibility_not_authorized`, `active_slice_scope_invalid`, or
// `safe === false`. A bare `if (scope.notApplicable) return;` is deliberately NOT used.
//
// Universal checks — forbidden, unknown, chronological violation, safety, active resolution,
// core non-regression — never depend on this and run in every state.
// ---------------------------------------------------------------------------
const ownScopeApplicability = (paths) => {
  const scope = evaluateStudioBranchConsumerScope(paths, { callerSliceId: OWN_SCOPE_CALLER });
  const safelyInapplicable = scope.safe === true && scope.notApplicable === true
    && (scope.reason === 'empty_branch_diff'
      || (scope.reason === 'consumer_slice_after_active_slice'
        && scope.certifiedAgainstActiveSlice === true
        && scope.evaluatedAsSliceId === scope.activeSliceId));
  return { scope, runOwnScope: scope.consumerApplicable === true, safelyInapplicable };
};

/**
 * Returns true when the caller must run its own-scope assertions. When it returns false the
 * inapplicability is RECORDED, never silently swallowed: the branch is proven to have been
 * certified against its own active slice, and no safety list is allowed to be non-empty.
 */
const ownScopeApplies = (paths) => {
  const a = ownScopeApplicability(paths);
  assert.ok(a.runOwnScope || a.safelyInapplicable,
    `own-scope assertion needs a valid consumer state: reason=${a.scope.reason} safe=${a.scope.safe} notApplicable=${a.scope.notApplicable}`);
  if (a.runOwnScope) return true;
  assert.equal(a.scope.notApplicable, true);
  assert.equal(a.scope.safe, true);
  if (a.scope.reason === 'consumer_slice_after_active_slice') {
    assert.equal(a.scope.certifiedAgainstActiveSlice, true);
    assert.equal(a.scope.evaluatedAsSliceId, a.scope.activeSliceId);
    assert.ok(a.scope.activeSliceOrdinal < a.scope.consumerSliceOrdinal);
  } else {
    assert.equal(a.scope.reason, 'empty_branch_diff');
    assert.equal(a.scope.activeSliceId, null);
  }
  assert.deepEqual(a.scope.forbidden, []);
  assert.deepEqual(a.scope.unknown, []);
  assert.deepEqual(a.scope.chronologicalViolation, []);
  return false;
};


// ===========================================================================
// R — registry after this slice
// ===========================================================================
test('R001 the catalog has forty-four slices', () => assert.equal(STUDIO_SLICE_CATALOG.length, 44));
test('R002 slice ids stay unique', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});
test('R003 ordinals are unique, positive integers', () => {
  const o = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal);
  assert.equal(new Set(o).size, o.length);
  assert.ok(o.every((x) => Number.isInteger(x) && x > 0));
});
test('R004 ordinals are contiguous 1..44', () => {
  const o = [...STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal)].sort((a, b) => a - b);
  assert.deepEqual(o, Array.from({ length: 44 }, (_, i) => i + 1));
});
test('R005 this slice is ordinal 44 and active', () => {
  const s = getStudioSliceById(CONSUMERS);
  assert.equal(s.sliceOrdinal, 44);
  assert.equal(s.status, 'active_slice');
});
test('R006 exactly one slice carries status active_slice', () => {
  assert.deepEqual(STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').map((s) => s.sliceId), [CONSUMERS]);
});
test('R007 the previous governance slice is now merged', () => {
  assert.equal(getStudioSliceById(CORRECTION).status, 'merged');
});
test('R008 this slice is after every other governance slice', () => {
  for (const id of [MAINTENANCE, MIGRATION, CORRECTION]) {
    assert.ok(getStudioSliceById(CONSUMERS).sliceOrdinal > getStudioSliceById(id).sliceOrdinal, id);
  }
});
test('R009 the Builder keeps ordinal 41', () => assert.equal(getStudioSliceById(BUILDER).sliceOrdinal, 41));
test('R010 the Builder keeps status open_pull_request_495', () => {
  assert.equal(getStudioSliceById(BUILDER).status, 'open_pull_request_495');
});
test('R011 the Builder entry shape is untouched', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.primaryArtifactPatterns.length, 4);
  assert.equal(b.crossSliceAuthorizedPatterns.length, 8);
  assert.deepEqual(b.explicitlyAuthorizedForbiddenPatterns, []);
});
test('R011b the Builder cross list is exactly 2 lifecycle + 6 governance integration paths', () => {
  const b = getStudioSliceById(BUILDER);
  const expected = [...BUILDER_LIFECYCLE_CROSS, ...BUILDER_GOVERNANCE_INTEGRATION_CROSS];
  assert.equal(expected.length, 8);
  assert.equal(b.crossSliceAuthorizedPatterns.length, 8);
  assert.equal(new Set(b.crossSliceAuthorizedPatterns.map((r) => r.source)).size, 8);
  for (const path of expected) {
    assert.ok(b.crossSliceAuthorizedPatterns.some((r) => r.test(path)), path);
  }
});
test('R011c the Builder cross list stays exact: anchored, no wildcard, no evidence, no guard', () => {
  for (const r of getStudioSliceById(BUILDER).crossSliceAuthorizedPatterns) {
    assert.ok(r.source.startsWith('^'), r.source);
    assert.ok(r.source.endsWith('$'), r.source);
    assert.equal(/docs\\\/evidence/.test(r.source), false, r.source);
    assert.equal(/studioScopeGovernanceGuard/.test(r.source), false, r.source);
    assert.equal(/package/.test(r.source), false, r.source);
    assert.equal(/^\^?\.[*+]/.test(r.source), false, r.source);
  }
});
test('R011d the Builder cross list authorizes those eight and refuses everything adjacent', () => {
  const b = BUILDER;
  for (const p of [...BUILDER_LIFECYCLE_CROSS, ...BUILDER_GOVERNANCE_INTEGRATION_CROSS]) {
    assert.equal(isPathAuthorizedForStudioSlice(p, b), true, p);
  }
  for (const p of [
    // a seventh governance artifact that is NOT listed
    'src/runtime/__tests__/studio-scope-governance-maintenance.test.js',
    'scripts/gates/g423-studio-scope-governance-maintenance.mjs',
    // neighbours with a different suffix
    'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.mjs',
    'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.test.js',
    'scripts/gates/g423-studio-scope-governance-main-diff-correction-extra.mjs',
    // evidence of a governance slice
    'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
    // the central guard is shared by governance slices, never cross-authorized here
    'scripts/gates/lib/studioScopeGovernanceGuard.mjs',
  ]) {
    assert.equal(isPathAuthorizedForStudioSlice(p, b), false, p);
  }
});
test('R011e the extension changes no classification and no election', () => {
  for (const p of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js']) {
    assert.equal(classifyStudioScopePath(p), 'forbidden_scope', p);
    assert.equal(isPathAuthorizedForStudioSlice(p, BUILDER), false, p);
  }
  assert.equal(classifyStudioScopePath('docs/nobody/x.md'), 'unknown_scope');
  // A cross-authorized governance file never elects a slice.
  for (const p of BUILDER_GOVERNANCE_INTEGRATION_CROSS) {
    assert.equal(resolveActiveStudioSlice([p]).candidates.length, 0, p);
  }
  // Two markers stay ambiguous.
  const amb = resolveActiveStudioSlice([MARKER[41], MARKER[44]]);
  assert.equal(amb.ok, false);
  assert.equal(amb.reason, 'ambiguous_active_slice');
  // The compatibility flag is untouched by the extension.
  assert.equal(getStudioSliceById(BUILDER).historicalBranchConsumerCompatibility, true);
});
test('R012 this slice primary is exactly three anchored patterns', () => {
  assert.deepEqual(getStudioSliceById(CONSUMERS).primaryArtifactPatterns.map((r) => r.source), [
    '^src\\/runtime\\/__tests__\\/studio-scope-governance-historical-branch-consumers\\.test\\.js$',
    '^scripts\\/gates\\/g423-studio-scope-governance-historical-branch-consumers\\.mjs$',
    '^docs\\/evidence\\/post-foundation-c-studio-scope-governance-historical-branch-consumers\\/',
  ]);
});
test('R013 this slice branch marker is exactly the evidence directory', () => {
  assert.deepEqual(getStudioSliceById(CONSUMERS).branchMarkerPatterns.map((r) => r.source),
    ['^docs\\/evidence\\/post-foundation-c-studio-scope-governance-historical-branch-consumers\\/']);
});
test('R014 this slice markers are a subset of its primary set', () => {
  const s = getStudioSliceById(CONSUMERS);
  for (const m of s.branchMarkerPatterns) {
    assert.ok(s.primaryArtifactPatterns.some((p) => p.source === m.source), m.source);
  }
});
test('R015 this slice shared set is exactly registry, guard and the two manifests', () => {
  assert.deepEqual(getStudioSliceById(CONSUMERS).sharedGovernancePatterns.map((r) => r.source), [
    '^scripts\\/gates\\/lib\\/studioScopeGovernanceRegistry\\.mjs$',
    '^scripts\\/gates\\/lib\\/studioScopeGovernanceGuard\\.mjs$',
    '^package\\.json$',
    '^package-lock\\.json$',
  ]);
});
test('R016 this slice declares no explicitly authorized forbidden path', () => {
  assert.deepEqual(getStudioSliceById(CONSUMERS).explicitlyAuthorizedForbiddenPatterns, []);
});
test('R017 the cross list is exactly thirty-six unique patterns', () => {
  const src = getStudioSliceById(CONSUMERS).crossSliceAuthorizedPatterns.map((r) => r.source);
  assert.equal(src.length, 36);
  assert.equal(new Set(src).size, 36);
});
test('R018 the cross list is exactly the migrated consumer set', () => {
  const declared = getStudioSliceById(CONSUMERS).crossSliceAuthorizedPatterns;
  const expected = [...new Set([...NINE_TESTS.map(([p]) => p), ...TWENTY_TWO_GATES, ...GOVERNANCE_CONSUMERS])];
  assert.equal(expected.length, 36);
  for (const p of expected) assert.ok(declared.some((r) => r.test(p)), p);
});
test('R019 the cross list carries no evidence path', () => {
  for (const r of getStudioSliceById(CONSUMERS).crossSliceAuthorizedPatterns) {
    assert.equal(/docs\\\/evidence/.test(r.source), false, r.source);
  }
});
test('R020 the cross list carries no Builder path', () => {
  const s = getStudioSliceById(CONSUMERS);
  for (const p of BUILDER41_FIXTURE.filter((x) => x !== 'package.json')) {
    assert.equal(s.crossSliceAuthorizedPatterns.some((r) => r.test(p)), false, p);
  }
});
test('R021 the cross list carries no test/gate directory wildcard', () => {
  for (const r of getStudioSliceById(CONSUMERS).crossSliceAuthorizedPatterns) {
    assert.notEqual(r.source, '^src\\/runtime\\/__tests__\\/');
    assert.notEqual(r.source, '^scripts\\/gates\\/');
  }
});
test('R022 no two slices own the same primary pattern', () => {
  const seen = new Map();
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const p of s.primaryArtifactPatterns) {
      assert.equal(seen.has(p.source), false, `${p.source} owned by ${seen.get(p.source)} and ${s.sliceId}`);
      seen.set(p.source, s.sliceId);
    }
  }
});
test('R023 every catalogued pattern is anchored', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns',
      'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']) {
      for (const p of s[k]) assert.ok(p.source.startsWith('^'), `${s.sliceId} ${k} ${p.source}`);
    }
  }
});
test('R024 no catalogued pattern is a broad wildcard', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) {
      for (const p of s[k]) assert.equal(/^\^?\.[*+]/.test(p.source), false, `${s.sliceId} ${p.source}`);
    }
  }
});
test('R025 the catalog and every entry stay frozen', () => {
  assert.ok(Object.isFrozen(STUDIO_SLICE_CATALOG));
  for (const s of STUDIO_SLICE_CATALOG) assert.ok(Object.isFrozen(s), s.sliceId);
});
test('R026 every entry declares the same ten keys', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.deepEqual(Object.keys(s).sort(), [
      'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'explicitlyAuthorizedForbiddenPatterns',
      'historicalBranchConsumerCompatibility', 'primaryArtifactPatterns', 'sharedGovernancePatterns',
      'sliceId', 'sliceOrdinal', 'status', 'title',
    ], s.sliceId);
  }
});
test('R027 this slice scope never reaches production or the Builder', () => {
  const s = getStudioSliceById(CONSUMERS);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  for (const p of ['src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs', 'src/modules/x.js',
    'backend/server.js', 'src/pages/x.jsx', 'src/components/x.jsx',
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js']) {
    assert.equal(all.some((r) => r.test(p)), false, p);
  }
});
test('R028 this slice scope never reaches a pre-Studio gate', () => {
  for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
    assert.equal(isPathAuthorizedForStudioSlice(g, CONSUMERS), false, g);
  }
});
for (const [p] of NINE_TESTS) {
  test(`R029 this slice is authorized for the migrated test ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CONSUMERS), true, p);
  });
}
for (const p of TWENTY_TWO_GATES) {
  test(`R030 this slice is authorized for the migrated gate ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CONSUMERS), true, p);
  });
}
for (const p of GOVERNANCE_CONSUMERS) {
  test(`R031 this slice is authorized for the governance consumer ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CONSUMERS), true, p);
  });
}

// ---------------------------------------------------------------------------
// R032..R040 — the catalog-bound historical compatibility authorization
// ---------------------------------------------------------------------------
test('R032 every entry declares historicalBranchConsumerCompatibility', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.ok(Object.prototype.hasOwnProperty.call(s, 'historicalBranchConsumerCompatibility'), s.sliceId);
  }
});
test('R033 the authorization is always a boolean, never truthy-by-accident', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.equal(typeof s.historicalBranchConsumerCompatibility, 'boolean', s.sliceId);
  }
});
test('R034 exactly one slice carries the authorization', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility).length, 1);
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => !s.historicalBranchConsumerCompatibility).length, 43);
});
test('R035 the authorized slice is the Builder of PR #495', () => {
  const authorized = STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility);
  assert.deepEqual(authorized.map((s) => s.sliceId), [BUILDER]);
  assert.equal(authorized[0].sliceOrdinal, 41);
  assert.equal(authorized[0].status, 'open_pull_request_495');
});
test('R036 no merged slice is authorized', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.status === 'merged') assert.equal(s.historicalBranchConsumerCompatibility, false, s.sliceId);
  }
});
test('R037 the three governance slices and this one are not authorized', () => {
  for (const id of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, APP_INTEGRATION]) {
    assert.equal(getStudioSliceById(id).historicalBranchConsumerCompatibility, false, id);
  }
});
test('R038 the authorization is not inferable from the ordinal', () => {
  const byOrdinal = STUDIO_SLICE_CATALOG.filter((s) => s.sliceOrdinal < 44);
  assert.ok(byOrdinal.length > 1);
  assert.notEqual(byOrdinal.every((s) => s.historicalBranchConsumerCompatibility), true);
});
test('R039 the authorization is not inferable from the status', () => {
  const open = STUDIO_SLICE_CATALOG.filter((s) => s.status !== 'merged');
  assert.ok(open.length >= 2, JSON.stringify(open.map((s) => s.sliceId)));
  assert.equal(open.filter((s) => s.historicalBranchConsumerCompatibility).length, 1);
});
test('R040 the Builder entry is otherwise untouched', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.sliceOrdinal, 41);
  assert.equal(b.status, 'open_pull_request_495');
  assert.equal(b.primaryArtifactPatterns.length, 4);
  assert.equal(b.crossSliceAuthorizedPatterns.length, 8);
  assert.deepEqual(b.explicitlyAuthorizedForbiddenPatterns, []);
  assert.equal(b.historicalBranchConsumerCompatibility, true);
});

// ===========================================================================
// K — the existing core APIs are untouched
// ===========================================================================
test('K001 resolveActiveStudioSlice([]) still fails closed', () => {
  const r = resolveActiveStudioSlice([]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
});
test('K002 evaluateStudioBranchScope([]) still fails closed', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: CONSUMERS });
  assert.equal(r.safe, false);
  assert.deepEqual(r.blockers, ['no_active_slice_resolved']);
});
test('K003 evaluateStudioBranchDiffScope([]) is still notApplicable and safe', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: CONSUMERS });
  assert.equal(r.notApplicable, true);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.safe, true);
});
for (const caller of LATER_CALLERS) {
  test(`K004 the branch-diff boundary still FAILS a Builder branch for caller ${caller}`, () => {
    const r = evaluateStudioBranchDiffScope(BUILDER41_FIXTURE, { callerSliceId: caller });
    assert.equal(r.safe, false, JSON.stringify(r.blockers));
    assert.ok(r.blockers.includes('active_slice_before_caller'));
    assert.equal(r.applicable, true);
  });
}
for (const caller of LATER_CALLERS) {
  test(`K004b the branch-diff boundary still FAILS a MERGED slice-24 branch for caller ${caller}`, () => {
    const r = evaluateStudioBranchDiffScope(MERGED24_FIXTURE, { callerSliceId: caller });
    assert.equal(r.safe, false, JSON.stringify(r.blockers));
    assert.ok(r.blockers.includes('active_slice_before_caller'));
  });
}
test('K005 the branch-diff boundary still PASSES a Builder branch for the Builder itself', () => {
  const r = evaluateStudioBranchDiffScope(BUILDER41_FIXTURE, { callerSliceId: BUILDER });
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
test('K006 no existing API grew a permissive option', () => {
  const src = readSrc(GUARD_REL);
  for (const token of ['allowHistorical', 'ignoreChronology', 'skipChronology', 'permissive']) {
    assert.equal(src.includes(token), false, token);
  }
});
test('K007 active_slice_before_caller still exists in the core', () => {
  assert.match(readSrc(GUARD_REL), /active_slice_before_caller/);
});
test('K008 the guard still reads no branch name, clock, env, network or GitHub', () => {
  const src = readSrc(GUARD_REL);
  for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
    assert.equal(src.includes(api), false, api);
  }
});
test('K009 the guard still imports only the registry', () => {
  const imports = [...readSrc(GUARD_REL).matchAll(/^import [^;]*from '([^']+)';/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(imports)], ['./studioScopeGovernanceRegistry.mjs']);
});
test('K010 the consumer boundary never decides by status', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  const fn = body.slice(0, body.indexOf('\n}\n') + 3);
  assert.equal(/\.status/.test(fn), false, fn);
});
test('K011 forbidden still fails closed in the core', () => {
  const r = evaluateStudioBranchScope([...OWN_DIFF, 'src/modules/x.js'], { callerSliceId: CONSUMERS });
  assert.deepEqual(r.forbidden, ['src/modules/x.js']);
  assert.equal(r.safe, false);
});
test('K012 unknown still fails closed in the core', () => {
  const r = evaluateStudioBranchScope([...OWN_DIFF, 'docs/nobody/x.md'], { callerSliceId: CONSUMERS });
  assert.deepEqual(r.unknown, ['docs/nobody/x.md']);
  assert.equal(r.safe, false);
});
test('K013 ambiguous still fails closed in the core', () => {
  const r = evaluateStudioBranchScope([MARKER[41], MARKER[44]], { callerSliceId: CONSUMERS });
  assert.ok(r.blockers.includes('ambiguous_active_slice'));
  assert.equal(r.safe, false);
});
test('K014 explicit forbidden stays catalog-bound', () => {
  const r = evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
    MARKER[24], 'src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs',
  ], { callerSliceId: APP_INTEGRATION });
  assert.equal(r.safe, true);
  assert.equal(r.explicitForbiddenAuthorized.length, 2);
});
test('K015 cross authorization is still not inherited', () => {
  const r = evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/a.js',
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
  ], { callerSliceId: APP_INTEGRATION });
  assert.equal(r.chronologicalViolation.length, 1);
  assert.equal(r.safe, false);
});

// ===========================================================================
// C — the consumer applicability boundary
// ===========================================================================
test('C001 empty diff with a known caller is not applicable and safe', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: CONSUMERS });
  assert.equal(r.consumerApplicable, false);
  assert.equal(r.applicable, false);
  assert.equal(r.notApplicable, true);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.safe, true);
});
test('C002 empty diff authorizes nothing', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: CONSUMERS });
  assert.deepEqual(r.allowed, []);
  assert.deepEqual(r.crossAuthorized, []);
  assert.deepEqual(r.explicitForbiddenAuthorized, []);
  assert.equal(r.total, 0);
  assert.equal(r.activeSliceId, null);
  assert.equal(r.certifiedAgainstActiveSlice, false);
  assert.deepEqual(r.blockers, []);
});
test('C003 empty diff still names the consumer exactly', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: MIGRATION });
  assert.equal(r.consumerSliceId, MIGRATION);
  assert.equal(r.consumerSliceOrdinal, getStudioSliceById(MIGRATION).sliceOrdinal);
});
for (const [label, bad] of [
  ['null', null], ['undefined', undefined], ['string', 'x'], ['object', {}],
  ['number item', [1]], ['empty string item', ['']], ['mixed items', ['a', 2]], ['nested array', [[]]],
]) {
  test(`C004 invalid input fails closed and is never treated as empty: ${label}`, () => {
    const r = evaluateStudioBranchConsumerScope(bad, { callerSliceId: CONSUMERS });
    assert.equal(r.safe, false);
    assert.equal(r.notApplicable, false);
    assert.equal(r.reason, 'invalid_changed_paths');
    assert.ok(r.blockers.includes('invalid_changed_paths'));
  });
}
test('C005 unknown caller fails closed with an empty diff', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: 'nope' });
  assert.equal(r.safe, false);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, 'unknown_caller_slice');
  assert.deepEqual(r.blockers, ['unknown_caller_slice']);
});
test('C006 unknown caller fails closed with a real diff', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: 'nope' });
  assert.equal(r.safe, false);
  assert.equal(r.reason, 'unknown_caller_slice');
});
test('C007 a missing caller option fails closed', () => {
  assert.equal(evaluateStudioBranchConsumerScope(OWN_DIFF, {}).safe, false);
});
test('C008 invalid input plus unknown caller reports both blockers', () => {
  const r = evaluateStudioBranchConsumerScope(null, { callerSliceId: 'nope' });
  assert.deepEqual(r.blockers, ['invalid_changed_paths', 'unknown_caller_slice']);
});
test('C009 an unresolved active slice fails closed', () => {
  const r = evaluateStudioBranchConsumerScope(['package.json'], { callerSliceId: CONSUMERS });
  assert.equal(r.safe, false);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
  assert.equal(r.consumerApplicable, false);
});
test('C010 an ambiguous active slice fails closed', () => {
  const r = evaluateStudioBranchConsumerScope([MARKER[41], MARKER[44]], { callerSliceId: CONSUMERS });
  assert.equal(r.safe, false);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.equal(r.activeCandidates.length, 2);
});
test('C011 an ambiguous active slice is never resolved by ordinal', () => {
  const r = evaluateStudioBranchConsumerScope([MARKER[24], MARKER[44]], { callerSliceId: CONSUMERS });
  assert.equal(r.activeSliceId, null);
  assert.equal(r.safe, false);
});
test('C012 active equal to the caller is applicable and delegates', () => {
  const r = evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: CONSUMERS });
  const inner = evaluateStudioBranchDiffScope(OWN_DIFF, { callerSliceId: CONSUMERS });
  assert.equal(r.consumerApplicable, true);
  assert.equal(r.applicable, true);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, null);
  assert.equal(r.certifiedAgainstActiveSlice, false);
  assert.equal(r.evaluatedAsSliceId, CONSUMERS);
  assert.deepEqual(r.allowed, inner.allowed);
  assert.deepEqual(r.blockers, inner.blockers);
  assert.equal(r.safe, inner.safe);
});
test('C013 active later than the caller is applicable and delegates', () => {
  const r = evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: APP_INTEGRATION });
  assert.equal(r.consumerApplicable, true);
  assert.equal(r.safe, true);
  assert.ok(r.activeSliceOrdinal > r.consumerSliceOrdinal);
});
test('C014 a later consumer on an AUTHORIZED earlier branch is inapplicable, not failing', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  assert.equal(r.consumerApplicable, false);
  assert.equal(r.applicable, false);
  assert.equal(r.notApplicable, true);
  assert.equal(r.reason, 'consumer_slice_after_active_slice');
  assert.equal(r.safe, true);
});
test('C015 the inapplicable case is certified against the active slice', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  assert.equal(r.certifiedAgainstActiveSlice, true);
  assert.equal(r.evaluatedAsSliceId, BUILDER);
  assert.equal(r.activeSliceId, BUILDER);
  assert.equal(r.activeSliceOrdinal, 41);
});
test('C016 the inapplicable case preserves the consumer identity', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  assert.equal(r.consumerSliceId, CORRECTION);
  assert.equal(r.consumerSliceOrdinal, getStudioSliceById(CORRECTION).sliceOrdinal);
  assert.ok(r.activeSliceOrdinal < r.consumerSliceOrdinal);
});
test('C017 the inapplicable case reports the active slice self-evaluation', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  const self = evaluateStudioBranchScope(BUILDER41_FIXTURE, { callerSliceId: BUILDER });
  assert.deepEqual(r.allowed, self.allowed);
  assert.deepEqual(r.crossAuthorized, self.crossAuthorized);
  assert.deepEqual(r.explicitForbiddenAuthorized, self.explicitForbiddenAuthorized);
  assert.equal(r.total, self.total);
});
for (const bad of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js',
  'scripts/gates/lib/productionUiGuard.mjs', 'prisma/schema.prisma']) {
  test(`C018 a later consumer never masks a forbidden path: ${bad}`, () => {
    const r = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, bad], { callerSliceId: CORRECTION });
    assert.equal(r.safe, false, bad);
    assert.equal(r.notApplicable, false);
    assert.equal(r.reason, 'active_slice_scope_invalid');
    assert.equal(r.certifiedAgainstActiveSlice, true);
    assert.ok(r.forbidden.includes(bad), JSON.stringify(r.forbidden));
    assert.ok(r.blockers.includes('forbidden_scope'));
  });
}
test('C019 a later consumer never masks an unknown path', () => {
  const r = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, 'docs/nobody/x.md'], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.equal(r.reason, 'active_slice_scope_invalid');
  assert.ok(r.unknown.includes('docs/nobody/x.md'));
});
test('C020 a later consumer never masks a foreign catalogued path', () => {
  const foreign = 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js';
  const r = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, foreign], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.equal(r.reason, 'active_slice_scope_invalid');
  assert.ok(r.chronologicalViolation.includes(foreign));
});
test('C021 a later consumer never masks a second marker', () => {
  const r = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, MARKER[24]], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.equal(r.notApplicable, false);
});
test('C022 a later consumer never masks an unresolved active slice', () => {
  const r = evaluateStudioBranchConsumerScope(['package.json', 'package-lock.json'], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
});
test('C023 the report kind is stable', () => {
  for (const paths of [[], OWN_DIFF, BUILDER41_FIXTURE]) {
    assert.equal(evaluateStudioBranchConsumerScope(paths, { callerSliceId: CORRECTION }).kind,
      'studio-branch-consumer-scope-evaluation');
  }
});
test('C024 the report is frozen', () => {
  for (const paths of [[], OWN_DIFF, BUILDER41_FIXTURE, null]) {
    assert.ok(Object.isFrozen(evaluateStudioBranchConsumerScope(paths, { callerSliceId: CORRECTION })));
  }
});
test('C025 the report declares no side effect', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  assert.equal(r.sideEffects, false);
  assert.equal(r.backendAccessed, false);
  assert.equal(r.prismaAccessed, false);
  assert.equal(r.fetchUsed, false);
  assert.equal(r.mutationAllowed, false);
});
test('C026 the report carries every mandated field', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  for (const k of ['kind', 'consumerSliceId', 'consumerSliceOrdinal', 'activeSliceId', 'activeSliceOrdinal',
    'evaluatedAsSliceId', 'consumerApplicable', 'applicable', 'notApplicable', 'reason',
    'certifiedAgainstActiveSlice', 'total', 'allowed', 'forbidden', 'unknown', 'chronologicalViolation',
    'crossAuthorized', 'explicitForbiddenAuthorized', 'blockers', 'safe',
    'sideEffects', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'mutationAllowed']) {
    assert.ok(Object.prototype.hasOwnProperty.call(r, k), k);
  }
});
test('C027 the boundary never mutates its input', () => {
  const input = [...BUILDER41_FIXTURE];
  evaluateStudioBranchConsumerScope(input, { callerSliceId: CORRECTION });
  assert.deepEqual(input, BUILDER41_FIXTURE);
});
test('C028 the boundary is order independent', () => {
  const a = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  const b = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE].reverse(), { callerSliceId: CORRECTION });
  assert.deepEqual(a.allowed, b.allowed);
  assert.equal(a.safe, b.safe);
  assert.equal(a.reason, b.reason);
});
test('C029 the boundary is deterministic across repeated calls', () => {
  const a = JSON.stringify(evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION }));
  const b = JSON.stringify(evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION }));
  assert.equal(a, b);
});
test('C030 notApplicable is never true for an invalid or unresolvable state', () => {
  for (const [paths, caller] of [[null, CORRECTION], [['package.json'], CORRECTION],
    [[MARKER[41], MARKER[24]], CORRECTION], [[], 'nope']]) {
    assert.equal(evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller }).notApplicable, false);
  }
});

test('C031 inapplicability requires the catalog authorization, not merely an earlier ordinal', () => {
  const authorized = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CONSUMERS });
  const unauthorized = evaluateStudioBranchConsumerScope(MERGED24_FIXTURE, { callerSliceId: CONSUMERS });
  assert.ok(authorized.activeSliceOrdinal < authorized.consumerSliceOrdinal);
  assert.ok(unauthorized.activeSliceOrdinal < unauthorized.consumerSliceOrdinal);
  assert.equal(authorized.notApplicable, true);
  assert.equal(authorized.safe, true);
  assert.equal(unauthorized.notApplicable, false);
  assert.equal(unauthorized.safe, false);
});
test('C032 the unauthorized state is a distinct, named reason', () => {
  const r = evaluateStudioBranchConsumerScope(MERGED24_FIXTURE, { callerSliceId: CORRECTION });
  assert.equal(r.reason, 'historical_branch_consumer_compatibility_not_authorized');
  assert.notEqual(r.reason, 'consumer_slice_after_active_slice');
  assert.notEqual(r.reason, 'active_slice_scope_invalid');
});

// ===========================================================================
// F — the Builder-41 fixture, one caller at a time
// ===========================================================================
test('F001 the fixture resolves the Builder as the active slice', () => {
  const a = resolveActiveStudioSlice(BUILDER41_FIXTURE);
  assert.equal(a.ok, true);
  assert.equal(a.sliceId, BUILDER);
  assert.equal(a.sliceOrdinal, 41);
  assert.equal(a.candidates.length, 1);
});
test('F002 caller 41 is applicable and safe', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: BUILDER });
  assert.equal(r.consumerApplicable, true);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
  assert.equal(r.allowed.length, BUILDER41_FIXTURE.length);
});
for (const caller of LATER_CALLERS) {
  test(`F003 later caller is inapplicable and safe: ${caller}`, () => {
    const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: caller });
    assert.equal(r.consumerApplicable, false);
    assert.equal(r.notApplicable, true);
    assert.equal(r.reason, 'consumer_slice_after_active_slice');
    assert.equal(r.certifiedAgainstActiveSlice, true);
    assert.equal(r.evaluatedAsSliceId, BUILDER);
    assert.equal(r.safe, true);
  });
  test(`F004 the core still refuses to certify for the same caller: ${caller}`, () => {
    const r = evaluateStudioBranchDiffScope(BUILDER41_FIXTURE, { callerSliceId: caller });
    assert.equal(r.safe, false);
    assert.ok(r.blockers.includes('active_slice_before_caller'));
  });
}
test('F005 the maintenance slice is EARLIER, so it stays the certifier', () => {
  const r = evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: MAINTENANCE });
  assert.equal(r.consumerApplicable, true);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
for (const bad of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js', 'docs/nobody/x.md']) {
  for (const caller of LATER_CALLERS) {
    test(`F006 the fixture plus ${bad} is unsafe even for later caller ${caller}`, () => {
      assert.equal(evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, bad], { callerSliceId: caller }).safe, false);
    });
  }
}
test('F007 the fixture plus a foreign slice path is unsafe for every later caller', () => {
  const foreign = 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js';
  for (const caller of LATER_CALLERS) {
    assert.equal(evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, foreign], { callerSliceId: caller }).safe, false, caller);
  }
});
test('F008 the fixture plus a second marker is unsafe for every later caller', () => {
  for (const caller of LATER_CALLERS) {
    const r = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, MARKER[24]], { callerSliceId: caller });
    assert.equal(r.safe, false, caller);
    assert.equal(r.reason, 'ambiguous_active_slice');
  }
});
test('F009 the fixture is not empty and is not a synthetic worktree', () => {
  assert.ok(BUILDER41_FIXTURE.length >= 5);
  assert.ok(BUILDER41_FIXTURE.every((p) => typeof p === 'string' && p.length > 0));
});

// ===========================================================================
// M — merged earlier slices are NOT reopenable by later consumers
// ===========================================================================
const MERGED_CASES = [
  ['slice 24 dev-preview-app-integration', MERGED24_FIXTURE, APP_INTEGRATION, 24, [MIGRATION, CORRECTION, CONSUMERS]],
  ['slice 42 chronological-migration', MERGED42_FIXTURE, MIGRATION, 42, [CORRECTION, CONSUMERS]],
  ['slice 43 main-diff-correction', MERGED43_FIXTURE, CORRECTION, 43, [CONSUMERS]],
];
for (const [label, fixture, activeId, activeOrdinal, callers] of MERGED_CASES) {
  test(`M001 the fixture resolves exactly ${label}`, () => {
    const a = resolveActiveStudioSlice(fixture);
    assert.equal(a.ok, true, JSON.stringify(a));
    assert.equal(a.sliceId, activeId);
    assert.equal(a.sliceOrdinal, activeOrdinal);
    assert.equal(a.candidates.length, 1);
  });
  test(`M002 the fixture is sound for its OWN slice: ${label}`, () => {
    const r = evaluateStudioBranchConsumerScope(fixture, { callerSliceId: activeId });
    assert.equal(r.consumerApplicable, true);
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
  for (const caller of callers) {
    test(`M003 ${label} is fail-closed for later caller ${caller}`, () => {
      const r = evaluateStudioBranchConsumerScope(fixture, { callerSliceId: caller });
      assert.equal(r.activeSliceId, activeId);
      assert.equal(r.activeSliceOrdinal, activeOrdinal);
      assert.equal(r.consumerApplicable, false);
      assert.equal(r.applicable, false);
      assert.equal(r.notApplicable, false);
      assert.equal(r.reason, 'historical_branch_consumer_compatibility_not_authorized');
      assert.equal(r.certifiedAgainstActiveSlice, false);
      assert.equal(r.evaluatedAsSliceId, null);
      assert.ok(r.blockers.includes('active_slice_before_caller'), JSON.stringify(r.blockers));
      assert.equal(r.safe, false);
    });
    test(`M004 ${label} authorizes nothing for later caller ${caller}`, () => {
      const r = evaluateStudioBranchConsumerScope(fixture, { callerSliceId: caller });
      assert.deepEqual(r.allowed, []);
      assert.deepEqual(r.crossAuthorized, []);
      assert.deepEqual(r.explicitForbiddenAuthorized, []);
      assert.equal(r.total, 0);
    });
    test(`M005 ${label} keeps the consumer identity for caller ${caller}`, () => {
      const r = evaluateStudioBranchConsumerScope(fixture, { callerSliceId: caller });
      assert.equal(r.consumerSliceId, caller);
      assert.equal(r.consumerSliceOrdinal, getStudioSliceById(caller).sliceOrdinal);
      assert.ok(r.activeSliceOrdinal < r.consumerSliceOrdinal);
    });
  }
}
test('M006 the unauthorized refusal matches the core verdict exactly', () => {
  for (const [, fixture, , , callers] of MERGED_CASES) {
    for (const caller of callers) {
      const wrapper = evaluateStudioBranchConsumerScope(fixture, { callerSliceId: caller });
      const core = evaluateStudioBranchDiffScope(fixture, { callerSliceId: caller });
      assert.equal(core.safe, false);
      assert.equal(wrapper.safe, false);
      assert.ok(core.blockers.includes('active_slice_before_caller'));
      assert.ok(wrapper.blockers.includes('active_slice_before_caller'));
    }
  }
});
test('M007 no self-certification is attempted when the authorization is absent', () => {
  const r = evaluateStudioBranchConsumerScope(MERGED24_FIXTURE, { callerSliceId: CONSUMERS });
  assert.equal(r.certifiedAgainstActiveSlice, false);
  assert.equal(r.evaluatedAsSliceId, null);
});
test('M008 authorization alone never rescues a bad path on the authorized branch', () => {
  for (const bad of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js', 'docs/nobody/x.md']) {
    const r = evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, bad], { callerSliceId: CONSUMERS });
    assert.equal(r.safe, false, bad);
    assert.equal(r.certifiedAgainstActiveSlice, true, bad);
  }
});
test('M009 the guard reads the authorization only from the active slice entry', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  const fn = body.slice(0, body.indexOf('\n}\n') + 3);
  assert.match(fn, /activeSlice\.historicalBranchConsumerCompatibility !== true/);
  assert.equal(/consumer\.historicalBranchConsumerCompatibility/.test(fn), false);
  assert.equal(/o\.historicalBranchConsumerCompatibility/.test(fn), false);
});
test('M010 the guard hardcodes no slice id, ordinal, status or PR number', () => {
  const src = readSrc(GUARD_REL);
  for (const token of ['bridge-decision-core-envelope-builder', 'open_pull_request', '495',
    'sliceOrdinal === 41', 'sliceOrdinal == 41']) {
    assert.equal(src.includes(token), false, token);
  }
});
test('M011 no caller-supplied option can grant the authorization', () => {
  for (const opt of [{ historicalBranchConsumerCompatibility: true }, { allowHistorical: true },
    { ignoreChronology: true }, { expectedActiveSlice: APP_INTEGRATION }]) {
    const r = evaluateStudioBranchConsumerScope(MERGED24_FIXTURE, { callerSliceId: CONSUMERS, ...opt });
    assert.equal(r.safe, false, JSON.stringify(opt));
    assert.equal(r.reason, 'historical_branch_consumer_compatibility_not_authorized', JSON.stringify(opt));
  }
});
test('M012 the unauthorized report is frozen and side-effect free', () => {
  const r = evaluateStudioBranchConsumerScope(MERGED24_FIXTURE, { callerSliceId: CONSUMERS });
  assert.ok(Object.isFrozen(r));
  assert.equal(r.kind, 'studio-branch-consumer-scope-evaluation');
  assert.equal(r.sideEffects, false);
  assert.equal(r.mutationAllowed, false);
});
test('M013 the unauthorized branch is deterministic and order independent', () => {
  const a = evaluateStudioBranchConsumerScope(MERGED24_FIXTURE, { callerSliceId: CONSUMERS });
  const b = evaluateStudioBranchConsumerScope([...MERGED24_FIXTURE].reverse(), { callerSliceId: CONSUMERS });
  assert.equal(a.reason, b.reason);
  assert.equal(a.safe, b.safe);
  assert.deepEqual(a.blockers, b.blockers);
});

// ===========================================================================
// S — source scans: every consumer really asks about its own applicability
// ===========================================================================
for (const [p, caller] of NINE_TESTS) {
  test(`S001 migrated test uses the consumer boundary: ${path.basename(p)}`, () => {
    const src = readSrc(p);
    assert.ok(src.includes(`const CALLER_SLICE_ID = '${caller}';`), p);
    assert.ok(src.includes('evaluateStudioBranchConsumerScope('), p);
  });
  test(`S002 migrated test no longer calls the certification boundary: ${path.basename(p)}`, () => {
    assert.equal(readSrc(p).includes('evaluateStudioBranchDiffScope('), false, p);
  });
}
for (const p of TWENTY_TWO_GATES) {
  test(`S003 migrated gate uses the consumer boundary: ${path.basename(p)}`, () => {
    const src = readSrc(p);
    assert.ok(src.includes('evaluateStudioBranchConsumerScope('), p);
    assert.ok(/const CALLER_SLICE_ID = '/.test(src), p);
  });
  test(`S004 migrated gate no longer calls the certification boundary: ${path.basename(p)}`, () => {
    assert.equal(readSrc(p).includes('evaluateStudioBranchDiffScope('), false, p);
  });
}
for (const p of GOVERNANCE_CONSUMERS) {
  test(`S005 governance consumer uses the consumer boundary: ${path.basename(p)}`, () => {
    assert.ok(readSrc(p).includes('evaluateStudioBranchConsumerScope('), p);
  });
}
test('S006 the governance test files keep their DIRECT core semantics tests', () => {
  for (const p of ['src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
    'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js']) {
    const src = readSrc(p);
    assert.ok(src.includes('evaluateStudioBranchScope('), p);
    assert.ok(src.includes('evaluateStudioBranchDiffScope('), p);
  }
});
test('S007 the consumer boundary is exported by name', () => {
  assert.match(readSrc(GUARD_REL), /export function evaluateStudioBranchConsumerScope\(/);
});
test('S008 the consumer boundary re-certifies against the active slice', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  const fn = body.slice(0, body.indexOf('\n}\n') + 3);
  assert.match(fn, /evaluateStudioBranchScope\(changedPaths, \{ callerSliceId: activeSlice\.sliceId \}\)/);
});
test('S009 the consumer boundary has no permissive option', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  const head = body.slice(0, body.indexOf('\n'));
  assert.equal(/allowHistorical|ignoreChronology/.test(body.slice(0, body.indexOf('\n}\n'))), false);
  assert.match(head, /\(changedPaths, options = \{\}\)/);
});
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  test(`S010 pre-Studio gate stays outside every boundary: ${path.basename(g)}`, () => {
    const src = readSrc(g);
    assert.equal(src.includes('evaluateStudioBranchScope('), false, g);
    assert.equal(src.includes('evaluateStudioBranchDiffScope('), false, g);
    assert.equal(src.includes('evaluateStudioBranchConsumerScope('), false, g);
  });
}
test('S011 no consumer accepts a bare notApplicable', () => {
  for (const p of [...NINE_TESTS.map(([x]) => x), ...TWENTY_TWO_GATES]) {
    const src = readSrc(p);
    if (!src.includes('notApplicable')) continue;
    assert.ok(src.includes('consumer_slice_after_active_slice') || src.includes('empty_branch_diff'), p);
  }
});

// ===========================================================================
// P — PR #495 is not touched by this slice
// ===========================================================================
test('P001 the Builder subtree is outside this slice scope', () => {
  assert.equal(isPathAuthorizedForStudioSlice('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js', CONSUMERS), false);
});
test('P002 the Builder test, gate and evidence are outside this slice scope', () => {
  for (const p of ['src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
    'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
    'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md']) {
    assert.equal(isPathAuthorizedForStudioSlice(p, CONSUMERS), false, p);
  }
});
test('P003 this branch diff carries no Builder path', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  // OWN-SCOPE: this slice must not reach into PR #495. On the Builder's OWN branch the Builder
  // paths are that branch's subject, not an intrusion by this slice — see ownScopeApplies.
  if (!ownScopeApplies(f)) return;
  for (const p of f) {
    assert.equal(/bridge-decision-core-envelope-builder/.test(p) && !/registry|guard/i.test(p), false, p);
  }
});
test('P003b this slice is never authorized for a Builder path, in any state', () => {
  // UNIVERSAL: independent of the branch, the catalog must keep PR #495 out of this slice's reach.
  for (const p of ['src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
    'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
    'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md']) {
    assert.equal(isPathAuthorizedForStudioSlice(p, CONSUMERS), false, p);
  }
});
test('P004 the no-touch proof document is present', () => {
  assert.match(readEv('PR495-NO-TOUCH-PROOF.md'), /9634c364/);
});

// ===========================================================================
// E — slice artifacts and evidence
// ===========================================================================
test('E001 this slice ships its own test, gate and evidence directory', () => {
  assert.ok(fs.existsSync(path.join(ROOT, TEST_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, GATE_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, EV_REL)));
});
for (const doc of ['CERTIFICATION-REPORT.md', 'ROOT-CAUSE.md', 'CONSUMER-APPLICABILITY-CONTRACT.md',
  'CORE-NON-REGRESSION.md', 'PR495-HISTORICAL-BRANCH-FIXTURE.md', 'NINE-TEST-CONSUMER-MIGRATION.md',
  'TWENTY-TWO-GATE-CONSUMER-MIGRATION.md', 'GOVERNANCE-CONSUMER-MIGRATION.md', 'NEGATIVE-MATRIX.md',
  'SCOPE-INVENTORY.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md', 'PR495-NO-TOUCH-PROOF.md',
  'CATALOG-BOUND-COMPATIBILITY-AUTHORIZATION.md']) {
  test(`E002 evidence present and non-trivial: ${doc}`, () => assert.ok(readEv(doc).length > 200, doc));
}
test('E003 package.json wires this slice test and gate', () => {
  const pkg = JSON.parse(readSrc('package.json'));
  assert.ok(pkg.scripts['test:runtime:studio-scope-governance-historical-branch-consumers']);
  assert.ok(pkg.scripts['gate:g423-studio-scope-governance-historical-branch-consumers']);
  assert.ok(pkg.scripts['test:runtime'].includes('studio-scope-governance-historical-branch-consumers'));
});
test('E004 the root-cause document names the real blocker and the merged main', () => {
  const doc = readEv('ROOT-CAUSE.md');
  assert.match(doc, /B-HISTORICAL-OPEN-PR-LATER-CONSUMERS-BLOCK/);
  assert.match(doc, /fd2c38a0/);
  assert.match(doc, /active_slice_before_caller/);
});
test('E005 the core non-regression document states what may never change', () => {
  const doc = readEv('CORE-NON-REGRESSION.md');
  assert.match(doc, /active_slice_before_caller/);
  assert.match(doc, /allowHistorical/);
});
test('E006 the contract document describes every state', () => {
  const doc = readEv('CONSUMER-APPLICABILITY-CONTRACT.md');
  for (const r of ['empty_branch_diff', 'unknown_caller_slice', 'invalid_changed_paths',
    'consumer_slice_after_active_slice', 'active_slice_scope_invalid']) assert.ok(doc.includes(r), r);
});
test('E007 the fixture document records the Builder-41 paths', () => {
  const doc = readEv('PR495-HISTORICAL-BRANCH-FIXTURE.md');
  for (const p of BUILDER41_FIXTURE) assert.ok(doc.includes(p), p);
});
test('E008 the nine-test document lists all nine', () => {
  const doc = readEv('NINE-TEST-CONSUMER-MIGRATION.md');
  for (const [p] of NINE_TESTS) assert.ok(doc.includes(path.basename(p)), p);
});
test('E009 the twenty-two-gate document lists all twenty-two', () => {
  const doc = readEv('TWENTY-TWO-GATE-CONSUMER-MIGRATION.md');
  for (const p of TWENTY_TWO_GATES) assert.ok(doc.includes(path.basename(p)), p);
});
test('E010 the governance document lists all five branch-judging consumers', () => {
  const doc = readEv('GOVERNANCE-CONSUMER-MIGRATION.md');
  for (const p of GOVERNANCE_CONSUMERS) assert.ok(doc.includes(path.basename(p)), p);
});
test('E011 the scope inventory records the exact cross count', () => {
  assert.match(readEv('SCOPE-INVENTORY.md'), /36/);
});
test('E012 readiness declares post-merge revalidation as still required', () => {
  assert.match(readEv('READINESS.md'), /postMergeRevalidationRequired:\s*true/);
});
test('E013 readiness does not claim the main is green', () => {
  assert.match(readEv('READINESS.md'), /mainVerifiedGreen:\s*false/);
});
test('E014 readiness declares the core untouched', () => {
  const doc = readEv('READINESS.md');
  assert.match(doc, /coreApisUnchanged:\s*true/);
  assert.match(doc, /activeSliceBeforeCallerStillFails:\s*true/);
});
test('E015 readiness does not declare the PR495 update ready', () => {
  assert.match(readEv('READINESS.md'), /readyToUpdatePr495WithMain:\s*false/);
});
test('E017 the authorization document names the blocker and the single authorized slice', () => {
  const doc = readEv('CATALOG-BOUND-COMPATIBILITY-AUTHORIZATION.md');
  assert.match(doc, /B-CONSUMER-INAPPLICABILITY-NOT-CATALOG-BOUND/);
  assert.match(doc, /historicalBranchConsumerCompatibility/);
  assert.ok(doc.includes(BUILDER), BUILDER);
  assert.match(doc, /43/);
});
test('E018 the authorization document states what does NOT decide', () => {
  const doc = readEv('CATALOG-BOUND-COMPATIBILITY-AUTHORIZATION.md');
  for (const t of ['ordinal', 'status', 'branch', 'PR']) assert.ok(doc.includes(t), t);
  assert.match(doc, /n[ãa]o substitui a autocertifica/i);
});
test('E019 the contract document describes the unauthorized state', () => {
  assert.match(readEv('CONSUMER-APPLICABILITY-CONTRACT.md'),
    /historical_branch_consumer_compatibility_not_authorized/);
});
test('E020 the negative matrix records the merged-slice refusals', () => {
  const doc = readEv('NEGATIVE-MATRIX.md');
  assert.match(doc, /historical_branch_consumer_compatibility_not_authorized/);
  for (const id of [APP_INTEGRATION, MIGRATION, CORRECTION]) assert.ok(doc.includes(id), id);
});
test('E021 readiness declares the authorization catalog-bound', () => {
  const doc = readEv('READINESS.md');
  assert.match(doc, /consumerInapplicabilityCatalogBound:\s*true/);
  assert.match(doc, /catalogEntriesAuthorized:\s*1/);
  assert.match(doc, /mergedSlicesAuthorized:\s*0/);
  assert.match(doc, /authorizationInjectableByCaller:\s*false/);
  assert.match(doc, /selfCertificationStillMandatory:\s*true/);
});
test('E016 no historical evidence directory of an earlier slice is touched', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  // OWN-SCOPE: on an authorized historical branch the evidence directory in the diff belongs to
  // that branch's own slice, which this slice neither wrote nor owns — see ownScopeApplies.
  if (!ownScopeApplies(f)) return;
  for (const p of f) {
    if (!p.startsWith('docs/evidence/')) continue;
    assert.ok(p.startsWith(EV_REL), p);
  }
});
test('E016b every evidence path on this branch belongs to the ACTIVE slice, in any state', () => {
  // UNIVERSAL: whatever slice is active, no branch may carry a foreign slice's evidence.
  const f = changedOnThisBranch(); if (f === null || f.length === 0) return;
  const auth = createResolvedActiveStudioSlicePathAuthorizer(f);
  assert.equal(auth.ok, true, JSON.stringify(auth));
  for (const p of f) {
    if (!p.startsWith('docs/evidence/')) continue;
    assert.equal(auth.isAuthorized(p), true, p);
  }
});

// ===========================================================================
// T — this branch, judged by its own rules
// ===========================================================================
test('T001 this branch is sound for this slice itself', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = evaluateStudioBranchConsumerScope(f, { callerSliceId: CONSUMERS });
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
for (const [, caller] of NINE_TESTS) {
  test(`T002 this branch is sound for caller ${caller}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(evaluateStudioBranchConsumerScope(f, { callerSliceId: caller }).safe, true);
  });
}
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION]) {
  test(`T003 this branch is sound for governance caller ${caller}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(evaluateStudioBranchConsumerScope(f, { callerSliceId: caller }).safe, true);
  });
}
test('T004 this branch touches no forbidden path', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.notEqual(classifyStudioScopePath(p), 'forbidden_scope', p);
});
test('T005 this branch touches no Studio blueprint-engine source of another slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  // OWN-SCOPE: see the ownScopeApplies contract above.
  if (!ownScopeApplies(f)) return;
  for (const p of f) assert.equal(p.startsWith('src/studio/blueprint-engine/'), false, p);
});
test('T006 this branch resolves exactly one slice, or none at all', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const a = resolveActiveStudioSlice(f);
  if (f.length === 0) { assert.equal(a.ok, false); return; }
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.candidates.length, 1);
});
test('T007 the active path authorizer still admits only this slice artifacts', () => {
  const f = changedOnThisBranch(); if (f === null || f.length === 0) return;
  const a = createResolvedActiveStudioSlicePathAuthorizer(f);
  assert.equal(a.ok, true);
  for (const p of f) assert.equal(a.isAuthorized(p), true, p);
  for (const p of ['src/App.jsx', 'docs/nobody/x.md', 'src/modules/x.js']) {
    assert.equal(a.isAuthorized(p), false, p);
  }
});
test('T009 an empty diff is admitted ONLY as the safe empty_branch_diff state', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: CONSUMERS });
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.notApplicable, true);
  assert.equal(r.safe, true);
  assert.equal(r.activeSliceId, null);
  assert.deepEqual(r.allowed, []);
});
test('T010 a real slice branch diff is substantive and never reads as empty', () => {
  const f = changedOnThisBranch(); if (f === null || f.length === 0) return;
  assert.ok(f.length > 20, String(f.length));
  const r = evaluateStudioBranchConsumerScope(f, { callerSliceId: CONSUMERS });
  assert.notEqual(r.reason, 'empty_branch_diff');
  assert.notEqual(r.activeSliceId, null);
});
test('T008 this branch owns exactly the artifacts the catalog says it owns', () => {
  for (const rel of [TEST_REL, GATE_REL]) {
    assert.deepEqual(findOwningStudioSlices(rel).map((s) => s.sliceId), [CONSUMERS], rel);
  }
});
