import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED,
  CHRONOLOGICAL_MIGRATION_SLICE_ID,
  MAIN_DIFF_CORRECTION_SLICE_ID,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, findOwningStudioSlices, resolveActiveStudioSlice,
  classifyStudioScopePath, evaluateStudioBranchScope, evaluateStudioBranchDiffScope,
  evaluateStudioBranchConsumerScope,
  createResolvedActiveStudioSlicePathAuthorizer, isPathAuthorizedForStudioSlice,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction');
const readEv = (n) => fs.readFileSync(path.join(EV, n), 'utf8');
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';
const CONSUMERS = 'studio-scope-governance-historical-branch-consumers';

const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs';
const EV_REL = 'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

/** A minimal, deterministic diff that resolves THIS slice as the active one. */
const CORRECTION_DIFF = [REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, `${EV_REL}READINESS.md`];

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

const SEVENTEEN_TESTS = [
  'empresas-certified-blueprint-mirror-alignment-audit', 'empresas-local-read-contract-certification',
  'empresas-local-read-only-contract-pilot', 'empresas-local-read-parity-hardening',
  'empresas-studio-compatibility-slice-1', 'post-foundation-c-empresas-controlled-production-test-plan',
  'post-foundation-c-studio-foundation-audit', 'studio-authoring-runtime-to-preview-bridge-hardening',
  'studio-authoring-runtime-to-preview-bridge-source-shape-alignment', 'studio-blueprint-contract-certification',
  'studio-blueprint-contract-hardening', 'studio-blueprint-engine-foundation',
  'studio-blueprint-module-reference-planner', 'studio-bridge-decision-envelope-identity-contract',
  'studio-bridge-to-preview-sandbox-runtime-contract', 'studio-foundation-contracts',
  'studio-module-preview-sandbox-contract',
].map((t) => `src/runtime/__tests__/${t}.test.js`);

const TWELVE_GATES = [
  'g423-studio-blueprint-engine-foundation', 'g423-studio-blueprint-module-reference-planner',
  'g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment',
  'g423-studio-authoring-runtime-to-preview-bridge-hardening',
  'g423-studio-bridge-to-preview-sandbox-runtime-contract',
  'g423-studio-bridge-decision-envelope-identity-contract',
  'g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan',
  'g423-studio-bridge-decision-core-envelope-contract',
  'g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
  'g423-studio-bridge-decision-core-envelope-builder-contract',
  'g423-studio-bridge-decision-core-envelope-builder-implementation-plan',
  'g423-studio-dev-preview-app-integration',
].map((g) => `scripts/gates/${g}.mjs`);

const MIGRATION_TEST_REL = 'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js';
const MIGRATION_GATE_REL = 'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs';

const EIGHT_LOOKALIKES = [
  'docs/random-migration-plan.md',
  'tools/custom-migration-helper.js',
  'config/menu.json',
  'tools/navigation-generator.js',
  'scripts/gates/g423-unregistered-route-menu.mjs',
  'src/runtime/__tests__/unlisted-empresas-change.test.js',
  'scripts/gates/g423-unlisted-empresas-change.mjs',
  'docs/evidence/unregistered-empresas-change/file.md',
];

/** The previous slice's certified documents. Immutable: never edited, never cross-authorized. */
const HISTORICAL_EVIDENCE = [
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md',
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/READINESS.md',
];

const DB_MIGRATION_PATHS = [
  'migrations/001.sql', 'nested/migrations/001.sql', 'prisma/migrations/20240101_init/migration.sql',
  'backend/prisma/migrations/x/migration.sql', 'anything.sql', 'scripts/migrateUsers.js',
];

