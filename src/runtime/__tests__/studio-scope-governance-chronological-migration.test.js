import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  FORBIDDEN_SCOPE_PATTERNS, STUDIO_SLICE_CATALOG, KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED, FORBIDDEN_BROAD_ALLOW_SOURCES,
  STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN, CHRONOLOGICAL_MIGRATION_SLICE_ID,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, getStudioSliceByOrdinal, findOwningStudioSlices, findMarkingStudioSlices,
  resolveActiveStudioSlice, classifyStudioScopePath, evaluateStudioBranchScope,
  isKnownLaterStudioHeadlessArtifact, filterForbiddenScopePaths, filterUnknownScopePaths,
  createStudioScopeGovernanceReport, assertNoForbiddenScopePaths,
  getAuthorizedPatternsForStudioSlice, isPathAuthorizedForStudioSlice,
  getExplicitlyAuthorizedForbiddenPatternsForStudioSlice,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration');
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs';
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');

const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const BUILDER = 'bridge-decision-core-envelope-builder';

/** The nine tests that used to block the official aggregate, with their caller slice ids. */
const NINE_TESTS = [
  ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-contract.test.js', 'authoring-runtime-to-preview-bridge-contract'],
  ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge-implementation-plan.test.js', 'authoring-runtime-to-preview-bridge-implementation-plan'],
  ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js', 'authoring-runtime-to-preview-bridge'],
  ['src/runtime/__tests__/studio-dev-preview-app-integration-contract.test.js', 'dev-preview-app-integration-contract'],
  ['src/runtime/__tests__/studio-dev-preview-app-integration-implementation-plan.test.js', 'dev-preview-app-integration-implementation-plan'],
  ['src/runtime/__tests__/studio-dev-preview-app-integration.test.js', 'dev-preview-app-integration'],
  ['src/runtime/__tests__/studio-module-blueprint-authoring-foundation-contract.test.js', 'module-blueprint-authoring-foundation-contract'],
  ['src/runtime/__tests__/studio-module-blueprint-authoring-implementation-plan.test.js', 'module-blueprint-authoring-implementation-plan'],
  ['src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js', 'module-blueprint-authoring-runtime'],
];

/** The twenty-two Studio gates migrated by this slice, with their caller slice ids. */
const TWENTY_TWO_GATES = [
  ['scripts/gates/g423-studio-foundation-audit.mjs', 'studio-foundation-audit'],
  ['scripts/gates/g423-studio-module-preview-sandbox-contract.mjs', 'module-preview-sandbox'],
  ['scripts/gates/g423-studio-dev-preview-contract-bridge.mjs', 'dev-preview-contract-bridge'],
  ['scripts/gates/g423-studio-dev-preview-visual-contract.mjs', 'dev-preview-visual-contract'],
  ['scripts/gates/g423-studio-dev-preview-runtime-shell-contract.mjs', 'dev-preview-runtime-shell-contract'],
  ['scripts/gates/g423-studio-dev-preview-isolated-runtime-implementation-plan.mjs', 'dev-preview-isolated-runtime-implementation-plan'],
  ['scripts/gates/g423-studio-dev-preview-isolated-runtime.mjs', 'dev-preview-isolated-runtime'],
  ['scripts/gates/g423-studio-dev-preview-runtime-ui-contract.mjs', 'dev-preview-runtime-ui-contract'],
  ['scripts/gates/g423-studio-dev-preview-runtime-ui-implementation-plan.mjs', 'dev-preview-runtime-ui-implementation-plan'],
  ['scripts/gates/g423-studio-dev-preview-runtime-ui.mjs', 'dev-preview-runtime-ui'],
  ['scripts/gates/g423-studio-dev-preview-route-menu-contract.mjs', 'dev-preview-route-menu-contract'],
  ['scripts/gates/g423-studio-dev-preview-route-menu-implementation-plan.mjs', 'dev-preview-route-menu-implementation-plan'],
  ['scripts/gates/g423-studio-dev-preview-route-menu.mjs', 'dev-preview-route-menu'],
  ['scripts/gates/g423-studio-dev-preview-app-integration-contract.mjs', 'dev-preview-app-integration-contract'],
  ['scripts/gates/g423-studio-dev-preview-app-integration-implementation-plan.mjs', 'dev-preview-app-integration-implementation-plan'],
  ['scripts/gates/g423-studio-dev-preview-app-integration.mjs', 'dev-preview-app-integration'],
  ['scripts/gates/g423-studio-module-blueprint-authoring-foundation-contract.mjs', 'module-blueprint-authoring-foundation-contract'],
  ['scripts/gates/g423-studio-module-blueprint-authoring-implementation-plan.mjs', 'module-blueprint-authoring-implementation-plan'],
  ['scripts/gates/g423-studio-module-blueprint-authoring-runtime.mjs', 'module-blueprint-authoring-runtime'],
  ['scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-contract.mjs', 'authoring-runtime-to-preview-bridge-contract'],
  ['scripts/gates/g423-studio-authoring-runtime-to-preview-bridge-implementation-plan.mjs', 'authoring-runtime-to-preview-bridge-implementation-plan'],
  ['scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs', 'authoring-runtime-to-preview-bridge'],
];

/** Paths that must NEVER be tolerated, whatever the chronology says. */
const FORBIDDEN_FIXTURES = [
  'src/App.jsx', 'src/pages/Home.jsx', 'src/components/Table.jsx', 'src/modules/studio/index.js',
  'src/ModeloBase1/x.js', 'src/ModeloBase2/y.js', 'backend/server.js', 'prisma/schema.prisma',
  'backend/prisma/schema.prisma', 'migrations/001.sql', 'src/apis/client.js', 'src/framework/core.js',
  'src/bos/home.js', 'src/styles/app.css', 'src/runtime/loadRuntimeBundle.js',
  'scripts/gates/lib/productionUiGuard.mjs',
];

const fixture = JSON.parse(fs.readFileSync(path.join(EV, 'PR495-CHANGED-PATHS.json'), 'utf8'));
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `fnv1a-${h.toString(16).padStart(8, '0')}`;
}

