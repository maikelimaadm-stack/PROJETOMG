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
  BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, findOwningStudioSlices, resolveActiveStudioSlice,
  classifyStudioScopePath, evaluateStudioBranchScope, evaluateStudioBranchDiffScope,
  evaluateStudioBranchConsumerScope, createResolvedActiveStudioSlicePathAuthorizer,
  isPathAuthorizedForStudioSlice,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const EV_REL = 'docs/evidence/post-foundation-c-studio-builder-lifecycle-normalization/';
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readEv = (n) => readSrc(`${EV_REL}${n}`);

const NORMALIZATION = BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID;
const CONSUMERS = HISTORICAL_BRANCH_CONSUMERS_SLICE_ID;
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const MAINTENANCE = 'studio-scope-governance-maintenance';
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';

const TEST_REL = 'src/runtime/__tests__/studio-builder-lifecycle-normalization.test.js';
const GATE_REL = 'scripts/gates/g423-studio-builder-lifecycle-normalization.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

/** The six governance consumers whose lifecycle expectations this slice updates. */
const SIX_CONSUMERS = [
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
  'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js',
  'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs',
];

/** Representative diffs of merged slices. None may be reopened by a later consumer. */
const FIXTURE = {
  41: ['src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
    'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md',
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
    'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs'],
  24: ['src/studio/blueprint-engine/dev-preview-app-integration/index.js',
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/CERTIFICATION-REPORT.md',
    'src/runtime/__tests__/studio-dev-preview-app-integration.test.js',
    'scripts/gates/g423-studio-dev-preview-app-integration.mjs'],
  42: ['docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
    'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
    'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs'],
  43: ['docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
    'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
    'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs'],
  44: ['docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
    'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js',
    'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs'],
};

/** A minimal diff that resolves THIS slice. */
const OWN_DIFF = [REGISTRY_REL, TEST_REL, GATE_REL, `${EV_REL}READINESS.md`, 'package.json'];

const MARKER = {
  24: 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  41: 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md',
  44: 'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
  45: `${EV_REL}READINESS.md`,
};

const changedOnThisBranch = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { return null; }
};