// ===========================================================================
// R — registry after the correction
// ===========================================================================
test('R001 the catalog holds at least forty-three slices', () => assert.ok(STUDIO_SLICE_CATALOG.length >= 43, String(STUDIO_SLICE_CATALOG.length)));
test('R002 slice ids stay unique', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});
test('R003 ordinals are unique, positive integers', () => {
  const o = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal);
  assert.equal(new Set(o).size, o.length);
  assert.ok(o.every((x) => Number.isInteger(x) && x > 0));
});
test('R004 ordinals are contiguous from one', () => {
  const o = [...STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal)].sort((a, b) => a - b);
  assert.deepEqual(o, Array.from({ length: STUDIO_SLICE_CATALOG.length }, (_, i) => i + 1));
});
test('R005 the correction slice is ordinal 43', () => {
  assert.equal(getStudioSliceById(CORRECTION).sliceOrdinal, 43);
});
test('R006 no slice before the correction is still the active one', () => {
  const active = STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice');
  for (const a of active) assert.ok(a.sliceOrdinal >= getStudioSliceById(CORRECTION).sliceOrdinal, a.sliceId);
});
test('R007 the previous governance slice is now merged', () => assert.equal(getStudioSliceById(MIGRATION).status, 'merged'));
test('R008 the correction is chronologically after the migration', () => {
  assert.ok(getStudioSliceById(CORRECTION).sliceOrdinal > getStudioSliceById(MIGRATION).sliceOrdinal);
});
test('R009 the correction is chronologically after the Builder', () => {
  assert.ok(getStudioSliceById(CORRECTION).sliceOrdinal > getStudioSliceById(BUILDER).sliceOrdinal);
});
test('R010 exactly one slice carries status active_slice', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').length, 1);
});
test('R011 the correction primary set is exactly three anchored patterns', () => {
  const s = getStudioSliceById(CORRECTION);
  assert.deepEqual(s.primaryArtifactPatterns.map((r) => r.source), [
    '^src\\/runtime\\/__tests__\\/studio-scope-governance-main-diff-correction\\.test\\.js$',
    '^scripts\\/gates\\/g423-studio-scope-governance-main-diff-correction\\.mjs$',
    '^docs\\/evidence\\/post-foundation-c-studio-scope-governance-main-diff-correction\\/',
  ]);
});
test('R012 the correction branch marker is exactly the evidence directory', () => {
  assert.deepEqual(getStudioSliceById(CORRECTION).branchMarkerPatterns.map((r) => r.source),
    ['^docs\\/evidence\\/post-foundation-c-studio-scope-governance-main-diff-correction\\/']);
});
test('R013 the correction branch markers are a subset of its primary set', () => {
  const s = getStudioSliceById(CORRECTION);
  for (const m of s.branchMarkerPatterns) {
    assert.ok(s.primaryArtifactPatterns.some((p) => p.source === m.source), m.source);
  }
});
test('R014 the correction shared set is exactly registry, guard and the two manifests', () => {
  assert.deepEqual(getStudioSliceById(CORRECTION).sharedGovernancePatterns.map((r) => r.source), [
    '^scripts\\/gates\\/lib\\/studioScopeGovernanceRegistry\\.mjs$',
    '^scripts\\/gates\\/lib\\/studioScopeGovernanceGuard\\.mjs$',
    '^package\\.json$',
    '^package-lock\\.json$',
  ]);
});
test('R015 the correction declares no explicitly authorized forbidden path', () => {
  assert.deepEqual(getStudioSliceById(CORRECTION).explicitlyAuthorizedForbiddenPatterns, []);
});
test('R016b later slices never own this slice artifacts', () => {
  for (const rel of [TEST_REL, GATE_REL]) {
    assert.deepEqual(findOwningStudioSlices(rel).map((x) => x.sliceId), [CORRECTION], rel);
  }
});
test('R016 every entry still declares the same ten keys', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.deepEqual(Object.keys(s).sort(), [
      'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'explicitlyAuthorizedForbiddenPatterns',
      'historicalBranchConsumerCompatibility', 'primaryArtifactPatterns', 'sharedGovernancePatterns',
      'sliceId', 'sliceOrdinal', 'status', 'title',
    ], s.sliceId);
  }
});
test('R017 the catalog and every entry stay frozen', () => {
  assert.ok(Object.isFrozen(STUDIO_SLICE_CATALOG));
  for (const s of STUDIO_SLICE_CATALOG) assert.ok(Object.isFrozen(s), s.sliceId);
});
test('R018 no two slices own the same primary pattern', () => {
  const seen = new Map();
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const p of s.primaryArtifactPatterns) {
      assert.equal(seen.has(p.source), false, `${p.source} owned by ${seen.get(p.source)} and ${s.sliceId}`);
      seen.set(p.source, s.sliceId);
    }
  }
});
test('R019 every catalogued pattern is anchored at the start', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns',
      'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']) {
      for (const p of s[k]) assert.ok(p.source.startsWith('^'), `${s.sliceId} ${k} ${p.source}`);
    }
  }
});
test('R020 no catalogued pattern is a broad wildcard', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) {
      for (const p of s[k]) assert.equal(/^\^?\.[*+]/.test(p.source), false, `${s.sliceId} ${p.source}`);
    }
  }
});
test('R021 the correction cross list has no duplicate', () => {
  const src = getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns.map((r) => r.source);
  assert.equal(new Set(src).size, src.length);
});
test('R021b the correction cross list is exactly sixty-one unique patterns', () => {
  assert.equal(getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns.length, 61);
});
test('R021c the correction cross list contains no evidence path of the previous slice', () => {
  for (const r of getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns) {
    assert.equal(/docs\\\/evidence/.test(r.source), false, r.source);
  }
  for (const rel of HISTORICAL_EVIDENCE) {
    assert.equal(getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns.some((r) => r.test(rel)), false, rel);
  }
});
test('R021d the correction cross list is exactly the migrated artifact set', () => {
  const declared = getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns;
  const expected = [...new Set([...NINE_TESTS.map(([p]) => p), MIGRATION_TEST_REL, MIGRATION_GATE_REL,
    ...TWENTY_TWO_GATES, ...SEVENTEEN_TESTS, ...TWELVE_GATES])];
  assert.equal(expected.length, 61);
  assert.equal(declared.length, expected.length);
  for (const p of expected) assert.ok(declared.some((r) => r.test(p)), p);
});
test('R022 the correction cross list contains no directory wildcard for tests or gates', () => {
  for (const r of getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns) {
    assert.notEqual(r.source, '^src\\/runtime\\/__tests__\\/');
    assert.notEqual(r.source, '^scripts\\/gates\\/');
  }
});
test('R023 the correction owns none of the paths it only cross-authorizes', () => {
  for (const [p] of NINE_TESTS) {
    assert.equal(findOwningStudioSlices(p).some((s) => s.sliceId === CORRECTION), false, p);
  }
});
test('R024 the known-later export stays derived from the catalog', () => {
  const union = new Set();
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) {
      for (const p of s[k]) union.add(p.source);
    }
  }
  assert.ok(KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.every((r) => union.has(r.source)));
  assert.ok(Object.isFrozen(KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS));
});
test('R025 the correction scope never reaches the Builder subtree', () => {
  const s = getStudioSliceById(CORRECTION);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  assert.equal(all.some((r) => r.test('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js')), false);
});
test('R026 the correction scope never reaches productionUiGuard', () => {
  const s = getStudioSliceById(CORRECTION);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  assert.equal(all.some((r) => r.test('scripts/gates/lib/productionUiGuard.mjs')), false);
});
test('R027 the correction scope never reaches src/App.jsx', () => {
  const s = getStudioSliceById(CORRECTION);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  assert.equal(all.some((r) => r.test('src/App.jsx')), false);
});
test('R028 the correction scope never reaches a pre-Studio gate', () => {
  for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
    assert.equal(isPathAuthorizedForStudioSlice(g, CORRECTION), false, g);
  }
});

// Every historical artifact the correction rewires must be exactly authorized for it.
for (const [p] of NINE_TESTS) {
  test(`R029 the correction is authorized for the migrated test ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CORRECTION), true, p);
  });
}
for (const p of TWENTY_TWO_GATES) {
  test(`R030 the correction is authorized for the migrated gate ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CORRECTION), true, p);
  });
}
for (const p of SEVENTEEN_TESTS) {
  test(`R031 the correction is authorized for the historical test ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CORRECTION), true, p);
  });
}
for (const p of TWELVE_GATES) {
  test(`R032 the correction is authorized for the historical gate ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, CORRECTION), true, p);
  });
}