// ===========================================================================
// CATALOG
// ===========================================================================
test('C001 catalog exists and is frozen', () => {
  assert.ok(Array.isArray(STUDIO_SLICE_CATALOG));
  assert.ok(STUDIO_SLICE_CATALOG.length >= 40);
  assert.equal(Object.isFrozen(STUDIO_SLICE_CATALOG), true);
});
test('C002 every slice id is unique', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});
test('C003 every ordinal is unique', () => {
  const ords = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal);
  assert.equal(new Set(ords).size, ords.length);
});
test('C004 every ordinal is a positive integer', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.ok(Number.isInteger(s.sliceOrdinal), s.sliceId);
    assert.ok(s.sliceOrdinal > 0, s.sliceId);
  }
});
test('C005 ordinals form a contiguous 1..N sequence', () => {
  const ords = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b);
  assert.deepEqual(ords, ords.map((_, i) => i + 1));
});
for (const s of STUDIO_SLICE_CATALOG) {
  test(`C010 slice ${s.sliceId} has the exact entry shape`, () => {
    assert.deepEqual(Object.keys(s).sort(), [
      'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'explicitlyAuthorizedForbiddenPatterns',
      'primaryArtifactPatterns', 'sharedGovernancePatterns', 'sliceId', 'sliceOrdinal', 'status', 'title',
    ]);
    assert.equal(typeof s.title, 'string');
    assert.ok(s.title.length > 0);
    assert.equal(typeof s.status, 'string');
    assert.equal(Object.isFrozen(s), true);
  });
  test(`C011 slice ${s.sliceId} declares only anchored patterns`, () => {
    for (const group of ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']) {
      for (const re of s[group]) {
        assert.ok(re instanceof RegExp, `${s.sliceId}.${group}`);
        assert.ok(re.source.startsWith('^'), `${s.sliceId}.${group} ${re.source}`);
      }
    }
  });
  test(`C012 slice ${s.sliceId} declares no broad wildcard`, () => {
    const all = [...s.primaryArtifactPatterns, ...s.branchMarkerPatterns, ...s.crossSliceAuthorizedPatterns,
      ...s.sharedGovernancePatterns, ...s.explicitlyAuthorizedForbiddenPatterns];
    for (const re of all) assert.ok(!FORBIDDEN_BROAD_ALLOW_SOURCES.includes(re.toString()), `${s.sliceId} ${re}`);
    for (const re of all) assert.ok(re.source.length > 8, `${s.sliceId} suspiciously short: ${re.source}`);
  });
  test(`C013 slice ${s.sliceId} branch markers are a subset of its primary artifacts`, () => {
    for (const marker of s.branchMarkerPatterns) {
      assert.ok(s.primaryArtifactPatterns.some((p) => p.toString() === marker.toString()), `${s.sliceId} ${marker}`);
    }
  });
  test(`C014 slice ${s.sliceId} never declares a forbidden path`, () => {
    const probes = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns]
      .map((re) => re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.'));
    for (const probe of probes) {
      assert.ok(!FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(probe)), `${s.sliceId} declares forbidden ${probe}`);
    }
  });
}
test('C020 primary ownership never overlaps between slices', () => {
  const seen = new Map();
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const re of s.primaryArtifactPatterns) {
      const key = re.toString();
      assert.equal(seen.has(key), false, `${key} owned by ${seen.get(key)} and ${s.sliceId}`);
      seen.set(key, s.sliceId);
    }
  }
});
test('C021 findOwningStudioSlices returns at most one slice for every declared path', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const re of s.primaryArtifactPatterns) {
      const probe = re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
      const owners = findOwningStudioSlices(probe);
      assert.ok(owners.length <= 1, `${probe} → ${owners.map((o) => o.sliceId)}`);
      if (owners.length === 1) assert.equal(owners[0].sliceId, s.sliceId);
    }
  }
});
test('C022 the legacy export is DERIVED from the catalog, not hand-maintained', () => {
  const derived = STUDIO_SLICE_CATALOG.flatMap((s) => [
    ...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns,
  ]).map((r) => r.toString());
  assert.deepEqual(KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.map((r) => r.toString()), derived);
});
test('C023 the registry source contains no manually curated known-later array', () => {
  const src = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  assert.match(src, /KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS = Object\.freeze\(\s*\n?\s*STUDIO_SLICE_CATALOG\.flatMap/);
});
for (const required of [
  'studio-scope-governance-maintenance', 'studio-scope-governance-self-guard-fix', 'module-preview-sandbox',
  'authoring-runtime-to-preview-bridge-contract', 'authoring-runtime-to-preview-bridge-implementation-plan',
  'authoring-runtime-to-preview-bridge', 'authoring-runtime-to-preview-bridge-hardening',
  'bridge-to-preview-sandbox-runtime-contract', 'bridge-decision-envelope-identity-contract',
  'bridge-to-preview-sandbox-runtime-implementation-plan', 'bridge-decision-core-envelope-contract',
  'bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
  'bridge-decision-core-envelope-builder-contract',
  'bridge-decision-core-envelope-builder-verification-state-correction',
  'bridge-decision-core-envelope-builder-implementation-plan', 'bridge-decision-core-envelope-builder',
  'studio-scope-governance-chronological-migration',
]) {
  test(`C030 catalog contains the mandatory slice ${required}`, () => {
    assert.ok(getStudioSliceById(required), required);
  });
}
test('C031 getStudioSliceById fails closed on unknown / malformed ids', () => {
  for (const bad of ['nope', '', null, undefined, 1, {}, []]) assert.equal(getStudioSliceById(bad), null);
});
test('C032 getStudioSliceByOrdinal round-trips every catalog entry', () => {
  for (const s of STUDIO_SLICE_CATALOG) assert.equal(getStudioSliceByOrdinal(s.sliceOrdinal).sliceId, s.sliceId);
  for (const bad of [0, -1, 9999, 1.5, '1', null]) assert.equal(getStudioSliceByOrdinal(bad), null);
});
test('C033 chronological order matches the known program sequence', () => {
  const ord = (id) => getStudioSliceById(id).sliceOrdinal;
  assert.ok(ord('module-preview-sandbox') < ord('dev-preview-contract-bridge'));
  assert.ok(ord('dev-preview-app-integration') < ord('module-blueprint-authoring-foundation-contract'));
  assert.ok(ord('module-blueprint-authoring-runtime') < ord('authoring-runtime-to-preview-bridge-contract'));
  assert.ok(ord('authoring-runtime-to-preview-bridge') < ord('bridge-to-preview-sandbox-runtime-contract'));
  assert.ok(ord('bridge-decision-core-envelope-builder-contract') < ord('bridge-decision-core-envelope-builder-implementation-plan'));
  assert.ok(ord('bridge-decision-core-envelope-builder-implementation-plan') < ord(BUILDER));
  assert.ok(ord(BUILDER) < ord(MIGRATION));
});

// ===========================================================================
// BUILDER FUTURE REGISTRATION
// ===========================================================================
const BUILDER_PRIMARY = [
  'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
  'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md',
];
const BUILDER_CROSS = [
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
];
test('B001 the Builder is registered as a future known slice with an open pull request', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.status, 'open_pull_request_495');
  assert.equal(b.primaryArtifactPatterns.length, 4);
});
for (const p of BUILDER_PRIMARY) {
  test(`B002 Builder owns ${p}`, () => {
    assert.deepEqual(findOwningStudioSlices(p).map((s) => s.sliceId), [BUILDER]);
  });
}
for (const p of BUILDER_CROSS) {
  test(`B003 Builder is cross-authorized for ${p} but does not own it`, () => {
    const b = getStudioSliceById(BUILDER);
    assert.ok(b.crossSliceAuthorizedPatterns.some((re) => re.test(p)));
    assert.notDeepEqual(findOwningStudioSlices(p).map((s) => s.sliceId), [BUILDER]);
  });
}
test('B004 the Builder cross list is EXACTLY the two lifecycle paths', () => {
  assert.equal(getStudioSliceById(BUILDER).crossSliceAuthorizedPatterns.length, 2);
});
for (const foreign of [
  'src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js',
  'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs',
  'scripts/gates/g423-studio-module-preview-sandbox-contract.mjs',
  'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js',
  'scripts/gates/lib/studioScopeGovernanceGuard.mjs',
]) {
  test(`B005 the Builder is NOT cross-authorized for ${foreign}`, () => {
    assert.equal(getStudioSliceById(BUILDER).crossSliceAuthorizedPatterns.some((re) => re.test(foreign)), false);
  });
}