// ===========================================================================
// R — the catalog after normalization
// ===========================================================================
test('R001 the catalog holds forty-five slices', () => assert.equal(STUDIO_SLICE_CATALOG.length, 45));
test('R002 slice ids stay unique', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});
test('R003 ordinals are unique, positive integers', () => {
  const o = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal);
  assert.equal(new Set(o).size, o.length);
  assert.ok(o.every((x) => Number.isInteger(x) && x > 0));
});
test('R004 ordinals are contiguous 1..45', () => {
  const o = [...STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal)].sort((a, b) => a - b);
  assert.deepEqual(o, Array.from({ length: 45 }, (_, i) => i + 1));
});
test('R005 every entry declares the same ten keys', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.deepEqual(Object.keys(s).sort(), [
      'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'explicitlyAuthorizedForbiddenPatterns',
      'historicalBranchConsumerCompatibility', 'primaryArtifactPatterns', 'sharedGovernancePatterns',
      'sliceId', 'sliceOrdinal', 'status', 'title',
    ], s.sliceId);
  }
});
test('R006 exactly one slice is active, and it is this one', () => {
  assert.deepEqual(STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').map((s) => s.sliceId),
    [NORMALIZATION]);
});
test('R007 this slice is ordinal 45', () => assert.equal(getStudioSliceById(NORMALIZATION).sliceOrdinal, 45));
test('R008 slice 44 is merged', () => {
  const s = getStudioSliceById(CONSUMERS);
  assert.equal(s.sliceOrdinal, 44);
  assert.equal(s.status, 'merged');
});
test('R009 the Builder is merged', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.sliceOrdinal, 41);
  assert.equal(b.status, 'merged');
});
test('R010 the Builder carries no historical branch consumer authorization', () => {
  assert.equal(getStudioSliceById(BUILDER).historicalBranchConsumerCompatibility, false);
});
test('R011 ZERO slices carry the authorization', () => {
  assert.deepEqual(STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility).map((s) => s.sliceId), []);
});
test('R012 the authorization is a boolean on every entry', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.equal(typeof s.historicalBranchConsumerCompatibility, 'boolean', s.sliceId);
  }
});
test('R013 no merged slice is authorized', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.status === 'merged') assert.equal(s.historicalBranchConsumerCompatibility, false, s.sliceId);
  }
});
test('R014 no slice at all is left in a pull-request status', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.equal(/open_pull_request/.test(s.status), false, `${s.sliceId}: ${s.status}`);
  }
});
test('R015 the Builder keeps its historical scope: 4 primary, 8 cross, 0 explicit forbidden', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.primaryArtifactPatterns.length, 4);
  assert.equal(b.crossSliceAuthorizedPatterns.length, 8);
  assert.equal(new Set(b.crossSliceAuthorizedPatterns.map((r) => r.source)).size, 8);
  assert.deepEqual(b.explicitlyAuthorizedForbiddenPatterns, []);
});
test('R016 the Builder cross list is still the exact eight paths', () => {
  const b = getStudioSliceById(BUILDER);
  for (const p of [
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
    'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
    ...SIX_CONSUMERS,
  ]) assert.ok(b.crossSliceAuthorizedPatterns.some((r) => r.test(p)), p);
});
test('R017 this slice primary is exactly three anchored patterns', () => {
  assert.deepEqual(getStudioSliceById(NORMALIZATION).primaryArtifactPatterns.map((r) => r.source), [
    '^src\\/runtime\\/__tests__\\/studio-builder-lifecycle-normalization\\.test\\.js$',
    '^scripts\\/gates\\/g423-studio-builder-lifecycle-normalization\\.mjs$',
    '^docs\\/evidence\\/post-foundation-c-studio-builder-lifecycle-normalization\\/',
  ]);
});
test('R018 this slice branch marker is exactly the evidence directory', () => {
  assert.deepEqual(getStudioSliceById(NORMALIZATION).branchMarkerPatterns.map((r) => r.source),
    ['^docs\\/evidence\\/post-foundation-c-studio-builder-lifecycle-normalization\\/']);
});
test('R019 this slice marker is a subset of its primary set and matches no test or gate', () => {
  const s = getStudioSliceById(NORMALIZATION);
  for (const m of s.branchMarkerPatterns) {
    assert.ok(s.primaryArtifactPatterns.some((p) => p.source === m.source), m.source);
    assert.equal(m.test(TEST_REL), false);
    assert.equal(m.test(GATE_REL), false);
  }
});
test('R020 this slice cross list is exactly the six governance consumers', () => {
  const c = getStudioSliceById(NORMALIZATION).crossSliceAuthorizedPatterns;
  assert.equal(c.length, 6);
  assert.equal(new Set(c.map((r) => r.source)).size, 6);
  for (const p of SIX_CONSUMERS) assert.ok(c.some((r) => r.test(p)), p);
});
test('R021 this slice cross list is anchored to single files, no directory, no wildcard', () => {
  for (const r of getStudioSliceById(NORMALIZATION).crossSliceAuthorizedPatterns) {
    assert.ok(r.source.startsWith('^'), r.source);
    assert.ok(r.source.endsWith('$'), r.source);
    assert.equal(/^\^?\.[*+]/.test(r.source), false, r.source);
    assert.equal(/docs\\\/evidence/.test(r.source), false, r.source);
    assert.equal(/studioScopeGovernanceGuard/.test(r.source), false, r.source);
  }
});
test('R022 this slice shared set is registry plus the two manifests', () => {
  assert.deepEqual(getStudioSliceById(NORMALIZATION).sharedGovernancePatterns.map((r) => r.source), [
    '^scripts\\/gates\\/lib\\/studioScopeGovernanceRegistry\\.mjs$',
    '^package\\.json$',
    '^package-lock\\.json$',
  ]);
});
test('R023 this slice declares no explicitly authorized forbidden path', () => {
  assert.deepEqual(getStudioSliceById(NORMALIZATION).explicitlyAuthorizedForbiddenPatterns, []);
});
test('R024 this slice is not authorized for historical branch consumers', () => {
  assert.equal(getStudioSliceById(NORMALIZATION).historicalBranchConsumerCompatibility, false);
});
test('R025 no two slices own the same primary pattern', () => {
  const seen = new Map();
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const p of s.primaryArtifactPatterns) {
      assert.equal(seen.has(p.source), false, `${p.source} owned by ${seen.get(p.source)} and ${s.sliceId}`);
      seen.set(p.source, s.sliceId);
    }
  }
});
test('R026 every catalogued pattern is anchored', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns',
      'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']) {
      for (const p of s[k]) assert.ok(p.source.startsWith('^'), `${s.sliceId} ${k} ${p.source}`);
    }
  }
});
test('R027 no catalogued pattern is a broad wildcard', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) {
      for (const p of s[k]) assert.equal(/^\^?\.[*+]/.test(p.source), false, `${s.sliceId} ${p.source}`);
    }
  }
});
test('R028 the catalog and every entry stay frozen', () => {
  assert.ok(Object.isFrozen(STUDIO_SLICE_CATALOG));
  for (const s of STUDIO_SLICE_CATALOG) assert.ok(Object.isFrozen(s), s.sliceId);
});
test('R029 this slice scope never reaches production, the Builder or the guard', () => {
  const s = getStudioSliceById(NORMALIZATION);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  for (const p of ['src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs', 'src/modules/x.js',
    'backend/server.js', 'src/pages/x.jsx', 'src/components/x.jsx', 'prisma/schema.prisma',
    'scripts/gates/lib/studioScopeGovernanceGuard.mjs',
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js']) {
    assert.equal(all.some((r) => r.test(p)), false, p);
  }
});
test('R030 this slice scope never reaches a pre-Studio gate', () => {
  for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
    assert.equal(isPathAuthorizedForStudioSlice(g, NORMALIZATION), false, g);
  }
});
for (const p of SIX_CONSUMERS) {
  test(`R031 this slice is authorized for the governance consumer ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, NORMALIZATION), true, p);
  });
}
for (const p of [
  'src/runtime/__tests__/studio-scope-governance-maintenance.test.js',
  'scripts/gates/g423-studio-scope-governance-maintenance.mjs',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
  'scripts/gates/lib/studioScopeGovernanceGuard.mjs',
  'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
  'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md',
  'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.test.js',
]) {
  test(`R032 this slice is NOT authorized for ${path.basename(p)}`, () => {
    assert.equal(isPathAuthorizedForStudioSlice(p, NORMALIZATION), false, p);
  });
}
test('R033 the registry still declares the normalization slice id by name', () => {
  assert.equal(NORMALIZATION, 'studio-builder-lifecycle-normalization');
  assert.match(readSrc(REGISTRY_REL), /export const BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID/);
});
test('R034 the catalog has no parallel authorization list', () => {
  assert.equal(/export const [A-Z_]*HISTORICAL_BRANCH_CONSUMER_COMPAT/.test(readSrc(REGISTRY_REL)), false);
});

// ===========================================================================
// L — the lifecycle change, measured through the guard
// ===========================================================================
for (const [ordinal, callers] of [[41, [MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION]],
  [24, [MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION]],
  [42, [CORRECTION, CONSUMERS, NORMALIZATION]],
  [43, [CONSUMERS, NORMALIZATION]],
  [44, [NORMALIZATION]]]) {
  test(`L001 the fixture of slice ${ordinal} resolves exactly one active slice`, () => {
    const a = resolveActiveStudioSlice(FIXTURE[ordinal]);
    assert.equal(a.ok, true, JSON.stringify(a));
    assert.equal(a.sliceOrdinal, ordinal);
    assert.equal(a.candidates.length, 1);
  });
  test(`L002 the fixture of slice ${ordinal} is sound for its OWN slice`, () => {
    const own = resolveActiveStudioSlice(FIXTURE[ordinal]).sliceId;
    const r = evaluateStudioBranchScope(FIXTURE[ordinal], { callerSliceId: own });
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
  });
  for (const caller of callers) {
    test(`L003 slice ${ordinal} is fail-closed for later caller ${caller}`, () => {
      const r = evaluateStudioBranchConsumerScope(FIXTURE[ordinal], { callerSliceId: caller });
      assert.equal(r.activeSliceOrdinal, ordinal);
      assert.ok(r.activeSliceOrdinal < r.consumerSliceOrdinal);
      assert.equal(r.consumerApplicable, false);
      assert.equal(r.applicable, false);
      assert.equal(r.notApplicable, false);
      assert.equal(r.reason, 'historical_branch_consumer_compatibility_not_authorized');
      assert.equal(r.certifiedAgainstActiveSlice, false);
      assert.equal(r.evaluatedAsSliceId, null);
      assert.ok(r.blockers.includes('active_slice_before_caller'), JSON.stringify(r.blockers));
      assert.equal(r.safe, false);
    });
    test(`L004 slice ${ordinal} authorizes nothing for later caller ${caller}`, () => {
      const r = evaluateStudioBranchConsumerScope(FIXTURE[ordinal], { callerSliceId: caller });
      assert.deepEqual(r.allowed, []);
      assert.deepEqual(r.crossAuthorized, []);
      assert.deepEqual(r.explicitForbiddenAuthorized, []);
      assert.equal(r.total, 0);
    });
    test(`L005 the core agrees with the wrapper for slice ${ordinal}, caller ${caller}`, () => {
      const d = evaluateStudioBranchDiffScope(FIXTURE[ordinal], { callerSliceId: caller });
      assert.equal(d.safe, false);
      assert.ok(d.blockers.includes('active_slice_before_caller'));
    });
  }
}
test('L006 the Builder branch is no longer a special case', () => {
  const builder = evaluateStudioBranchConsumerScope(FIXTURE[41], { callerSliceId: NORMALIZATION });
  const merged24 = evaluateStudioBranchConsumerScope(FIXTURE[24], { callerSliceId: NORMALIZATION });
  assert.equal(builder.reason, merged24.reason);
  assert.equal(builder.safe, merged24.safe);
  assert.equal(builder.notApplicable, merged24.notApplicable);
});
test('L007 no self-certification is attempted anywhere', () => {
  for (const ordinal of [41, 24, 42, 43, 44]) {
    const r = evaluateStudioBranchConsumerScope(FIXTURE[ordinal], { callerSliceId: NORMALIZATION });
    assert.equal(r.certifiedAgainstActiveSlice, false, String(ordinal));
    assert.equal(r.evaluatedAsSliceId, null, String(ordinal));
  }
});
test('L008 an EARLIER caller is still the certifier and stays applicable', () => {
  const r = evaluateStudioBranchConsumerScope(FIXTURE[41], { callerSliceId: MAINTENANCE });
  assert.equal(r.consumerApplicable, true);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
test('L009 this slice own diff is applicable and safe for itself', () => {
  const r = evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: NORMALIZATION });
  assert.equal(r.consumerApplicable, true);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
  assert.equal(r.allowed.length, OWN_DIFF.length);
  assert.equal(r.activeSliceId, NORMALIZATION);
});
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS]) {
  test(`L010 this slice own diff is applicable and safe for earlier caller ${caller}`, () => {
    const r = evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: caller });
    assert.equal(r.consumerApplicable, true);
    assert.equal(r.safe, true, JSON.stringify(r.blockers));
    assert.ok(r.activeSliceOrdinal > r.consumerSliceOrdinal);
  });
}
test('L011 the guard was not modified by this slice', () => {
  const src = readSrc(GUARD_REL);
  assert.match(src, /export function evaluateStudioBranchConsumerScope\(/);
  assert.match(src, /activeSlice\.historicalBranchConsumerCompatibility !== true/);
  assert.match(src, /active_slice_before_caller/);
});
test('L012 the guard hardcodes no slice identity, status or PR number', () => {
  const src = readSrc(GUARD_REL);
  for (const token of ['bridge-decision-core-envelope-builder', 'open_pull_request', '495',
    'sliceOrdinal === 41', 'allowHistorical', 'ignoreChronology', 'skipChronology',
    'permissive', 'bypassChronology']) {
    assert.equal(src.includes(token), false, token);
  }
});
test('L013 the guard still imports only the registry and stays pure', () => {
  const src = readSrc(GUARD_REL);
  const imports = [...src.matchAll(/^import [^;]*from '([^']+)';/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(imports)], ['./studioScopeGovernanceRegistry.mjs']);
  for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
    assert.equal(src.includes(api), false, api);
  }
});
test('L014 the registry imports nothing and stays pure', () => {
  const src = readSrc(REGISTRY_REL);
  assert.equal(/^import /m.test(src), false);
  for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
    assert.equal(src.includes(api), false, api);
  }
});

// ===========================================================================
// C — the core, unchanged
// ===========================================================================
test('C001 resolveActiveStudioSlice([]) fails closed', () => {
  const r = resolveActiveStudioSlice([]);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
  assert.deepEqual(r.candidates, []);
});
test('C002 evaluateStudioBranchScope([]) fails closed', () => {
  const r = evaluateStudioBranchScope([], { callerSliceId: NORMALIZATION });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('no_active_slice_resolved'));
});
test('C003 evaluateStudioBranchDiffScope([]) is notApplicable and safe', () => {
  const r = evaluateStudioBranchDiffScope([], { callerSliceId: NORMALIZATION });
  assert.equal(r.notApplicable, true);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.safe, true);
});
test('C004 evaluateStudioBranchConsumerScope([]) is notApplicable and safe', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: NORMALIZATION });
  assert.equal(r.notApplicable, true);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.safe, true);
  assert.equal(r.activeSliceId, null);
  assert.deepEqual(r.allowed, []);
});
for (const [label, bad] of [['null', null], ['undefined', undefined], ['string', 'x'], ['object', {}],
  ['number item', [1]], ['empty string item', ['']], ['mixed items', ['a', 2]], ['nested array', [[]]]]) {
  test(`C005 invalid input fails closed, never treated as empty: ${label}`, () => {
    const r = evaluateStudioBranchConsumerScope(bad, { callerSliceId: NORMALIZATION });
    assert.equal(r.safe, false);
    assert.equal(r.notApplicable, false);
    assert.equal(r.reason, 'invalid_changed_paths');
  });
}
test('C006 an unknown caller fails closed', () => {
  for (const paths of [[], OWN_DIFF, FIXTURE[41]]) {
    const r = evaluateStudioBranchConsumerScope(paths, { callerSliceId: 'nope' });
    assert.equal(r.safe, false);
    assert.equal(r.reason, 'unknown_caller_slice');
    assert.equal(r.notApplicable, false);
  }
});
test('C007 a missing caller option fails closed', () => {
  assert.equal(evaluateStudioBranchConsumerScope(OWN_DIFF, {}).safe, false);
});
test('C008 an unresolved active slice fails closed', () => {
  const r = evaluateStudioBranchConsumerScope(['package.json'], { callerSliceId: NORMALIZATION });
  assert.equal(r.safe, false);
  assert.equal(r.notApplicable, false);
  assert.equal(r.reason, 'no_active_slice_resolved');
});
for (const [a, b] of [[41, 45], [24, 45], [44, 45], [24, 41], [41, 44]]) {
  test(`C009 two markers are always ambiguous: ${a} + ${b}`, () => {
    const r = resolveActiveStudioSlice([MARKER[a], MARKER[b]]);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'ambiguous_active_slice');
    assert.equal(r.candidates.length, 2);
    assert.equal(r.sliceId, null);
  });
  test(`C010 an ambiguous diff fails closed through the consumer boundary: ${a} + ${b}`, () => {
    const r = evaluateStudioBranchConsumerScope([MARKER[a], MARKER[b]], { callerSliceId: NORMALIZATION });
    assert.equal(r.safe, false);
    assert.equal(r.notApplicable, false);
    assert.equal(r.reason, 'ambiguous_active_slice');
  });
}
test('C011 ambiguity is decided BEFORE the authorization gate', () => {
  const r = evaluateStudioBranchConsumerScope([...FIXTURE[41], MARKER[24]], { callerSliceId: NORMALIZATION });
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.notEqual(r.reason, 'historical_branch_consumer_compatibility_not_authorized');
});
test('C012 status never decides active resolution', () => {
  // Every marker elects its own slice regardless of that slice being merged or active.
  for (const ordinal of [24, 41, 44, 45]) {
    const r = resolveActiveStudioSlice([MARKER[ordinal]]);
    assert.equal(r.ok, true, String(ordinal));
    assert.equal(r.sliceOrdinal, ordinal);
  }
});
test('C013 shared governance paths never elect a slice', () => {
  for (const p of [REGISTRY_REL, GUARD_REL, 'package.json', 'package-lock.json']) {
    assert.equal(resolveActiveStudioSlice([p]).candidates.length, 0, p);
  }
});
test('C014 a cross-authorized path never elects a slice', () => {
  for (const p of SIX_CONSUMERS) assert.equal(resolveActiveStudioSlice([p]).candidates.length, 0, p);
});
test('C015 this slice own test and gate never elect it', () => {
  assert.equal(resolveActiveStudioSlice([TEST_REL, GATE_REL]).candidates.length, 0);
});
test('C016 no caller option can grant the authorization', () => {
  for (const opt of [{ historicalBranchConsumerCompatibility: true }, { allowHistorical: true },
    { ignoreChronology: true }, { expectedActiveSlice: BUILDER }]) {
    const r = evaluateStudioBranchConsumerScope(FIXTURE[41], { callerSliceId: NORMALIZATION, ...opt });
    assert.equal(r.safe, false, JSON.stringify(opt));
    assert.equal(r.reason, 'historical_branch_consumer_compatibility_not_authorized', JSON.stringify(opt));
  }
});
test('C017 explicit forbidden stays catalog-bound and is not injectable', () => {
  const r = evaluateStudioBranchScope([...OWN_DIFF, 'src/App.jsx'],
    { callerSliceId: NORMALIZATION, explicitlyAuthorizedForbidden: [/^src\/App\.jsx$/] });
  assert.ok(r.forbidden.includes('src/App.jsx'));
  assert.equal(r.safe, false);
});
test('C018 explicit forbidden is still honoured for the slice that declares it', () => {
  const r = evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
    MARKER[24], 'src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs',
  ], { callerSliceId: APP_INTEGRATION });
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
  assert.equal(r.explicitForbiddenAuthorized.length, 2);
});
test('C019 the consumer report is frozen and side-effect free', () => {
  for (const paths of [[], OWN_DIFF, FIXTURE[41], null]) {
    const r = evaluateStudioBranchConsumerScope(paths, { callerSliceId: NORMALIZATION });
    assert.ok(Object.isFrozen(r));
    assert.equal(r.kind, 'studio-branch-consumer-scope-evaluation');
    assert.equal(r.sideEffects, false);
    assert.equal(r.mutationAllowed, false);
    assert.equal(r.backendAccessed, false);
    assert.equal(r.prismaAccessed, false);
    assert.equal(r.fetchUsed, false);
  }
});
test('C020 the boundary is deterministic and does not mutate its input', () => {
  const input = [...FIXTURE[41]];
  const a = JSON.stringify(evaluateStudioBranchConsumerScope(input, { callerSliceId: NORMALIZATION }));
  const b = JSON.stringify(evaluateStudioBranchConsumerScope(input, { callerSliceId: NORMALIZATION }));
  assert.equal(a, b);
  assert.deepEqual(input, FIXTURE[41]);
});

// ===========================================================================
// N — negatives
// ===========================================================================
for (const p of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js', 'src/pages/x.jsx',
  'src/components/x.jsx', 'prisma/schema.prisma', 'scripts/gates/lib/productionUiGuard.mjs',
  'migrations/001.sql', 'backend/prisma/migrations/x/migration.sql', 'anything.sql']) {
  test(`N001 forbidden stays forbidden: ${p}`, () => {
    assert.equal(classifyStudioScopePath(p), 'forbidden_scope', p);
    assert.equal(isPathAuthorizedForStudioSlice(p, NORMALIZATION), false, p);
  });
  test(`N002 a forbidden path makes this branch unsafe: ${p}`, () => {
    assert.equal(evaluateStudioBranchScope([...OWN_DIFF, p], { callerSliceId: NORMALIZATION }).safe, false, p);
  });
}
for (const p of ['docs/nobody/x.md', 'docs/random-migration-plan.md', 'tools/custom-migration-helper.js',
  'config/menu.json', 'tools/navigation-generator.js', 'scripts/gates/g423-unregistered-route-menu.mjs',
  'src/runtime/__tests__/unlisted-empresas-change.test.js', 'docs/evidence/unregistered-empresas-change/file.md']) {
  test(`N003 an unowned path is authorized for nobody: ${p}`, () => {
    assert.ok(STUDIO_SLICE_CATALOG.every((s) => isPathAuthorizedForStudioSlice(p, s.sliceId) === false), p);
  });
  test(`N004 an unowned path makes this branch unsafe: ${p}`, () => {
    const r = evaluateStudioBranchScope([...OWN_DIFF, p], { callerSliceId: NORMALIZATION });
    assert.equal(r.safe, false, p);
  });
}
test('N005 a foreign catalogued path is a chronological violation for this slice', () => {
  const foreign = 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js';
  const r = evaluateStudioBranchScope([...OWN_DIFF, foreign], { callerSliceId: NORMALIZATION });
  assert.ok(r.chronologicalViolation.includes(foreign), JSON.stringify(r));
  assert.equal(r.safe, false);
});
test('N006 historical evidence is never cross-authorized by this slice', () => {
  for (const p of [
    'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/READINESS.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
  ]) assert.equal(isPathAuthorizedForStudioSlice(p, NORMALIZATION), false, p);
});
test('N007 the central guard is never cross-authorized by this slice', () => {
  assert.equal(isPathAuthorizedForStudioSlice(GUARD_REL, NORMALIZATION), false);
});
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  test(`N008 pre-Studio gate stays outside every boundary: ${path.basename(g)}`, () => {
    const src = readSrc(g);
    assert.equal(src.includes('evaluateStudioBranchScope('), false, g);
    assert.equal(src.includes('evaluateStudioBranchDiffScope('), false, g);
    assert.equal(src.includes('evaluateStudioBranchConsumerScope('), false, g);
    assert.equal(findOwningStudioSlices(g).length, 0, g);
  });
}

// ===========================================================================
// S — source scans
// ===========================================================================
for (const p of SIX_CONSUMERS) {
  test(`S001 the governance consumer no longer asserts the transitional lifecycle: ${path.basename(p)}`, () => {
    const src = readSrc(p);
    assert.equal(/status\s*===\s*'open_pull_request_495'/.test(src), false, p);
    assert.equal(/status,\s*'open_pull_request_495'/.test(src), false, p);
  });
}
test('S002 no consumer declares the authorization as catalog data', () => {
  // Mentioning `{ historicalBranchConsumerCompatibility: true }` as a CALLER OPTION is a
  // legitimate negative fixture — it proves the option is ignored. What no consumer may do is
  // declare the field as a catalog value, which is the registry's job alone.
  for (const p of SIX_CONSUMERS) {
    const src = readSrc(p);
    assert.equal(/^\s{4}historicalBranchConsumerCompatibility:/m.test(src), false, p);
  }
});
test('S002b no consumer carries a permissive escape token', () => {
  for (const p of SIX_CONSUMERS) {
    const src = readSrc(p);
    for (const token of ['allowHistorical: true,', 'ignoreChronology: true,', 'skipChronology', 'bypassChronology']) {
      assert.equal(src.includes(token), false, `${p}: ${token}`);
    }
  }
});
test('S003 the Builder functional subtree is untouched by this slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.equal(p.startsWith('src/studio/blueprint-engine/'), false, p);
});

// ===========================================================================
// E — artifacts and evidence
// ===========================================================================
test('E001 this slice ships its own test, gate and evidence directory', () => {
  assert.ok(fs.existsSync(path.join(ROOT, TEST_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, GATE_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, EV_REL)));
});
for (const doc of ['README.md', 'ROOT-CAUSE.md', 'REGISTRY-LIFECYCLE-TRANSITION.md',
  'BUILDER-COMPATIBILITY-RESET.md', 'SCOPE-INVENTORY.md', 'NEGATIVE-MATRIX.md',
  'CERTIFICATION-REPORT.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md']) {
  test(`E002 evidence present and non-trivial: ${doc}`, () => assert.ok(readEv(doc).length > 200, doc));
}
test('E003 package.json wires this slice test and gate', () => {
  const pkg = JSON.parse(readSrc('package.json'));
  assert.ok(pkg.scripts['test:runtime:studio-builder-lifecycle-normalization']);
  assert.ok(pkg.scripts['gate:g423-studio-builder-lifecycle-normalization']);
  assert.ok(pkg.scripts['test:runtime'].includes('studio-builder-lifecycle-normalization.test.js'));
});
test('E004 the root cause document names the merged PR and the risk', () => {
  const doc = readEv('ROOT-CAUSE.md');
  assert.match(doc, /5bfecd60/);
  assert.match(doc, /historicalBranchConsumerCompatibility/);
  assert.match(doc, /B-CONSUMER-INAPPLICABILITY-NOT-CATALOG-BOUND/);
});
test('E005 the transition document records all three moves', () => {
  const doc = readEv('REGISTRY-LIFECYCLE-TRANSITION.md');
  assert.match(doc, /open_pull_request_495/);
  assert.match(doc, /merged/);
  assert.match(doc, /active_slice/);
  assert.ok(doc.includes(BUILDER), BUILDER);
});
test('E006 the compatibility document states both sides of the change', () => {
  const doc = readEv('BUILDER-COMPATIBILITY-RESET.md');
  assert.match(doc, /consumer_slice_after_active_slice/);
  assert.match(doc, /historical_branch_consumer_compatibility_not_authorized/);
});
test('E007 the scope inventory records the exact six cross paths', () => {
  const doc = readEv('SCOPE-INVENTORY.md');
  for (const p of SIX_CONSUMERS) assert.ok(doc.includes(path.basename(p)), p);
});
test('E008 the negative matrix records the fail-closed universality', () => {
  const doc = readEv('NEGATIVE-MATRIX.md');
  assert.match(doc, /historical_branch_consumer_compatibility_not_authorized/);
  assert.ok(doc.includes(BUILDER), BUILDER);
  assert.ok(doc.includes(APP_INTEGRATION), APP_INTEGRATION);
});
test('E009 readiness declares the normalized lifecycle', () => {
  const doc = readEv('READINESS.md');
  assert.match(doc, /builderStatusIs:\s*merged/);
  assert.match(doc, /builderCompatibilityIs:\s*false/);
  assert.match(doc, /slice44StatusIs:\s*merged/);
  assert.match(doc, /catalogCompatibilityTrueCount:\s*0/);
  assert.match(doc, /catalogActiveSlices:\s*1/);
});
test('E010 readiness does not claim the main is green', () => {
  assert.match(readEv('READINESS.md'), /mainVerifiedGreen:\s*false/);
  assert.match(readEv('READINESS.md'), /postMergeRevalidationRequired:\s*true/);
});
test('E011 readiness declares the core and the guard untouched', () => {
  const doc = readEv('READINESS.md');
  assert.match(doc, /guardModified:\s*false/);
  assert.match(doc, /coreApisUnchanged:\s*true/);
  assert.match(doc, /builderFunctionalSourceTouched:\s*false/);
});
test('E012 the revalidation plan covers the zero-authorization state on main', () => {
  const doc = readEv('POST-MERGE-REVALIDATION-PLAN.md');
  assert.match(doc, /historical_branch_consumer_compatibility_not_authorized/);
  assert.match(doc, /empty_branch_diff/);
});
test('E013 no historical evidence directory of an earlier slice is touched', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) {
    if (!p.startsWith('docs/evidence/')) continue;
    assert.ok(p.startsWith(EV_REL), p);
  }
});

// ===========================================================================
// T — this branch, judged by its own rules
// ===========================================================================
test('T001 this branch resolves exactly this slice, or is empty', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const a = resolveActiveStudioSlice(f);
  if (f.length === 0) { assert.equal(a.ok, false); return; }
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.candidates.length, 1);
  assert.equal(a.sliceId, NORMALIZATION);
});
test('T002 this branch is sound for this slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = evaluateStudioBranchConsumerScope(f, { callerSliceId: NORMALIZATION });
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS]) {
  test(`T003 this branch is sound for earlier caller ${caller}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(evaluateStudioBranchConsumerScope(f, { callerSliceId: caller }).safe, true);
  });
}
test('T004 this branch touches no forbidden path', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.notEqual(classifyStudioScopePath(p), 'forbidden_scope', p);
});
test('T005 every path on this branch is authorized by the active slice', () => {
  const f = changedOnThisBranch(); if (f === null || f.length === 0) return;
  const a = createResolvedActiveStudioSlicePathAuthorizer(f);
  assert.equal(a.ok, true, JSON.stringify(a));
  for (const p of f) assert.equal(a.isAuthorized(p), true, p);
  for (const p of ['src/App.jsx', 'docs/nobody/x.md', 'src/modules/x.js', GUARD_REL]) {
    assert.equal(a.isAuthorized(p), false, p);
  }
});
test('T006 this branch owns exactly the artifacts the catalog says it owns', () => {
  for (const rel of [TEST_REL, GATE_REL]) {
    assert.deepEqual(findOwningStudioSlices(rel).map((s) => s.sliceId), [NORMALIZATION], rel);
  }
});
test('T007 an empty diff is admitted ONLY as the safe empty_branch_diff state', () => {
  const r = evaluateStudioBranchConsumerScope([], { callerSliceId: NORMALIZATION });
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.notApplicable, true);
  assert.equal(r.safe, true);
  assert.equal(r.activeSliceId, null);
});
test('T008 a real slice branch diff is substantive and never reads as empty', () => {
  const f = changedOnThisBranch(); if (f === null || f.length === 0) return;
  assert.ok(f.length >= 5, String(f.length));
  const r = evaluateStudioBranchConsumerScope(f, { callerSliceId: NORMALIZATION });
  assert.notEqual(r.reason, 'empty_branch_diff');
  assert.notEqual(r.activeSliceId, null);
});