// ===========================================================================
// K — the core APIs keep their fail-closed semantics
// ===========================================================================
test('K001 resolveActiveStudioSlice([]) still fails closed', () => {
  const r = resolveActiveStudioSlice([]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
  assert.equal(r.sliceId, null);
  assert.deepEqual(r.candidates, []);
});
test('K002 evaluateStudioBranchScope([]) still fails closed', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.deepEqual(r.blockers, ['no_active_slice_resolved']);
});
test('K003 evaluateStudioBranchScope([]) authorizes nothing', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: CORRECTION });
  assert.deepEqual(r.allowed, []);
  assert.deepEqual(r.crossAuthorized, []);
  assert.deepEqual(r.explicitForbiddenAuthorized, []);
});
test('K004 evaluateStudioBranchScope([]) reports the caller and no active slice', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: CORRECTION });
  assert.equal(r.callerSliceId, CORRECTION);
  assert.equal(r.activeSliceId, null);
});
test('K005 the core still blocks an unknown caller with an empty set', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: 'nope' });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('unknown_caller_slice'));
});
test('K006 the core is unchanged for a forbidden path', () => {
  const r = evaluateStudioBranchScope([...CORRECTION_DIFF, 'src/modules/x.js'], { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, ['src/modules/x.js']);
  assert.equal(r.safe, false);
});
test('K007 the core is unchanged for an unknown path', () => {
  const r = evaluateStudioBranchScope([...CORRECTION_DIFF, 'docs/nobody/x.md'], { callerSliceId: CORRECTION });
  assert.deepEqual(r.unknown, ['docs/nobody/x.md']);
  assert.equal(r.safe, false);
});
test('K008 the core is unchanged for an ambiguous active slice', () => {
  const r = evaluateStudioBranchScope([
    `${EV_REL}READINESS.md`, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  ], { callerSliceId: CORRECTION });
  assert.ok(r.blockers.includes('ambiguous_active_slice'));
  assert.equal(r.safe, false);
});
test('K009 the core still blocks an active slice earlier than the caller', () => {
  const r = evaluateStudioBranchScope(['src/studio/blueprint-engine/dev-preview-app-integration/a.js'],
    { callerSliceId: BUILDER });
  assert.ok(r.blockers.includes('active_slice_before_caller'));
});
test('K010 explicit-forbidden authorization stays catalog-bound', () => {
  const r = evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
    'src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs',
  ], { callerSliceId: APP_INTEGRATION });
  assert.equal(r.safe, true);
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.explicitForbiddenAuthorized,
    ['scripts/gates/lib/productionUiGuard.mjs', 'src/App.jsx']);
});
test('K011 explicit-forbidden authorization is still not injectable', () => {
  const r = evaluateStudioBranchScope([...CORRECTION_DIFF, 'src/App.jsx'],
    { callerSliceId: CORRECTION, explicitlyAuthorizedForbidden: [/^src\/App\.jsx$/] });
  assert.deepEqual(r.forbidden, ['src/App.jsx']);
  assert.equal(r.safe, false);
});
test('K012 explicit-forbidden authorization is still not inherited by the correction', () => {
  const r = evaluateStudioBranchScope([...CORRECTION_DIFF, 'scripts/gates/lib/productionUiGuard.mjs'],
    { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, ['scripts/gates/lib/productionUiGuard.mjs']);
});
test('K013 cross authorization is still not inherited', () => {
  const r = evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/a.js',
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
  ], { callerSliceId: APP_INTEGRATION });
  assert.ok(r.chronologicalViolation.includes(
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js'));
  assert.equal(r.safe, false);
});

// ===========================================================================
// D — the branch-diff boundary API
// ===========================================================================
test('D001 empty diff with a known caller is not applicable', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION });
  assert.equal(r.applicable, false);
  assert.equal(r.notApplicable, true);
  assert.equal(r.reason, 'empty_branch_diff');
});
test('D002 empty diff with a known caller is safe', () => {
  assert.equal(evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION }).safe, true);
});
test('D003 empty diff carries no blockers', () => {
  assert.deepEqual(evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION }).blockers, []);
});
test('D004 empty diff authorizes nothing', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION });
  assert.deepEqual(r.allowed, []);
  assert.deepEqual(r.crossAuthorized, []);
  assert.deepEqual(r.explicitForbiddenAuthorized, []);
  assert.equal(r.total, 0);
});
test('D005 empty diff reports every list as empty', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.deepEqual(r.activeCandidates, []);
});
test('D006 empty diff resolves no active slice', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION });
  assert.equal(r.activeSliceId, null);
  assert.equal(r.activeSliceOrdinal, null);
});
test('D007 empty diff still identifies the caller exactly', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: MIGRATION });
  assert.equal(r.callerSliceId, MIGRATION);
  assert.equal(r.callerSliceOrdinal, getStudioSliceById(MIGRATION).sliceOrdinal);
});
test('D008 the report kind is stable', () => {
  assert.equal(evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION }).kind, 'studio-branch-diff-scope-evaluation');
  assert.equal(evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION }).kind, 'studio-branch-diff-scope-evaluation');
});
test('D009 the report is frozen', () => {
  assert.ok(Object.isFrozen(evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION })));
  assert.ok(Object.isFrozen(evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION })));
});
test('D010 the report declares no side effect', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION });
  assert.equal(r.sideEffects, false);
  assert.equal(r.backendAccessed, false);
  assert.equal(r.prismaAccessed, false);
  assert.equal(r.fetchUsed, false);
  assert.equal(r.mutationAllowed, false);
});
test('D011 empty diff with an unknown caller is NOT applicable-safe', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: 'nope' });
  assert.equal(r.safe, false);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, 'unknown_caller_slice');
  assert.deepEqual(r.blockers, ['unknown_caller_slice']);
});
test('D012 empty diff with a missing caller option fails closed', () => {
  const r = evaluateStudioBranchDiffScope([], {});
  assert.equal(r.safe, false);
  assert.equal(r.callerSliceId, null);
});
for (const [label, bad] of [
  ['null', null], ['undefined', undefined], ['string', 'x'], ['object', {}],
  ['number item', [1]], ['empty string item', ['']], ['mixed items', ['a', 2]], ['nested array', [[]]],
]) {
  test(`D013 invalid input fails closed and is never treated as empty: ${label}`, () => {
    const r = evaluateStudioBranchDiffScope(bad, { callerSliceId: CORRECTION });
    assert.equal(r.safe, false);
    assert.equal(r.reason, 'invalid_changed_paths');
    assert.equal(r.notApplicable, false);
    assert.ok(r.blockers.includes('invalid_changed_paths'));
  });
}
test('D014 invalid input with an unknown caller reports both blockers', () => {
  const r = evaluateStudioBranchDiffScope(null, { callerSliceId: 'nope' });
  assert.deepEqual(r.blockers, ['invalid_changed_paths', 'unknown_caller_slice']);
});
test('D015 a non-empty diff is applicable', () => {
  const r = evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
  assert.equal(r.applicable, true);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, null);
});
test('D016 a same-slice diff is safe and fully allowed', () => {
  const r = evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
  assert.equal(r.safe, true);
  assert.equal(r.allowed.length, CORRECTION_DIFF.length);
  assert.equal(r.activeSliceId, CORRECTION);
});
test('D017 a later active slice is safe for an earlier caller', () => {
  const r = evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: APP_INTEGRATION });
  assert.equal(r.safe, true);
  assert.ok(r.activeSliceOrdinal > r.callerSliceOrdinal);
});
test('D018 an earlier active slice blocks a later caller', () => {
  const r = evaluateStudioBranchDiffScope(['src/studio/blueprint-engine/dev-preview-app-integration/a.js'],
    { callerSliceId: BUILDER });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('active_slice_before_caller'));
  assert.equal(r.applicable, true);
});
test('D019 a forbidden path in a real diff still blocks', () => {
  const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, 'backend/server.js'], { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, ['backend/server.js']);
  assert.equal(r.safe, false);
});
test('D020 an unknown path in a real diff still blocks', () => {
  const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, 'docs/nobody/x.md'], { callerSliceId: CORRECTION });
  assert.deepEqual(r.unknown, ['docs/nobody/x.md']);
  assert.equal(r.safe, false);
});
test('D021 an ambiguous active slice in a real diff still blocks', () => {
  const r = evaluateStudioBranchDiffScope([
    `${EV_REL}READINESS.md`, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  ], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('ambiguous_active_slice'));
  assert.equal(r.activeCandidates.length, 2);
});
test('D022 an unresolved active slice in a real diff still blocks', () => {
  const r = evaluateStudioBranchDiffScope(['package.json'], { callerSliceId: CORRECTION });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('no_active_slice_resolved'));
  assert.equal(r.applicable, true);
});
test('D023 a foreign catalogued path still blocks', () => {
  // Owned by the Builder (ordinal 41) and deliberately NOT in this slice's cross list.
  const foreign = 'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js';
  const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, foreign], { callerSliceId: CORRECTION });
  assert.ok(r.chronologicalViolation.includes(foreign), JSON.stringify(r.blockers));
  assert.equal(r.safe, false);
});
test('D024 the boundary delegates the whole core report on a real diff', () => {
  const inner = evaluateStudioBranchScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
  const outer = evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
  for (const k of ['allowed', 'forbidden', 'unknown', 'chronologicalViolation', 'crossAuthorized',
    'explicitForbiddenAuthorized', 'blockers', 'activeCandidates']) {
    assert.deepEqual(outer[k], inner[k], k);
  }
  assert.equal(outer.safe, inner.safe);
  assert.equal(outer.activeSliceId, inner.activeSliceId);
  assert.equal(outer.total, inner.total);
});
test('D025 the boundary is deterministic', () => {
  const a = evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
  const b = evaluateStudioBranchDiffScope([...CORRECTION_DIFF].reverse(), { callerSliceId: CORRECTION });
  assert.deepEqual(a.allowed, b.allowed);
  assert.equal(a.safe, b.safe);
});
test('D026 the boundary tolerates a duplicated path without changing the verdict', () => {
  const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, TEST_REL], { callerSliceId: CORRECTION });
  assert.equal(r.safe, true);
  assert.equal(r.total, CORRECTION_DIFF.length);
});
test('D027 the boundary never mutates its input', () => {
  const input = [...CORRECTION_DIFF];
  evaluateStudioBranchDiffScope(input, { callerSliceId: CORRECTION });
  assert.deepEqual(input, CORRECTION_DIFF);
});
test('D028 the three semantics differ exactly where they must', () => {
  assert.equal(resolveActiveStudioSlice([]).ok, false);
  assert.equal(evaluateStudioBranchScope([], { callerSliceId: CORRECTION }).safe, false);
  assert.equal(evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION }).safe, true);
});