// ===========================================================================
// ACTIVE SLICE RESOLUTION
// ===========================================================================
test('A001 the real PR #495 diff resolves exactly one active slice: the Builder', () => {
  const r = resolveActiveStudioSlice(fixture.paths);
  assert.equal(r.ok, true);
  assert.equal(r.sliceId, BUILDER);
  assert.deepEqual(r.candidates, [BUILDER]);
});
test('A002 a migration-shaped diff resolves the migration slice', () => {
  const r = resolveActiveStudioSlice([REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL,
    'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md']);
  assert.equal(r.ok, true);
  assert.equal(r.sliceId, MIGRATION);
});
test('A003 zero markers fails closed', () => {
  const r = resolveActiveStudioSlice(['README.md', 'some/other/file.txt']);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
});
test('A004 two markers is ambiguous and fails closed', () => {
  const r = resolveActiveStudioSlice([
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
    'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md',
  ]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.deepEqual(r.candidates, [BUILDER, MIGRATION].sort());
});
for (const shared of ['package.json', 'package-lock.json', REGISTRY_REL, GUARD_REL]) {
  test(`A005 shared infrastructure alone resolves nothing: ${shared}`, () => {
    assert.equal(resolveActiveStudioSlice([shared]).ok, false);
    assert.equal(findMarkingStudioSlices(shared).length, 0);
  });
}
for (const [testPath] of NINE_TESTS) {
  test(`A006 a migrated test file is not a branch marker: ${path.basename(testPath)}`, () => {
    assert.equal(findMarkingStudioSlices(testPath).length, 0);
  });
}
for (const [gatePath] of TWENTY_TWO_GATES) {
  test(`A007 a migrated gate file is not a branch marker: ${path.basename(gatePath)}`, () => {
    assert.equal(findMarkingStudioSlices(gatePath).length, 0);
  });
}
test('A008 resolveActiveStudioSlice ignores non-path input fail-closed', () => {
  for (const bad of [null, undefined, 'string', 42, {}]) assert.equal(resolveActiveStudioSlice(bad).ok, false);
  assert.equal(resolveActiveStudioSlice([null, '', 7]).ok, false);
});
test('A009 resolution uses no branch name, network, clock or environment', () => {
  const src = fs.readFileSync(path.join(ROOT, GUARD_REL), 'utf8');
  for (const forbidden of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'require(']) {
    assert.ok(!src.includes(forbidden), forbidden);
  }
});

// ===========================================================================
// CHRONOLOGY
// ===========================================================================
const MIGRATION_DIFF = [
  REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, 'package.json',
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md',
  ...NINE_TESTS.map(([p]) => p), ...TWENTY_TWO_GATES.map(([p]) => p),
];
for (const [, callerSliceId] of NINE_TESTS) {
  test(`H001 caller ${callerSliceId} accepts the later migration slice`, () => {
    const r = evaluateStudioBranchScope(MIGRATION_DIFF, { callerSliceId });
    assert.equal(r.activeSliceId, MIGRATION);
    assert.ok(r.activeSliceOrdinal > r.callerSliceOrdinal);
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
}
for (const [, callerSliceId] of TWENTY_TWO_GATES) {
  test(`H002 gate caller ${callerSliceId} accepts the later migration slice`, () => {
    const r = evaluateStudioBranchScope(MIGRATION_DIFF, { callerSliceId });
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
}
test('H010 a NEWER caller rejects an OLDER active slice', () => {
  const olderDiff = ['src/studio/blueprint-engine/module-preview-sandbox/index.js',
    'docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract/CERTIFICATION-REPORT.md'];
  const r = evaluateStudioBranchScope(olderDiff, { callerSliceId: BUILDER });
  assert.equal(r.activeSliceId, 'module-preview-sandbox');
  assert.ok(r.activeSliceOrdinal < r.callerSliceOrdinal);
  assert.ok(r.blockers.includes('active_slice_before_caller'));
  assert.equal(r.safe, false);
});
test('H011 same slice accepts its own artifacts', () => {
  const r = evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER });
  assert.equal(r.activeSliceId, BUILDER);
  assert.equal(r.callerSliceOrdinal, r.activeSliceOrdinal);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
test('H012 an unknown caller blocks', () => {
  for (const bad of ['nope', '', null, undefined]) {
    const r = evaluateStudioBranchScope(fixture.paths, { callerSliceId: bad });
    assert.equal(r.callerSliceId, null);
    assert.ok(r.blockers.includes('unknown_caller_slice'));
    assert.equal(r.safe, false);
  }
});
test('H013 an unresolved active slice blocks', () => {
  const r = evaluateStudioBranchScope(['README.md'], { callerSliceId: BUILDER });
  assert.ok(r.blockers.includes('no_active_slice_resolved'));
  assert.equal(r.safe, false);
});
test('H014 an ambiguous active slice blocks', () => {
  const r = evaluateStudioBranchScope([
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
    'src/studio/blueprint-engine/module-preview-sandbox/index.js',
  ], { callerSliceId: 'module-preview-sandbox' });
  assert.ok(r.blockers.includes('ambiguous_active_slice'));
  assert.equal(r.safe, false);
});
test('H015 evaluation is deterministic and order-independent', () => {
  const a = evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER });
  const b = evaluateStudioBranchScope([...fixture.paths].reverse(), { callerSliceId: BUILDER });
  assert.deepEqual(a, b);
});
test('H016 the evaluation report carries the full deterministic shape', () => {
  const r = evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER });
  assert.deepEqual(Object.keys(r).sort(), [
    'activeCandidates', 'activeSliceId', 'activeSliceOrdinal', 'allowed', 'backendAccessed', 'blockers',
    'callerSliceId', 'callerSliceOrdinal', 'chronologicalViolation', 'crossAuthorized',
    'explicitForbiddenAuthorized', 'fetchUsed', 'forbidden', 'kind', 'mutationAllowed', 'prismaAccessed',
    'safe', 'sideEffects', 'total', 'unknown',
  ]);
  assert.equal(r.kind, 'studio-branch-scope-evaluation');
  assert.equal(r.sideEffects, false);
  assert.equal(r.backendAccessed, false);
  assert.equal(r.prismaAccessed, false);
  assert.equal(r.fetchUsed, false);
  assert.equal(r.mutationAllowed, false);
});

// ===========================================================================
// CROSS-SLICE AUTHORIZATION
// ===========================================================================
for (const p of BUILDER_CROSS) {
  test(`X001 Builder admits its lifecycle path via cross authorization: ${path.basename(p)}`, () => {
    const r = evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
    assert.ok(r.crossAuthorized.includes(p));
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
}
for (const foreign of [
  'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js',
  'scripts/gates/g423-studio-dev-preview-route-menu.mjs',
  'src/runtime/__tests__/studio-scope-governance-maintenance.test.js',
]) {
  test(`X002 Builder rejects a third prior test/gate: ${path.basename(foreign)}`, () => {
    const r = evaluateStudioBranchScope([...fixture.paths, foreign], { callerSliceId: BUILDER });
    assert.ok(r.chronologicalViolation.includes(foreign));
    assert.equal(r.safe, false);
  });
}
for (const [p] of NINE_TESTS) {
  test(`X003 migration is cross-authorized for the migrated test ${path.basename(p)}`, () => {
    const m = getStudioSliceById(MIGRATION);
    assert.ok(m.crossSliceAuthorizedPatterns.some((re) => re.test(p)));
  });
}
for (const [p] of TWENTY_TWO_GATES) {
  test(`X004 migration is cross-authorized for the migrated gate ${path.basename(p)}`, () => {
    const m = getStudioSliceById(MIGRATION);
    assert.ok(m.crossSliceAuthorizedPatterns.some((re) => re.test(p)));
  });
}
/** Artifacts outside the primary nine + twenty-two whose substring heuristics collide with this slice's own
 * mandated name, with the route-menu gate file names, or with the guard file this slice owns. */
const EXTENSION_TESTS = ['empresas-certified-blueprint-mirror-alignment-audit', 'empresas-local-read-contract-certification',
  'empresas-local-read-only-contract-pilot', 'empresas-local-read-parity-hardening', 'empresas-studio-compatibility-slice-1',
  'post-foundation-c-empresas-controlled-production-test-plan', 'post-foundation-c-studio-foundation-audit',
  'studio-authoring-runtime-to-preview-bridge-hardening', 'studio-authoring-runtime-to-preview-bridge-source-shape-alignment',
  'studio-blueprint-contract-certification', 'studio-blueprint-contract-hardening', 'studio-blueprint-engine-foundation',
  'studio-blueprint-module-reference-planner', 'studio-bridge-decision-envelope-identity-contract',
  'studio-bridge-to-preview-sandbox-runtime-contract', 'studio-foundation-contracts', 'studio-module-preview-sandbox-contract',
].map((n) => `src/runtime/__tests__/${n}.test.js`);
const EXTENSION_GATES = ['g423-studio-blueprint-engine-foundation', 'g423-studio-blueprint-module-reference-planner',
  'g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment', 'g423-studio-authoring-runtime-to-preview-bridge-hardening',
  'g423-studio-bridge-to-preview-sandbox-runtime-contract', 'g423-studio-bridge-decision-envelope-identity-contract',
  'g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan', 'g423-studio-bridge-decision-core-envelope-contract',
  'g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
  'g423-studio-bridge-decision-core-envelope-builder-contract', 'g423-studio-bridge-decision-core-envelope-builder-implementation-plan',
].map((n) => `scripts/gates/${n}.mjs`);
test('X005 the migration cross list is EXACTLY the artifacts it migrates', () => {
  const m = getStudioSliceById(MIGRATION);
  assert.equal(m.crossSliceAuthorizedPatterns.length,
    NINE_TESTS.length + TWENTY_TWO_GATES.length + 2 + EXTENSION_TESTS.length + EXTENSION_GATES.length);
});
for (const p of [...EXTENSION_TESTS, ...EXTENSION_GATES]) {
  test(`X008 migration declares the extension artifact exactly: ${path.basename(p)}`, () => {
    assert.ok(getStudioSliceById(MIGRATION).crossSliceAuthorizedPatterns.some((re) => re.test(p)), p);
  });
  test(`X009 only a governance slice may cross-authorize the extension artifact: ${path.basename(p)}`, () => {
    for (const s of STUDIO_SLICE_CATALOG) {
      if (s.sliceId.startsWith('studio-scope-governance-')) continue;
      // The Builder's own two declared lifecycle paths are its legitimate, separately proven authorization.
      if (s.sliceId === BUILDER && BUILDER_CROSS.includes(p)) continue;
      assert.equal(s.crossSliceAuthorizedPatterns.some((re) => re.test(p)), false, `${s.sliceId} ${p}`);
    }
  });
}
test('X010 the declared extension is documented, not silent', () => {
  const doc = readEv('REQUIRED-SCOPE-EXTENSION.md');
  assert.ok(doc.length > 400);
  assert.match(doc, /REQUIRED-SCOPE-EXTENSION|extens/i);
  for (const p of [...EXTENSION_TESTS, ...EXTENSION_GATES]) {
    assert.ok(doc.includes(path.basename(p).replace(/\.(test\.js|mjs)$/, '')), p);
  }
});
test('X006 a cross authorization is never inherited by another slice', () => {
  const migrated = 'scripts/gates/g423-studio-dev-preview-route-menu.mjs';
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.sliceId === MIGRATION) continue;
    assert.equal(s.crossSliceAuthorizedPatterns.some((re) => re.test(migrated)), false, s.sliceId);
  }
});
test('X007 a cross authorization never releases a forbidden path', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const re of s.crossSliceAuthorizedPatterns) {
      const probe = re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
      assert.ok(!FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(probe)), `${s.sliceId} ${probe}`);
    }
  }
});