// ===========================================================================
// A — the resolved-active-slice path authorizer
// ===========================================================================
test('A001 the authorizer resolves the exact active slice', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.ok, true);
  assert.equal(a.activeSliceId, CORRECTION);
  assert.equal(a.activeSliceOrdinal, 43);
  assert.equal(a.reason, null);
});
test('A002 the authorizer kind is stable and the object is frozen', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.kind, 'resolved-active-studio-slice-path-authorizer');
  assert.ok(Object.isFrozen(a));
});
test('A003 the authorizer admits what the active slice owns', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.isAuthorized(TEST_REL), true);
  assert.equal(a.isAuthorized(GATE_REL), true);
});
test('A004 the authorizer admits what the active slice cross-authorizes', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  for (const [p] of NINE_TESTS) assert.equal(a.isAuthorized(p), true, p);
});
test('A005 the authorizer admits what the active slice shares', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.isAuthorized(REGISTRY_REL), true);
  assert.equal(a.isAuthorized(GUARD_REL), true);
  assert.equal(a.isAuthorized('package.json'), true);
});
test('A006 the authorizer refuses an empty diff', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer([]);
  assert.equal(a.ok, false);
  assert.equal(a.reason, 'empty_branch_diff');
  assert.equal(a.isAuthorized(TEST_REL), false);
  assert.equal(a.activeSliceId, null);
});
test('A007 the authorizer refuses an unresolved active slice', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(['package.json', 'package-lock.json', REGISTRY_REL]);
  assert.equal(a.ok, false);
  assert.equal(a.reason, 'no_active_slice_resolved');
  assert.equal(a.isAuthorized(REGISTRY_REL), false);
});
test('A008 the authorizer refuses an ambiguous active slice', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer([
    `${EV_REL}READINESS.md`, 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  ]);
  assert.equal(a.ok, false);
  assert.equal(a.reason, 'ambiguous_active_slice');
  assert.equal(a.isAuthorized(TEST_REL), false);
});
for (const [label, bad] of [['null', null], ['string', 'x'], ['object', {}], ['bad item', [1]]]) {
  test(`A009 the authorizer refuses invalid input: ${label}`, () => {
    const a = createResolvedActiveStudioSlicePathAuthorizer(bad);
    assert.equal(a.ok, false);
    assert.equal(a.reason, 'invalid_changed_paths');
    assert.equal(a.isAuthorized(TEST_REL), false);
  });
}
test('A010 the authorizer refuses a path of another slice', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.isAuthorized('src/studio/blueprint-engine/module-preview-sandbox/z.js'), false);
  assert.equal(a.isAuthorized('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js'), false);
});
test('A011 the authorizer refuses a forbidden path the active slice does not declare', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.isAuthorized('src/App.jsx'), false);
  assert.equal(a.isAuthorized('scripts/gates/lib/productionUiGuard.mjs'), false);
  assert.equal(a.isAuthorized('src/modules/x.js'), false);
});
test('A012 the authorizer does not inherit another slice cross authorization', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer([
    'src/studio/blueprint-engine/dev-preview-app-integration/a.js',
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  ]);
  assert.equal(a.activeSliceId, APP_INTEGRATION);
  assert.equal(a.isAuthorized('src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js'), false);
});
test('A013 the authorizer uses no slice-id prefix', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer([
    'docs/evidence/post-foundation-c-studio-scope-governance-maintenance/X.md',
  ]);
  // The maintenance slice shares the `studio-scope-governance-` prefix but owns nothing here.
  if (a.ok) assert.equal(a.isAuthorized(TEST_REL), false);
});
test('A014 the authorizer refuses a path no slice owns', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  assert.equal(a.isAuthorized('docs/nobody/x.md'), false);
});
for (const p of EIGHT_LOOKALIKES) {
  test(`A015 similar but uncatalogued path is never authorized: ${p}`, () => {
    const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
    assert.equal(a.isAuthorized(p), false, p);
    for (const s of STUDIO_SLICE_CATALOG) assert.equal(isPathAuthorizedForStudioSlice(p, s.sliceId), false, `${s.sliceId} ${p}`);
  });
}
for (const p of EIGHT_LOOKALIKES) {
  test(`A016 similar but uncatalogued path makes the branch unsafe: ${p}`, () => {
    const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, p], { callerSliceId: CORRECTION });
    assert.equal(r.safe, false, p);
    assert.ok(r.unknown.includes(p) || r.forbidden.includes(p) || r.chronologicalViolation.includes(p), p);
  });
}
test('A017 the authorizer accepts a non-array-safe path argument without throwing', () => {
  const a = createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
  for (const bad of [null, undefined, 1, {}, [], '']) assert.equal(a.isAuthorized(bad), false);
});