// ===========================================================================
// SECURITY — forbidden and unknown fail closed
// ===========================================================================
for (const p of FORBIDDEN_FIXTURES) {
  test(`S001 forbidden path is classified forbidden: ${p}`, () => {
    assert.equal(classifyStudioScopePath(p), 'forbidden_scope');
  });
  test(`S002 forbidden path blocks every caller: ${p}`, () => {
    const r = evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
    assert.ok(r.forbidden.includes(p));
    assert.ok(r.blockers.includes('forbidden_scope'));
    assert.equal(r.safe, false);
  });
  test(`S003 catalog membership never releases the forbidden path: ${p}`, () => {
    assert.equal(isKnownLaterStudioHeadlessArtifact(p), false);
  });
}
test('S004 the ONLY explicit forbidden authorization is the app-integration slice pair', () => {
  assert.equal(STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.length, 2);
  const withAuth = STUDIO_SLICE_CATALOG.filter((s) => s.explicitlyAuthorizedForbiddenPatterns.length > 0);
  assert.deepEqual(withAuth.map((s) => s.sliceId), ['dev-preview-app-integration']);
  assert.equal(withAuth[0].explicitlyAuthorizedForbiddenPatterns.length, 2);
});
test('S005 the derived export mirrors the catalog entry exactly', () => {
  const entry = getStudioSliceById('dev-preview-app-integration');
  assert.deepEqual(STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.map(String),
    entry.explicitlyAuthorizedForbiddenPatterns.map(String));
  assert.deepEqual(getExplicitlyAuthorizedForbiddenPatternsForStudioSlice('dev-preview-app-integration').map(String),
    entry.explicitlyAuthorizedForbiddenPatterns.map(String));
});
for (const p of ['some/random/file.js', 'tools/x.mjs', 'src/whatever/unregistered.js', 'docs/notes.txt']) {
  test(`S006 unknown path fails closed: ${p}`, () => {
    const r = evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
    assert.ok(r.unknown.includes(p) || r.chronologicalViolation.includes(p));
    assert.equal(r.safe, false);
  });
}
test('S007 legacy helpers still fail closed on forbidden and unknown', () => {
  assert.deepEqual(filterForbiddenScopePaths(['src/App.jsx', 'package.json']), ['src/App.jsx']);
  assert.deepEqual(filterUnknownScopePaths(['some/random/file.js', 'package.json']), ['some/random/file.js']);
  assert.throws(() => assertNoForbiddenScopePaths(['backend/server.js']), /forbidden scope paths detected/);
  assert.equal(createStudioScopeGovernanceReport(['src/App.jsx']).blocked, true);
  assert.equal(createStudioScopeGovernanceReport(['package.json']).safe, true);
});
test('S008 the guard imports only the registry and no production code', () => {
  const src = fs.readFileSync(path.join(ROOT, GUARD_REL), 'utf8');
  const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(imports)], ['./studioScopeGovernanceRegistry.mjs']);
});
test('S009 the registry is pure data with no imports and no I/O', () => {
  const src = fs.readFileSync(path.join(ROOT, REGISTRY_REL), 'utf8');
  assert.equal(/^import /m.test(src), false);
  for (const forbidden of ['execSync', 'readFileSync', 'fetch(', 'process.env']) assert.ok(!src.includes(forbidden), forbidden);
});

// ===========================================================================
// REAL PR #495 DIFF VALIDATION (read-only fixture + digest)
// ===========================================================================
test('P001 the fixture records the real PR #495 diff read-only', () => {
  assert.equal(fixture.kind, 'pr495-real-diff-fixture');
  assert.equal(fixture.capturedReadOnly, true);
  assert.equal(fixture.baseSha, '73d298e09fea349f9bc836555360d6adcb74655c');
  assert.equal(fixture.headSha, '9634c3643541248d4b272813161b489b85fd8692');
});
test('P002 the fixture digest is reproducible', () => {
  assert.equal(fixture.pathCount, fixture.paths.length);
  assert.equal(fnv1a([...fixture.paths].sort().join('\n')), fixture.digest);
});
test('P003 the fixture is not empty and is not the empty-diff trick', () => {
  assert.ok(fixture.pathCount >= 80, `${fixture.pathCount}`);
  assert.notEqual(fixture.baseSha, fixture.headSha);
});
test('P004 active slice on the real PR #495 diff is the Builder', () => {
  assert.equal(resolveActiveStudioSlice(fixture.paths).sliceId, BUILDER);
});
test('P005 the Builder ordinal is greater than every one of the nine callers', () => {
  const builderOrdinal = getStudioSliceById(BUILDER).sliceOrdinal;
  for (const [, callerSliceId] of NINE_TESTS) {
    assert.ok(builderOrdinal > getStudioSliceById(callerSliceId).sliceOrdinal, callerSliceId);
  }
});
for (const [, callerSliceId] of NINE_TESTS) {
  test(`P006 caller ${callerSliceId} is safe on the real PR #495 diff`, () => {
    const r = evaluateStudioBranchScope(fixture.paths, { callerSliceId });
    assert.equal(r.activeSliceId, BUILDER);
    assert.deepEqual(r.forbidden, []);
    assert.deepEqual(r.unknown, []);
    assert.deepEqual(r.chronologicalViolation, []);
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
}
for (const [, callerSliceId] of TWENTY_TWO_GATES) {
  test(`P007 gate caller ${callerSliceId} is safe on the real PR #495 diff`, () => {
    assert.equal(evaluateStudioBranchScope(fixture.paths, { callerSliceId }).safe, true);
  });
}
test('P008 the real PR #495 diff has zero forbidden and zero unknown paths', () => {
  const r = evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER });
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.equal(r.allowed.length, fixture.pathCount);
});
test('P009 the two lifecycle paths in the real diff are admitted by cross authorization', () => {
  const r = evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER });
  for (const p of BUILDER_CROSS) {
    assert.ok(fixture.paths.includes(p), p);
    assert.ok(r.crossAuthorized.includes(p), p);
  }
});

// ===========================================================================
// MIGRATED ARTIFACTS
// ===========================================================================
for (const [p, callerSliceId] of NINE_TESTS) {
  test(`M001 migrated test ${path.basename(p)} declares its caller slice and uses the caller-aware API`, () => {
    const src = fs.readFileSync(path.join(ROOT, p), 'utf8');
    assert.ok(src.includes(`const CALLER_SLICE_ID = '${callerSliceId}';`), p);
    assert.ok(src.includes('evaluateStudioBranchScope('), p);
  });
  test(`M002 migrated test ${path.basename(p)} keeps no local temporal allowlist`, () => {
    const src = fs.readFileSync(path.join(ROOT, p), 'utf8');
    assert.ok(!/no prior gate\/test altered'[^\n]*isKnownLaterStudioHeadlessArtifact/.test(src), p);
  });
}
for (const [p, callerSliceId] of TWENTY_TWO_GATES) {
  test(`M003 migrated gate ${path.basename(p)} declares its caller slice and uses the caller-aware API`, () => {
    const src = fs.readFileSync(path.join(ROOT, p), 'utf8');
    assert.ok(src.includes(`const CALLER_SLICE_ID = '${callerSliceId}';`), p);
    assert.ok(src.includes('evaluateStudioBranchScope('), p);
  });
}
test('M004 exactly nine tests and twenty-two gates are migrated', () => {
  assert.equal(NINE_TESTS.length, 9);
  assert.equal(TWENTY_TWO_GATES.length, 22);
});
test('M005 productionUiGuard is NOT touched by this slice', () => {
  const m = getStudioSliceById(MIGRATION);
  const all = [...m.primaryArtifactPatterns, ...m.crossSliceAuthorizedPatterns, ...m.sharedGovernancePatterns];
  assert.equal(all.some((re) => re.test('scripts/gates/lib/productionUiGuard.mjs')), false);
});
test('M006 no Studio blueprint-engine source is in this slice scope', () => {
  const m = getStudioSliceById(MIGRATION);
  const all = [...m.primaryArtifactPatterns, ...m.crossSliceAuthorizedPatterns, ...m.sharedGovernancePatterns];
  assert.equal(all.some((re) => re.test('src/studio/blueprint-engine/module-preview-sandbox/index.js')), false);
  assert.equal(all.some((re) => re.test('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js')), false);
});

// ===========================================================================
// LEGACY PRE-STUDIO GATES — documented, not migrated, not masked
// ===========================================================================
test('L001 the twenty-one pre-Studio gates are declared not migrated', () => {
  assert.equal(LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.length, 21);
});
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  test(`L002 pre-Studio gate is outside the Studio catalog: ${path.basename(g)}`, () => {
    assert.equal(findOwningStudioSlices(g).length, 0);
    const src = fs.readFileSync(path.join(ROOT, g), 'utf8');
    assert.ok(!src.includes('evaluateStudioBranchScope('), `${g} must NOT be migrated by this slice`);
  });
}
test('L003 the decision is documented, not silently passed', () => {
  const doc = readEv('LEGACY-PRE-STUDIO-GATE-DECISION.md');
  assert.match(doc, /LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED/);
  assert.match(doc, /não.*PASS|not.*PASS/i);
  assert.equal(LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.every((g) => doc.includes(path.basename(g, '.mjs'))), true);
});

// ===========================================================================
// SLICE ARTIFACTS + EVIDENCE
// ===========================================================================
test('E001 this slice ships its own test, gate and evidence directory', () => {
  assert.ok(exists(TEST_REL));
  assert.ok(exists(GATE_REL));
  assert.ok(fs.existsSync(EV));
});
for (const doc of ['CERTIFICATION-REPORT.md', 'SLICE-CATALOG.md', 'ORDINAL-MAPPING.md', 'ACTIVE-SLICE-RESOLUTION.md',
  'CALLER-AWARE-CLASSIFICATION.md', 'CROSS-SLICE-AUTHORIZATION.md', 'NINE-ACTIVE-TEST-MIGRATION.md',
  'TWENTY-TWO-STUDIO-GATE-MIGRATION.md', 'LEGACY-PRE-STUDIO-GATE-DECISION.md', 'PR495-REAL-DIFF-VALIDATION.md',
  'FORBIDDEN-UNKNOWN-FAIL-CLOSED.md', 'REGRESSION-MATRIX.md', 'READINESS.md', 'NEXT-PR495-REVALIDATION.md',
  'REQUIRED-SCOPE-EXTENSION.md']) {
  test(`E002 evidence present and non-trivial: ${doc}`, () => {
    const body = readEv(doc);
    assert.ok(body.length > 200, doc);
  });
}
test('E003 no new dependency was added', () => {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const keys = (p) => [...Object.keys(p.dependencies ?? {}), ...Object.keys(p.devDependencies ?? {})].sort().join(',');
  assert.equal(keys(base), keys(head));
});
test('E004 package.json wires this slice test and gate', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.ok(pkg.scripts['test:runtime:studio-scope-governance-chronological-migration']);
  assert.ok(pkg.scripts['gate:g423-studio-scope-governance-chronological-migration']);
  assert.ok(pkg.scripts['test:runtime'].includes('studio-scope-governance-chronological-migration'));
});