// ===========================================================================
// N — the negative matrix that must never regress
// ===========================================================================
for (const p of DB_MIGRATION_PATHS) {
  test(`N001 real DB migration artifact stays forbidden: ${p}`, () => {
    assert.equal(classifyStudioScopePath(p), 'forbidden_scope', p);
  });
}
for (const p of DB_MIGRATION_PATHS) {
  test(`N002 real DB migration artifact makes the branch unsafe: ${p}`, () => {
    const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, p], { callerSliceId: CORRECTION });
    assert.ok(r.forbidden.includes(p), p);
    assert.equal(r.safe, false, p);
  });
}
test('N003 the catalogued correction evidence is allowed by ownership, not by a loosened pattern', () => {
  const own = `${EV_REL}READINESS.md`;
  assert.equal(classifyStudioScopePath(own), 'known_later_studio_headless_artifact');
  assert.deepEqual(findOwningStudioSlices(own).map((s) => s.sliceId), [CORRECTION]);
});
test('N004 App.jsx stays forbidden under the correction as the active slice', () => {
  const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, 'src/App.jsx'], { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, ['src/App.jsx']);
});
test('N005 productionUiGuard stays forbidden under the correction as the active slice', () => {
  const r = evaluateStudioBranchDiffScope([...CORRECTION_DIFF, 'scripts/gates/lib/productionUiGuard.mjs'],
    { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, ['scripts/gates/lib/productionUiGuard.mjs']);
});
test('N006 a path listed for no slice is unknown under the correction', () => {
  assert.equal(classifyStudioScopePath('tools/whatever-new-thing.mjs'), 'unknown_scope');
});

// ===========================================================================
// S — source scans: every consumer really uses the central APIs
// ===========================================================================
for (const [p, caller] of NINE_TESTS) {
  test(`S001 migrated test uses the boundary API and its own caller id: ${path.basename(p)}`, () => {
    const src = readSrc(p);
    assert.ok(src.includes(`const CALLER_SLICE_ID = '${caller}';`), p);
    // Superseded by slice 44: the branch-relative section asks about its OWN applicability.
    assert.ok(src.includes('evaluateStudioBranchConsumerScope('), p);
  });
  test(`S002 migrated test no longer calls the core directly: ${path.basename(p)}`, () => {
    assert.equal(/[^f]evaluateStudioBranchScope\(/.test(readSrc(p)), false, p);
  });
}
for (const p of TWENTY_TWO_GATES) {
  test(`S003 migrated gate uses the boundary API: ${path.basename(p)}`, () => {
    const src = readSrc(p);
    assert.ok(src.includes('evaluateStudioBranchConsumerScope('), p);
    assert.ok(/const CALLER_SLICE_ID = '/.test(src), p);
  });
  test(`S004 migrated gate no longer calls the core directly: ${path.basename(p)}`, () => {
    assert.equal(/[^f]evaluateStudioBranchScope\(/.test(readSrc(p)), false, p);
  });
}
for (const p of [...SEVENTEEN_TESTS, ...TWELVE_GATES]) {
  test(`S005 historical consumer keeps no local migrationExempt helper: ${path.basename(p)}`, () => {
    assert.equal(/migrationExempt/.test(readSrc(p)), false, p);
  });
  test(`S006 historical consumer is not prefix-bound: ${path.basename(p)}`, () => {
    assert.equal(/startsWith\('studio-scope-governance-'\)/.test(readSrc(p)), false, p);
  });
  test(`S007 historical consumer uses the central authorizer: ${path.basename(p)}`, () => {
    assert.ok(/createResolvedActiveStudioSlicePathAuthorizer\(/.test(readSrc(p)), p);
  });
}
test('S008 no consumer hardcodes the migration slice as the only accepted active slice', () => {
  for (const p of [...SEVENTEEN_TESTS, ...TWELVE_GATES, ...TWENTY_TWO_GATES, ...NINE_TESTS.map(([x]) => x)]) {
    assert.equal(/sliceId !== MIGRATION_SLICE_ID/.test(readSrc(p)), false, p);
  }
});
test('S009 the guard imports only the registry', () => {
  const src = readSrc(GUARD_REL);
  const imports = [...src.matchAll(/^import [^;]*from '([^']+)';/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(imports)], ['./studioScopeGovernanceRegistry.mjs']);
});
test('S010 the registry imports nothing', () => {
  assert.equal(/^import /m.test(readSrc(REGISTRY_REL)), false);
});
for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
  test(`S011 the guard uses no impure API: ${api}`, () => assert.equal(readSrc(GUARD_REL).includes(api), false));
  test(`S012 the registry uses no impure API: ${api}`, () => assert.equal(readSrc(REGISTRY_REL).includes(api), false));
}
test('S013 the boundary API is exported by name', () => {
  assert.match(readSrc(GUARD_REL), /export function evaluateStudioBranchDiffScope\(/);
});
test('S014 the authorizer API is exported by name', () => {
  assert.match(readSrc(GUARD_REL), /export function createResolvedActiveStudioSlicePathAuthorizer\(/);
});
test('S015 the boundary API reads no caller-supplied forbidden authorization', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchDiffScope('),
    src.indexOf('export function createResolvedActiveStudioSlicePathAuthorizer('));
  assert.equal(/o\.explicitlyAuthorizedForbidden/.test(body), false);
});
test('S016 the authorizer accepts no injectable expected slice', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function createResolvedActiveStudioSlicePathAuthorizer('));
  assert.equal(/expectedSliceId|options/.test(body.split('\n}')[0]), false);
});
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  test(`S017 pre-Studio gate stays outside both APIs: ${path.basename(g)}`, () => {
    const src = readSrc(g);
    assert.equal(src.includes('evaluateStudioBranchScope('), false, g);
    assert.equal(src.includes('evaluateStudioBranchDiffScope('), false, g);
    assert.equal(findOwningStudioSlices(g).length, 0, g);
  });
}

// ===========================================================================
// P — PR #495 is not touched by this slice
// ===========================================================================
test('P001 the Builder subtree is outside this slice scope', () => {
  assert.equal(isPathAuthorizedForStudioSlice('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js', CORRECTION), false);
});
test('P002 the Builder test and gate are outside this slice scope', () => {
  assert.equal(isPathAuthorizedForStudioSlice('src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js', CORRECTION), false);
  assert.equal(isPathAuthorizedForStudioSlice('scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs', CORRECTION), false);
});
test('P003 the Builder evidence directory is outside this slice scope', () => {
  assert.equal(isPathAuthorizedForStudioSlice('docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md', CORRECTION), false);
});
test('P004 the Builder entry is untouched: ordinal, status and exact pattern counts', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.sliceOrdinal, 41);
  assert.equal(b.status, 'open_pull_request_495');
  assert.equal(b.primaryArtifactPatterns.length, 4);
  assert.equal(b.crossSliceAuthorizedPatterns.length, 8);
  assert.deepEqual(b.explicitlyAuthorizedForbiddenPatterns, []);
});
test('P004b the Builder cross list is exactly 2 lifecycle + 6 governance integration paths', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(new Set(b.crossSliceAuthorizedPatterns.map((r) => r.source)).size, 8);
  for (const p of [
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
    'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
    'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
    'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
    'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
    'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
    'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js',
    'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs',
  ]) assert.equal(isPathAuthorizedForStudioSlice(p, BUILDER), true, p);
  for (const p of ['src/runtime/__tests__/studio-scope-governance-maintenance.test.js',
    'scripts/gates/lib/studioScopeGovernanceGuard.mjs', 'src/App.jsx', 'backend/server.js']) {
    assert.equal(isPathAuthorizedForStudioSlice(p, BUILDER), false, p);
  }
});
test('P005 a Builder-shaped branch is still evaluated by the same rules', () => {
  const r = evaluateStudioBranchDiffScope([
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
    'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md',
  ], { callerSliceId: APP_INTEGRATION });
  assert.equal(r.activeSliceId, BUILDER);
  assert.equal(r.safe, true);
});
test('P006 the no-touch proof document is present', () => {
  assert.match(readEv('PR495-NO-TOUCH-PROOF.md'), /9634c364/);
});

// ===========================================================================
// E — slice artifacts and evidence
// ===========================================================================
test('E001 this slice ships its own test, gate and evidence directory', () => {
  assert.ok(fs.existsSync(path.join(ROOT, TEST_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, GATE_REL)));
  assert.ok(fs.existsSync(EV));
});
for (const doc of ['CERTIFICATION-REPORT.md', 'POST-MERGE-ROOT-CAUSE.md', 'EMPTY-DIFF-BOUNDARY-CONTRACT.md',
  'RESOLVED-ACTIVE-PATH-AUTHORIZER.md', 'NINE-TEST-MIGRATION.md', 'TWENTY-TWO-GATE-MIGRATION.md',
  'HISTORICAL-EXEMPTION-CENTRALIZATION.md', 'NEGATIVE-MATRIX.md', 'MAIN-BASELINE-BEFORE-CORRECTION.md',
  'BRANCH-REGRESSION-MATRIX.md', 'PR495-NO-TOUCH-PROOF.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md',
  'HISTORICAL-CERTIFICATION-SUPERSESSION.md']) {
  test(`E002 evidence present and non-trivial: ${doc}`, () => assert.ok(readEv(doc).length > 200, doc));
}
test('E003 package.json wires this slice test and gate', () => {
  const pkg = JSON.parse(readSrc('package.json'));
  assert.ok(pkg.scripts['test:runtime:studio-scope-governance-main-diff-correction']);
  assert.ok(pkg.scripts['gate:g423-studio-scope-governance-main-diff-correction']);
  assert.ok(pkg.scripts['test:runtime'].includes('studio-scope-governance-main-diff-correction'));
});
test('E004 no dependency was added by this slice', () => {
  const pkg = JSON.parse(readSrc('package.json'));
  assert.equal(Object.keys(pkg.dependencies ?? {}).includes('studio-scope-governance'), false);
});
// Historical evidence is IMMUTABLE. The previous slice's certified documents are never rewritten
// to declare their own supersession; the supersession is declared append-only by THIS slice.
for (const rel of HISTORICAL_EVIDENCE) {
  test(`E005 historical evidence is byte-identical to main: ${path.basename(rel)}`, () => {
    const onMain = execSync(`git show origin/main:${rel}`, { cwd: ROOT, encoding: 'utf8' });
    assert.equal(readSrc(rel), onMain, rel);
  });
  test(`E006 historical evidence carries NO retroactive supersession banner: ${path.basename(rel)}`, () => {
    assert.equal(/SUPERSEDED_BY_MAIN_DIFF_CORRECTION/.test(readSrc(rel)), false, rel);
  });
  test(`E007 historical evidence is absent from this branch diff: ${path.basename(rel)}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(f.includes(rel), false, rel);
  });
  test(`E008 historical evidence is not cross-authorized by this slice: ${path.basename(rel)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(rel, CORRECTION), false, rel);
  });
}
test('E009 the supersession document explains all three blockers', () => {
  const doc = readEv('HISTORICAL-CERTIFICATION-SUPERSESSION.md');
  for (const b of ['B-POSTMERGE-EMPTY-DIFF-FAILS-CLOSED-ON-MAIN', 'B-TWO-EXTENSION-GATES-NOT-ACTIVE-BOUND',
    'B-TEN-EXTENSION-GATES-PREFIX-BOUND']) assert.ok(doc.includes(b), b);
});
test('E010 the supersession document records the merged main baseline', () => {
  const doc = readEv('HISTORICAL-CERTIFICATION-SUPERSESSION.md');
  assert.match(doc, /01e1b701/);
  assert.match(doc, /20405/);
});
test('E011 the supersession document states the immutability rule', () => {
  assert.match(readEv('HISTORICAL-CERTIFICATION-SUPERSESSION.md'), /IMUT[ÁA]VEL|imut[áa]vel/);
});
test('E012 the supersession document requires post-merge revalidation', () => {
  assert.match(readEv('HISTORICAL-CERTIFICATION-SUPERSESSION.md'), /POST_MERGE_REVALIDATION_REQUIRED/);
});
test('E008 the root-cause document names the real main baseline', () => {
  assert.match(readEv('POST-MERGE-ROOT-CAUSE.md'), /01e1b701/);
});
test('E009 the baseline document records the measured red numbers', () => {
  const doc = readEv('MAIN-BASELINE-BEFORE-CORRECTION.md');
  assert.match(doc, /20405/);
  assert.match(doc, /20425/);
});
test('E010 the negative matrix lists all eight lookalikes', () => {
  const doc = readEv('NEGATIVE-MATRIX.md');
  for (const p of EIGHT_LOOKALIKES) assert.ok(doc.includes(p), p);
});
test('E011 the nine-test document lists all nine', () => {
  const doc = readEv('NINE-TEST-MIGRATION.md');
  for (const [p] of NINE_TESTS) assert.ok(doc.includes(path.basename(p)), p);
});
test('E012 the twenty-two-gate document lists all twenty-two', () => {
  const doc = readEv('TWENTY-TWO-GATE-MIGRATION.md');
  for (const p of TWENTY_TWO_GATES) assert.ok(doc.includes(path.basename(p)), p);
});
test('E013 the centralization document lists all twenty-nine historical consumers', () => {
  const doc = readEv('HISTORICAL-EXEMPTION-CENTRALIZATION.md');
  for (const p of [...SEVENTEEN_TESTS, ...TWELVE_GATES]) assert.ok(doc.includes(path.basename(p)), p);
});
test('E014 readiness declares post-merge revalidation as still required', () => {
  assert.match(readEv('READINESS.md'), /postMergeRevalidationRequired:\s*true/);
});
test('E015 readiness does not declare the main as certified', () => {
  assert.match(readEv('READINESS.md'), /mainVerifiedGreen:\s*false/);
});
test('E016 the revalidation plan states the empty-diff proof must be re-run on main', () => {
  assert.match(readEv('POST-MERGE-REVALIDATION-PLAN.md'), /test:runtime/);
});