// ===========================================================================
// THIS BRANCH — the migration evaluated by its own rules
// ===========================================================================
const changedOnThisBranch = () => {
  try { return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); }
  catch { return null; }
};
test('T001 this branch resolves the migration as the active slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = resolveActiveStudioSlice(f);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.sliceId, MIGRATION);
});
test('T002 this branch is safe for the migration slice itself', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = evaluateStudioBranchScope(f, { callerSliceId: MIGRATION });
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
for (const [, callerSliceId] of NINE_TESTS) {
  test(`T003 this branch is safe for caller ${callerSliceId}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(evaluateStudioBranchScope(f, { callerSliceId }).safe, true);
  });
}
test('T004 this branch touches no production code and no Builder file', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) {
    assert.equal(classifyStudioScopePath(p) === 'forbidden_scope', false, p);
    assert.ok(!p.startsWith('src/studio/blueprint-engine/'), p);
  }
});

// ===========================================================================
// POST-AUDIT — explicit forbidden bound to the catalog
// ===========================================================================
const APP_INTEGRATION = 'dev-preview-app-integration';
const APP_INTEGRATION_FIXTURE = [
  'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
  'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/CERTIFICATION-REPORT.md',
  'src/App.jsx',
  'scripts/gates/lib/productionUiGuard.mjs',
];
for (const s of STUDIO_SLICE_CATALOG) {
  test(`F001 slice ${s.sliceId} declares explicitlyAuthorizedForbiddenPatterns`, () => {
    assert.ok(Array.isArray(s.explicitlyAuthorizedForbiddenPatterns), s.sliceId);
    assert.equal(Object.isFrozen(s), true);
  });
  test(`F002 slice ${s.sliceId} declares the expected number of explicit forbidden entries`, () => {
    assert.equal(s.explicitlyAuthorizedForbiddenPatterns.length, s.sliceId === APP_INTEGRATION ? 2 : 0, s.sliceId);
  });
  for (const re of s.explicitlyAuthorizedForbiddenPatterns) {
    test(`F003 ${s.sliceId} explicit forbidden pattern is anchored and truly forbidden: ${re}`, () => {
      assert.ok(re.source.startsWith('^') && re.source.endsWith('$'), `${re}`);
      const probe = re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
      assert.ok(FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(probe)), `${probe} must really be forbidden`);
      assert.equal(FORBIDDEN_BROAD_ALLOW_SOURCES.includes(re.toString()), false);
    });
  }
}
test('F010 only ONE slice in the whole catalog authorizes any forbidden path', () => {
  assert.deepEqual(STUDIO_SLICE_CATALOG.filter((s) => s.explicitlyAuthorizedForbiddenPatterns.length > 0)
    .map((s) => s.sliceId), [APP_INTEGRATION]);
});
test('F011 the App Integration fixture is ENTIRELY safe for its own slice', () => {
  const r = evaluateStudioBranchScope(APP_INTEGRATION_FIXTURE, { callerSliceId: APP_INTEGRATION });
  assert.equal(r.activeSliceId, APP_INTEGRATION);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.allowed.length, 4);
  assert.deepEqual(r.explicitForbiddenAuthorized,
    ['scripts/gates/lib/productionUiGuard.mjs', 'src/App.jsx']);
});
for (const p of ['src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs']) {
  test(`F012 authorized forbidden path lands in allowed, never in unknown: ${p}`, () => {
    const r = evaluateStudioBranchScope(APP_INTEGRATION_FIXTURE, { callerSliceId: APP_INTEGRATION });
    assert.ok(r.allowed.includes(p), p);
    assert.equal(r.unknown.includes(p), false, p);
    assert.equal(r.forbidden.includes(p), false, p);
  });
}
for (const otherCaller of ['module-preview-sandbox', 'dev-preview-route-menu', 'dev-preview-app-integration-contract']) {
  test(`F013 an EARLIER caller still sees the App Integration fixture as safe: ${otherCaller}`, () => {
    const r = evaluateStudioBranchScope(APP_INTEGRATION_FIXTURE, { callerSliceId: otherCaller });
    assert.ok(r.activeSliceOrdinal >= r.callerSliceOrdinal, otherCaller);
    assert.deepEqual(r.forbidden, []);
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
}
for (const laterCaller of ['authoring-runtime-to-preview-bridge', BUILDER]) {
  test(`F013b a LATER caller still refuses the older active slice: ${laterCaller}`, () => {
    const r = evaluateStudioBranchScope(APP_INTEGRATION_FIXTURE, { callerSliceId: laterCaller });
    // The forbidden pair is still authorized by the ACTIVE slice, but chronology blocks the branch.
    assert.deepEqual(r.forbidden, []);
    assert.ok(r.blockers.includes('active_slice_before_caller'));
    assert.equal(r.safe, false);
  });
}
test('F014 the Builder as active slice does NOT inherit the App.jsx authorization', () => {
  const r = evaluateStudioBranchScope([...fixture.paths, 'src/App.jsx'], { callerSliceId: BUILDER });
  assert.equal(r.activeSliceId, BUILDER);
  assert.deepEqual(r.forbidden, ['src/App.jsx']);
  assert.deepEqual(r.explicitForbiddenAuthorized, []);
  assert.equal(r.safe, false);
});
test('F015 the Migration as active slice does NOT inherit the App.jsx authorization', () => {
  const r = evaluateStudioBranchScope([
    'scripts/gates/lib/studioScopeGovernanceRegistry.mjs',
    'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md',
    'src/App.jsx',
  ], { callerSliceId: MIGRATION });
  assert.equal(r.activeSliceId, MIGRATION);
  assert.deepEqual(r.forbidden, ['src/App.jsx']);
  assert.equal(r.safe, false);
});
test('F016 a caller CANNOT inject a wide forbidden regex', () => {
  const injections = [{ explicitlyAuthorizedForbiddenPatterns: [/.*/] }, { explicitlyAuthorizedForbidden: [/.*/] },
    { explicitlyAuthorizedForbiddenPatterns: [/^src\/App\.jsx$/] }, { ownSliceAuthorized: [/.*/] }];
  for (const inject of injections) {
    const r = evaluateStudioBranchScope([...fixture.paths, 'src/App.jsx'], { callerSliceId: BUILDER, ...inject });
    assert.deepEqual(r.forbidden, ['src/App.jsx'], JSON.stringify(inject));
    assert.equal(r.safe, false);
  }
});
test('F017 evaluateStudioBranchScope reads no caller-supplied forbidden option at all', () => {
  const src = fs.readFileSync(path.join(ROOT, GUARD_REL), 'utf8');
  const body = src.slice(src.indexOf('export function evaluateStudioBranchScope'));
  assert.ok(!/o\.explicitlyAuthorizedForbidden/.test(body), 'no caller-supplied forbidden option may be read');
  assert.match(body, /activeSlice\.explicitlyAuthorizedForbiddenPatterns/);
});
for (const third of ['src/pages/Home.jsx', 'backend/server.js', 'src/modules/x/index.js', 'migrations/001.sql']) {
  test(`F018 a THIRD forbidden path is not authorized for App Integration: ${third}`, () => {
    const r = evaluateStudioBranchScope([...APP_INTEGRATION_FIXTURE, third], { callerSliceId: APP_INTEGRATION });
    assert.deepEqual(r.forbidden, [third]);
    assert.equal(r.safe, false);
  });
}
test('F019 an unresolved active slice authorizes no forbidden path at all', () => {
  const r = evaluateStudioBranchScope(['src/App.jsx', 'README.md'], { callerSliceId: APP_INTEGRATION });
  assert.deepEqual(r.forbidden, ['src/App.jsx']);
  assert.deepEqual(r.explicitForbiddenAuthorized, []);
  assert.equal(r.safe, false);
});
test('F020 the helpers read the catalog and nothing else', () => {
  assert.deepEqual(getExplicitlyAuthorizedForbiddenPatternsForStudioSlice('nope'), []);
  assert.deepEqual(getAuthorizedPatternsForStudioSlice('nope'), []);
  assert.equal(isPathAuthorizedForStudioSlice('src/App.jsx', 'nope'), false);
  assert.equal(isPathAuthorizedForStudioSlice(null, MIGRATION), false);
});

// ===========================================================================
// POST-AUDIT — historical substring semantics preserved
// ===========================================================================
/** Paths that merely LOOK like a migration/menu/empresas artifact but are catalogued nowhere. */
const SIMILAR_UNREGISTERED = [
  'docs/random-migration-plan.md',
  'tools/custom-migration-helper.js',
  'config/menu.json',
  'tools/navigation-generator.js',
  'scripts/gates/g423-unregistered-route-menu.mjs',
  'src/runtime/__tests__/unlisted-empresas-change.test.js',
  'scripts/gates/g423-unlisted-empresas-change.mjs',
  'docs/evidence/unregistered-empresas-change/file.md',
];
for (const p of SIMILAR_UNREGISTERED) {
  test(`Hx01 similar but uncatalogued path is authorized for NOBODY: ${p}`, () => {
    for (const s of STUDIO_SLICE_CATALOG) {
      assert.equal(isPathAuthorizedForStudioSlice(p, s.sliceId), false, `${s.sliceId} ${p}`);
    }
  });
  test(`Hx02 similar but uncatalogued path blocks on a migration branch: ${p}`, () => {
    const r = evaluateStudioBranchScope([REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL,
      'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md', p],
    { callerSliceId: MIGRATION });
    assert.equal(r.activeSliceId, MIGRATION);
    assert.ok(r.unknown.includes(p) || r.forbidden.includes(p), p);
    assert.equal(r.safe, false, p);
  });
}
for (const p of [...NINE_TESTS.map(([x]) => x), ...TWENTY_TWO_GATES.map(([x]) => x)]) {
  test(`Hx03 an EXACT migration-authorized path is authorized ONLY for the migration: ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, MIGRATION), true, p);
    for (const s of STUDIO_SLICE_CATALOG) {
      if (s.sliceId === MIGRATION) continue;
      if (s.sliceId === 'studio-scope-governance-maintenance') continue; // its own earlier, separately proven wiring
      if (s.sliceId === BUILDER && BUILDER_CROSS.includes(p)) continue;  // the Builder's own lifecycle pair
      const owns = findOwningStudioSlices(p).some((o) => o.sliceId === s.sliceId);
      if (owns) continue; // a slice is always authorized for what it owns
      assert.equal(isPathAuthorizedForStudioSlice(p, s.sliceId), false, `${s.sliceId} ${p}`);
    }
  });
}
test('Hx04 the historical checks keep their ORIGINAL regex, exempting only exact migration paths', () => {
  const files = [
    ['src/runtime/__tests__/empresas-certified-blueprint-mirror-alignment-audit.test.js', /!\/migration\/i\.test\(x\)/],
    ['src/runtime/__tests__/empresas-certified-blueprint-mirror-alignment-audit.test.js', /!\/menu\|nav\/i\.test\(x\)/],
    ['src/runtime/__tests__/studio-blueprint-engine-foundation.test.js', /!\/migration\/i\.test\(x\)/],
    ['src/runtime/__tests__/studio-dev-preview-app-integration.test.js', /!\/empresas\/i\.test\(x\)/],
  ];
  for (const [rel, re] of files) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.match(src, re, rel);
    assert.match(src, /migrationExempt\(/, rel);
    assert.match(src, /isPathAuthorizedForStudioSlice/, rel);
  }
});
test('Hx05 no historical check was relaxed to a whole category', () => {
  for (const rel of [...EXTENSION_TESTS, 'src/runtime/__tests__/studio-dev-preview-app-integration.test.js']) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    // No blanket "any test / any gate / any evidence / anything outside src" escape hatch.
    assert.ok(!/!\/\^src\\\/runtime\\\/__tests__\\\/\/\.test\(f\)/.test(src), rel);
    assert.ok(!/\/\^src\\\/\.\*\(menu\|nav\)\/i/.test(src), rel);
  }
});
test('Hx06 the exemption is inert when the active slice is not the migration', () => {
  // A Builder-shaped branch carrying a migration-authorized path: the exemption must not apply.
  const r = evaluateStudioBranchScope([...fixture.paths,
    'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js'], { callerSliceId: BUILDER });
  assert.equal(r.activeSliceId, BUILDER);
  assert.ok(r.chronologicalViolation.includes('src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js'));
  assert.equal(r.safe, false);
});

// ===========================================================================
// POST-AUDIT — DB migration patterns really block
// ===========================================================================
for (const p of ['migrations/001.sql', 'nested/migrations/001.sql', 'prisma/migrations/20240101_init/migration.sql',
  'backend/prisma/migrations/x/migration.sql', 'db/migrations/002.sql', 'anything.sql', 'src/db/migrate.sql',
  'scripts/migrateUsers.js', 'scripts/migrate-all.mjs', 'tools/migrate.ts', 'prisma/schema.prisma']) {
  test(`Hx10 real DB migration artifact is forbidden: ${p}`, () => {
    assert.equal(classifyStudioScopePath(p), 'forbidden_scope', p);
  });
}
test('Hx11 the catalogued governance migration name is allowed by OWNERSHIP, not by a loosened pattern', () => {
  const own = 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md';
  assert.equal(classifyStudioScopePath(own), 'known_later_studio_headless_artifact');
  assert.deepEqual(findOwningStudioSlices(own).map((s) => s.sliceId), [MIGRATION]);
});
test('Hx12 a random uncatalogued migration filename is unknown and unsafe', () => {
  for (const p of ['docs/random-migration-plan.md', 'tools/custom-migration-helper.js']) {
    assert.equal(classifyStudioScopePath(p), 'unknown_scope', p);
    const r = evaluateStudioBranchScope([REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL,
      'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md', p],
    { callerSliceId: MIGRATION });
    assert.equal(r.safe, false, p);
    assert.ok(r.unknown.includes(p), p);
  }
});