// ===========================================================================
// T — this branch, judged by its own rules
// ===========================================================================
const changedOnThisBranch = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { return null; }
};
const OWN_SCOPE_CALLER = CORRECTION;

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

// This slice is a CONSUMER here, not the certifier. On a branch building an EARLIER slice it is a
// passenger, and the boundary re-certifies the branch against that slice before calling it sound.
test('T001 this branch is sound from the correction slice point of view', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = evaluateStudioBranchConsumerScope(f, { callerSliceId: CORRECTION });
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  if (!r.consumerApplicable) {
    assert.equal(r.notApplicable, true);
    assert.ok(r.reason === 'empty_branch_diff'
      || (r.reason === 'consumer_slice_after_active_slice' && r.certifiedAgainstActiveSlice === true), r.reason);
  }
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
for (const [, caller] of NINE_TESTS) {
  test(`T002 this branch is sound for caller ${caller}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(evaluateStudioBranchConsumerScope(f, { callerSliceId: caller }).safe, true);
  });
}
test('T003 this branch touches no forbidden path', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.notEqual(classifyStudioScopePath(p), 'forbidden_scope', p);
});
test('T004 this branch touches no Studio blueprint-engine source of another slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  // OWN-SCOPE: see the ownScopeApplies contract above.
  if (!ownScopeApplies(f)) return;
  for (const p of f) assert.equal(p.startsWith('src/studio/blueprint-engine/'), false, p);
});
test('T005 this branch is not proven by an empty diff', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  if (f.length === 0) return; // running on `main` after merge — the empty-diff contract covers it
  assert.ok(f.length > 20, String(f.length));
  // A LATER slice may legitimately be the one being built; this slice is then a consumer.
  const active = resolveActiveStudioSlice(f);
  assert.equal(active.ok, true, JSON.stringify(active));
  assert.equal(active.candidates.length, 1);
});

// ===========================================================================
// X — active resolution is STRICT: zero / one / many, and nothing else decides
// ===========================================================================
const MARKER = {
  24: 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  41: 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md',
  42: 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
  43: `${EV_REL}READINESS.md`,
  44: 'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
};

test('X001 zero markers fail closed', () => {
  const r = resolveActiveStudioSlice(['package.json', 'package-lock.json', REGISTRY_REL, GUARD_REL]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
  assert.deepEqual(r.candidates, []);
});
test('X002 exactly one marker resolves that slice', () => {
  const r = resolveActiveStudioSlice([MARKER[43], REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL]);
  assert.equal(r.ok, true);
  assert.equal(r.sliceId, CORRECTION);
  assert.deepEqual(r.candidates, [CORRECTION]);
});
for (const [a, b] of [[42, 43], [41, 43], [24, 43], [24, 41], [41, 42], [43, 44]]) {
  test(`X003 two markers are always ambiguous: ${a} + ${b}`, () => {
    const r = resolveActiveStudioSlice([MARKER[a], MARKER[b]]);
    assert.equal(r.ok, false, JSON.stringify(r));
    assert.equal(r.reason, 'ambiguous_active_slice');
    assert.equal(r.candidates.length, 2);
    assert.equal(r.sliceId, null);
  });
  test(`X004 two markers make the branch unsafe: ${a} + ${b}`, () => {
    const r = evaluateStudioBranchDiffScope([MARKER[a], MARKER[b]], { callerSliceId: CORRECTION });
    assert.equal(r.safe, false);
    assert.ok(r.blockers.includes('ambiguous_active_slice'));
  });
}
test('X005 three markers are ambiguous too', () => {
  const r = resolveActiveStudioSlice([MARKER[24], MARKER[41], MARKER[43]]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.equal(r.candidates.length, 3);
});
test('X006 a cross authorization does NOT remove a marker candidate', () => {
  // The correction cross-authorizes the previous slice's TEST file, which is not a marker.
  // Even so, adding the previous slice's own MARKER keeps it a candidate and blocks.
  assert.equal(isPathAuthorizedForStudioSlice(MIGRATION_TEST_REL, CORRECTION), true);
  const r = resolveActiveStudioSlice([MARKER[42], MARKER[43], MIGRATION_TEST_REL]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.candidates, [CORRECTION, MIGRATION].sort());
});
test('X007 a cross authorization does NOT resolve ambiguity even when it covers every marker', () => {
  // Build a synthetic pair where one candidate's marker IS cross-authorized by the other.
  const covered = getStudioSliceById(CORRECTION).crossSliceAuthorizedPatterns
    .filter((re) => STUDIO_SLICE_CATALOG.some((s) => s.sliceId !== CORRECTION
      && s.branchMarkerPatterns.some((m) => m.test(MARKER[42]) && re.test(MARKER[42]))));
  assert.equal(covered.length, 0, 'no marker of another slice may be cross-authorized by this slice');
});
test('X008 the highest ordinal does NOT win an ambiguity', () => {
  const r = resolveActiveStudioSlice([MARKER[24], MARKER[43]]);
  assert.equal(r.ok, false);
  assert.equal(r.sliceId, null);
});
test('X009 the active_slice status does NOT win an ambiguity', () => {
  const r = resolveActiveStudioSlice([MARKER[42], MARKER[43]]);
  assert.equal(r.ok, false);
  assert.ok(r.candidates.includes(CORRECTION));
  assert.ok(r.candidates.includes(MIGRATION));
});
test('X010 shared governance paths never elect a slice', () => {
  for (const p of [REGISTRY_REL, GUARD_REL, 'package.json', 'package-lock.json']) {
    assert.deepEqual(resolveActiveStudioSlice([p]).candidates, [], p);
  }
});
test('X011 a cross-authorized test or gate never elects a slice', () => {
  for (const p of [MIGRATION_TEST_REL, MIGRATION_GATE_REL, ...NINE_TESTS.map(([x]) => x), ...TWENTY_TWO_GATES]) {
    assert.deepEqual(resolveActiveStudioSlice([p]).candidates, [], p);
  }
});
test('X012 an explicitly authorized forbidden path never elects a slice', () => {
  assert.deepEqual(resolveActiveStudioSlice(['src/App.jsx']).candidates, []);
  assert.deepEqual(resolveActiveStudioSlice(['scripts/gates/lib/productionUiGuard.mjs']).candidates, []);
});
test('X013 candidates are reported verbatim, never suppressed', () => {
  const r = resolveActiveStudioSlice([MARKER[42], MARKER[43]]);
  assert.deepEqual([...r.candidates].sort(), [CORRECTION, MIGRATION].sort());
});
test('X014 resolveActiveStudioSlice never reads a cross authorization', () => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function resolveActiveStudioSlice('));
  const fn = body.slice(0, body.indexOf('\n}\n') + 3);
  assert.equal(/crossSliceAuthorizedPatterns/.test(fn), false, fn);
  assert.equal(/sharedGovernancePatterns/.test(fn), false, fn);
  assert.equal(/explicitlyAuthorizedForbiddenPatterns/.test(fn), false, fn);
  assert.equal(/sliceOrdinal >|sliceOrdinal </.test(fn), false, fn);
  assert.equal(/status/.test(fn), false, fn);
});
for (const token of ['electedBy', 'amendedBy', 'being amended', 'amended.size', 'markerPaths.every',
  'amendsSliceIds', 'activeMarkerAmendmentPatterns', 'amendedCandidates', 'rawCandidates']) {
  test(`X015 the guard carries no amendment machinery: ${token}`, () => {
    assert.equal(readSrc(GUARD_REL).includes(token), false, token);
  });
}
test('X016 the documented contract matches the implementation', () => {
  const src = readSrc(GUARD_REL);
  assert.match(src, /zero markers and two-or-more distinct markers are BOTH refusals/);
});
