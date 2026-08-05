import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STUDIO_SLICE_CATALOG,
  STUDIO_GOVERNED_DOMAIN_PATTERNS,
  FORBIDDEN_SCOPE_PATTERNS,
  CHRONOLOGICAL_MIGRATION_SLICE_ID,
  MAIN_DIFF_CORRECTION_SLICE_ID,
  HISTORICAL_BRANCH_CONSUMERS_SLICE_ID,
  BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID,
  NON_STUDIO_BRANCH_APPLICABILITY_SLICE_ID,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  getStudioSliceById, findOwningStudioSlices, resolveActiveStudioSlice,
  classifyStudioScopePath, evaluateStudioBranchScope, evaluateStudioBranchDiffScope,
  evaluateStudioBranchConsumerScope, createResolvedActiveStudioSlicePathAuthorizer,
  isStudioGovernedDomainPath,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const EV_REL = 'docs/evidence/post-foundation-c-studio-scope-governance-non-studio-branch-applicability/';
const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readEv = (n) => readSrc(`${EV_REL}${n}`);

const APPLICABILITY = NON_STUDIO_BRANCH_APPLICABILITY_SLICE_ID;
const NORMALIZATION = BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID;
const CONSUMERS = HISTORICAL_BRANCH_CONSUMERS_SLICE_ID;
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const MAINTENANCE = 'studio-scope-governance-maintenance';
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';

const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

/** The marker that elects this slice, and a realistic full diff for it. */
const MARKER_46 = `${EV_REL}README.md`;
const MARKER_45 = 'docs/evidence/post-foundation-c-studio-builder-lifecycle-normalization/README.md';
const OWN_DIFF = [MARKER_46, TEST_REL, GATE_REL, GUARD_REL, REGISTRY_REL, 'package.json'];

/** Paths outside the governed territory. None of these is a Studio concern. */
const NON_STUDIO = [
  '.github/workflows/foundation-governance.yml',
  'README.md',
  'vite.config.js',
  'eslint.config.js',
  '.gitignore',
  'docs/engineering/PROJECT-STATUS.md',
];

/** Unregistered files under governed roots. These must NEVER read as non-Studio. */
const UNREGISTERED_GOVERNED = [
  'src/studio/unregistered-future-artifact.js',
  'src/runtime/__tests__/unregistered-future.test.js',
  'scripts/gates/unregistered-future-gate.mjs',
  'docs/evidence/unregistered-future-evidence/README.md',
];

const changedOnThisBranch = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch { return null; }
};

// ===========================================================================
// R — the catalog after slice 46
// ===========================================================================
test('R001 the catalog holds forty-six slices', () => assert.equal(STUDIO_SLICE_CATALOG.length, 46));
test('R002 slice ids stay unique', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});
test('R003 ordinals are contiguous 1..46', () => {
  const o = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b);
  assert.deepEqual(o, Array.from({ length: 46 }, (_, i) => i + 1));
});
test('R004 every entry still carries exactly ten keys', () => {
  for (const s of STUDIO_SLICE_CATALOG) assert.equal(Object.keys(s).length, 10, s.sliceId);
});
test('R005 this slice is ordinal 46', () => {
  assert.equal(getStudioSliceById(APPLICABILITY).sliceOrdinal, 46);
});
test('R006 this slice is born merged, like slice 45 and for the same reason', () => {
  assert.equal(getStudioSliceById(APPLICABILITY).status, 'merged');
});
test('R007 the catalog carries zero active_slice', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').length, 0);
});
test('R008 the catalog carries zero open_pull_request_* status', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status.startsWith('open_pull_request')).length, 0);
});
test('R009 the merged family covers all forty-six entries', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status.startsWith('merged')).length, 46);
});
test('R010 exactly forty-five carry the plain merged status', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.status === 'merged').length, 45);
});
test('R011 slice 39 keeps its pre-existing deviating status, named explicitly', () => {
  const s39 = STUDIO_SLICE_CATALOG.find((s) => s.sliceOrdinal === 39);
  assert.equal(s39.status, 'merged_without_dedicated_artifacts');
});
test('R012 no slice is authorized to carry historical branch consumers', () => {
  assert.equal(STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility === true).length, 0);
});
test('R013 this slice does not authorize historical branch consumers either', () => {
  assert.equal(getStudioSliceById(APPLICABILITY).historicalBranchConsumerCompatibility, false);
});
test('R014 this slice authorizes no forbidden path', () => {
  assert.deepEqual(getStudioSliceById(APPLICABILITY).explicitlyAuthorizedForbiddenPatterns, []);
});
test('R015 this slice owns exactly its test, gate and evidence root', () => {
  assert.equal(getStudioSliceById(APPLICABILITY).primaryArtifactPatterns.length, 3);
  for (const rel of [TEST_REL, GATE_REL]) {
    assert.deepEqual(findOwningStudioSlices(rel).map((s) => s.sliceId), [APPLICABILITY], rel);
  }
});
test('R016 the marker is the evidence root and nothing else', () => {
  assert.equal(getStudioSliceById(APPLICABILITY).branchMarkerPatterns.length, 1);
});
test('R017 entries 1..45 keep their ordinal, id and status untouched', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.sliceOrdinal === 46) continue;
    assert.equal(typeof s.sliceId, 'string');
    assert.ok(s.status.startsWith('merged'), `${s.sliceId} → ${s.status}`);
  }
});
test('R018 the Builder keeps the exact scope of its merged PR', () => {
  const b = getStudioSliceById(BUILDER);
  assert.equal(b.sliceOrdinal, 41);
  assert.equal(b.status, 'merged');
  assert.equal(b.historicalBranchConsumerCompatibility, false);
  assert.equal(b.primaryArtifactPatterns.length, 4);
  assert.equal(b.crossSliceAuthorizedPatterns.length, 8);
  assert.equal(b.explicitlyAuthorizedForbiddenPatterns.length, 0);
});

// ===========================================================================
// DOM — domain membership. DOMAIN IS NOT AUTHORIZATION.
// ===========================================================================
test('DOM001 the domain roots are a frozen, non-empty regex list', () => {
  assert.ok(Object.isFrozen(STUDIO_GOVERNED_DOMAIN_PATTERNS));
  assert.ok(STUDIO_GOVERNED_DOMAIN_PATTERNS.length >= 6);
  for (const re of STUDIO_GOVERNED_DOMAIN_PATTERNS) assert.ok(re instanceof RegExp);
});
for (const p of ['src/studio/a.js', 'src/runtime/a.js', 'scripts/gates/a.mjs',
  'docs/evidence/x/README.md', 'package.json', 'package-lock.json']) {
  test(`DOM002 governed root: ${p}`, () => assert.equal(isStudioGovernedDomainPath(p), true));
}
for (const p of NON_STUDIO) {
  test(`DOM003 outside the territory: ${p}`, () => assert.equal(isStudioGovernedDomainPath(p), false));
}
test('DOM004 every forbidden path is in the domain — never foreign territory', () => {
  for (const p of ['src/App.jsx', 'src/modules/x.js', 'backend/src/server.js',
    'prisma/schema.prisma', 'src/pages/x.jsx', 'scripts/gates/lib/productionUiGuard.mjs']) {
    assert.equal(isStudioGovernedDomainPath(p), true, p);
    assert.equal(FORBIDDEN_SCOPE_PATTERNS.some((re) => re.test(p)), true, p);
  }
});
test('DOM005 an UNREGISTERED file under a governed root is still governed', () => {
  // This is the whole reason the domain is defined by ROOTS and not by
  // `classifyStudioScopePath(p) !== "unknown_scope"`: the classifier calls these
  // `unknown_scope`, and a classifier-derived domain would let them escape.
  for (const p of UNREGISTERED_GOVERNED) {
    assert.equal(isStudioGovernedDomainPath(p), true, p);
  }
});
test('DOM006 the unsafe derivation is demonstrably unsafe, and is not used', () => {
  const p = 'src/studio/unregistered-future-artifact.js';
  assert.equal(classifyStudioScopePath(p), 'unknown_scope');
  assert.equal(isStudioGovernedDomainPath(p), true);
});
test('DOM007 domain membership grants nothing', () => {
  const r = evaluateStudioBranchScope(['src/studio/unregistered-future-artifact.js'], { callerSliceId: APPLICABILITY });
  assert.deepEqual(r.allowed, []);
  assert.equal(r.safe, false);
});
test('DOM008 invalid input is never in the domain', () => {
  for (const v of [null, undefined, '', 0, {}, []]) assert.equal(isStudioGovernedDomainPath(v), false);
});
test('DOM009 the domain predicate is pure and stable', () => {
  const p = 'src/studio/a.js';
  assert.equal(isStudioGovernedDomainPath(p), isStudioGovernedDomainPath(p));
});
test('DOM010 every authorization pattern of every slice lies inside the domain', () => {
  // Proves the roots cover the whole governed territory: no slice can authorize a path the
  // domain would call foreign, which would be a silent hole in the applicability boundary.
  const samples = [
    'src/studio/blueprint-engine/x/index.js', 'src/runtime/__tests__/x.test.js',
    'scripts/gates/g423-x.mjs', 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs',
    'docs/evidence/post-foundation-c-x/README.md', 'package.json', 'package-lock.json',
    'src/App.jsx',
  ];
  for (const p of samples) assert.equal(isStudioGovernedDomainPath(p), true, p);
});

// ===========================================================================
// A–O — the executable contract matrix
// ===========================================================================
const consumer = (paths, caller = APPLICABILITY) => evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });
const diffScope = (paths, caller = APPLICABILITY) => evaluateStudioBranchDiffScope(paths, { callerSliceId: caller });

const assertNonStudio = (r, total) => {
  assert.equal(r.notApplicable, true);
  assert.equal(r.applicable, false);
  assert.equal(r.reason, 'non_studio_branch');
  assert.equal(r.safe, true);
  assert.equal(r.activeSliceId, null);
  assert.deepEqual(r.activeCandidates, []);
  assert.deepEqual(r.allowed, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.blockers, []);
  if (typeof total === 'number') assert.equal(r.total, total);
};

test('A001 a workflow-only diff is not applicable to this governance', () => {
  assertNonStudio(consumer(['.github/workflows/foundation-governance.yml']), 1);
});
test('A002 the same holds at the branch-diff boundary', () => {
  assertNonStudio(diffScope(['.github/workflows/foundation-governance.yml']), 1);
});
test('A003 the CORE stays fail-closed on the very same paths', () => {
  // The applicability boundary is not a relaxation of the core. Asked "is this path SET
  // safe?", the core still refuses: no marker, and an unknown path.
  const r = evaluateStudioBranchScope(['.github/workflows/foundation-governance.yml'], { callerSliceId: APPLICABILITY });
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('no_active_slice_resolved'));
  assert.ok(r.blockers.includes('unknown_scope'));
  assert.deepEqual(r.allowed, []);
});
test('B001 a README-only diff is not applicable', () => assertNonStudio(consumer(['README.md']), 1));
test('C001 a tooling-only diff is not applicable', () => assertNonStudio(consumer(['vite.config.js']), 1));
test('C002 a multi-file purely non-Studio diff is not applicable', () => {
  assertNonStudio(consumer(NON_STUDIO), NON_STUDIO.length);
});
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION, APPLICABILITY]) {
  test(`C003 every governance caller agrees a non-Studio branch is not applicable: ${caller}`, () => {
    assertNonStudio(consumer(NON_STUDIO, caller), NON_STUDIO.length);
  });
}
for (const p of UNREGISTERED_GOVERNED) {
  test(`D001 an unregistered governed path is NEVER non-Studio: ${p}`, () => {
    const r = consumer([p]);
    assert.notEqual(r.reason, 'non_studio_branch');
    assert.equal(r.notApplicable, false);
    assert.equal(r.safe, false);
    assert.ok(r.blockers.length > 0, JSON.stringify(r));
  });
}
test('E001 an unregistered production runtime path stays forbidden, not foreign', () => {
  const r = consumer(['src/runtime/unregistered-future-artifact.js']);
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('forbidden_scope'));
  assert.deepEqual(r.unknown, []);
});
test('F001 an unregistered gate stays unknown and fails closed', () => {
  const r = consumer(['scripts/gates/unregistered-future-gate.mjs']);
  assert.equal(r.safe, false);
  assert.deepEqual(r.unknown, ['scripts/gates/unregistered-future-gate.mjs']);
  assert.ok(r.blockers.includes('unknown_scope'));
});
test('F002 an unregistered evidence directory stays unknown and fails closed', () => {
  const r = consumer(['docs/evidence/unregistered-future-evidence/README.md']);
  assert.equal(r.safe, false);
  assert.deepEqual(r.unknown, ['docs/evidence/unregistered-future-evidence/README.md']);
});
test('G001 this slice own diff resolves slice 46 and is sound', () => {
  const r = consumer(OWN_DIFF);
  assert.equal(r.notApplicable, false);
  assert.equal(r.activeSliceId, APPLICABILITY);
  assert.deepEqual(r.activeCandidates, [APPLICABILITY]);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
test('G002 slice 46 is elected by its marker, not by its status', () => {
  const a = resolveActiveStudioSlice([MARKER_46]);
  assert.equal(a.ok, true);
  assert.equal(a.sliceId, APPLICABILITY);
  assert.equal(a.candidates.length, 1);
  assert.equal(getStudioSliceById(APPLICABILITY).status, 'merged');
});
test('H001 slice 46 plus an unauthorized path fails closed — no short-circuit', () => {
  const r = consumer([...OWN_DIFF, 'README.md']);
  assert.equal(r.notApplicable, false);
  assert.equal(r.activeSliceId, APPLICABILITY);
  assert.deepEqual(r.unknown, ['README.md']);
  assert.ok(r.blockers.includes('unknown_scope'));
  assert.equal(r.safe, false);
});
test('H002 one governed path is enough to make the whole diff governed', () => {
  const r = consumer([...NON_STUDIO, MARKER_46]);
  assert.notEqual(r.reason, 'non_studio_branch');
  assert.equal(r.safe, false);
  for (const p of NON_STUDIO) assert.ok(r.unknown.includes(p), p);
});
test('I001 two markers stay ambiguous', () => {
  const r = consumer([MARKER_45, MARKER_46]);
  assert.equal(r.reason, 'ambiguous_active_slice');
  assert.equal(r.safe, false);
  assert.equal(r.activeCandidates.length, 2);
});
test('J001 shared infrastructure without a marker still resolves nothing', () => {
  const r = consumer(['package.json']);
  assert.equal(r.reason, 'no_active_slice_resolved');
  assert.equal(r.safe, false);
});
test('K001 a forbidden path fails closed', () => {
  const r = consumer(['src/App.jsx']);
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('forbidden_scope'));
  assert.notEqual(r.reason, 'non_studio_branch');
});
test('L001 forbidden mixed with infrastructure is NEVER non-Studio', () => {
  const r = consumer(['src/App.jsx', '.github/workflows/foundation-governance.yml']);
  assert.notEqual(r.reason, 'non_studio_branch');
  assert.equal(r.notApplicable, false);
  assert.equal(r.safe, false);
  assert.ok(r.blockers.includes('forbidden_scope'));
});
test('N001 invalid input still fails closed and is never non-Studio', () => {
  for (const bad of ['nope', [1], [''], [null], {}]) {
    const r = evaluateStudioBranchConsumerScope(bad, { callerSliceId: APPLICABILITY });
    assert.equal(r.reason, 'invalid_changed_paths');
    assert.equal(r.safe, false);
  }
});
test('N002 an unknown caller blocks even on a non-Studio diff', () => {
  const r = evaluateStudioBranchConsumerScope(NON_STUDIO, { callerSliceId: 'not-a-slice' });
  assert.equal(r.reason, 'unknown_caller_slice');
  assert.equal(r.safe, false);
  assert.equal(r.notApplicable, false);
});
test('O001 an empty diff stays empty_branch_diff, a DIFFERENT reason', () => {
  const r = consumer([]);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.notApplicable, true);
  assert.equal(r.safe, true);
  assert.notEqual(r.reason, 'non_studio_branch');
});
test('O002 the two inapplicable reasons are never conflated', () => {
  assert.equal(consumer([]).reason, 'empty_branch_diff');
  assert.equal(consumer(['README.md']).reason, 'non_studio_branch');
  assert.equal(diffScope([]).reason, 'empty_branch_diff');
  assert.equal(diffScope(['README.md']).reason, 'non_studio_branch');
});

// ===========================================================================
// M — the historical consumer matrix is untouched
// ===========================================================================
const FIXTURE = {
  24: ['docs/evidence/post-foundation-c-studio-dev-preview-app-integration/README.md',
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js'],
  41: ['docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/README.md',
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js'],
  42: ['docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/README.md',
    'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js'],
  43: ['docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/README.md',
    'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js'],
  44: ['docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/README.md',
    'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js'],
  45: [MARKER_45, 'src/runtime/__tests__/studio-builder-lifecycle-normalization.test.js'],
};
const ID_OF = (n) => STUDIO_SLICE_CATALOG.find((s) => s.sliceOrdinal === n).sliceId;
const PAIRS = [[41, [42, 43, 44, 45, 46]], [24, [42, 43, 44, 45, 46]], [42, [43, 44, 45, 46]],
  [43, [44, 45, 46]], [44, [45, 46]], [45, [46]]];
for (const [fix, callers] of PAIRS) {
  for (const c of callers) {
    test(`M001 fixture ${fix} stays fail-closed for caller ${c}`, () => {
      const r = consumer(FIXTURE[fix], ID_OF(c));
      assert.equal(r.reason, 'historical_branch_consumer_compatibility_not_authorized');
      assert.equal(r.safe, false);
      assert.equal(r.notApplicable, false);
      assert.equal(r.certifiedAgainstActiveSlice, false);
      assert.equal(r.evaluatedAsSliceId, null);
      assert.deepEqual(r.blockers, ['active_slice_before_caller']);
      assert.deepEqual(r.allowed, []);
      assert.deepEqual(r.crossAuthorized, []);
      assert.deepEqual(r.explicitForbiddenAuthorized, []);
    });
  }
}
test('M002 a merged slice branch is never turned into a non-Studio branch', () => {
  for (const n of Object.keys(FIXTURE)) {
    assert.notEqual(consumer(FIXTURE[n], APPLICABILITY).reason, 'non_studio_branch', String(n));
  }
});

// ===========================================================================
// S — source purity of the two governance files
// ===========================================================================
test('S001 the registry still imports nothing', () => {
  assert.equal(/^import\s/m.test(readSrc(REGISTRY_REL)), false);
});
test('S002 the guard imports only the registry', () => {
  const imports = [...readSrc(GUARD_REL).matchAll(/^import[\s\S]*?from\s+'([^']+)';/gm)].map((m) => m[1]);
  assert.deepEqual(imports, ['./studioScopeGovernanceRegistry.mjs']);
});
for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
  test(`S003 the guard performs no ${api}`, () => assert.equal(readSrc(GUARD_REL).includes(api), false));
  test(`S004 the registry performs no ${api}`, () => assert.equal(readSrc(REGISTRY_REL).includes(api), false));
}
test('S005 the non-Studio short-circuit exists in BOTH boundaries and nowhere else', () => {
  const src = readSrc(GUARD_REL);
  const hits = [...src.matchAll(/isNonStudioOnlyDiff\(changedPaths\)/g)].length;
  assert.equal(hits, 2, `expected exactly two boundary call sites, found ${hits}`);
});
test('S006 the core never consults the applicability predicate', () => {
  const src = readSrc(GUARD_REL);
  const core = src.slice(src.indexOf('export function evaluateStudioBranchScope'),
    src.indexOf('export function evaluateStudioBranchDiffScope'));
  assert.equal(core.includes('isNonStudioOnlyDiff'), false);
  assert.equal(core.includes('non_studio_branch'), false);
});
test('S007 the domain is NOT derived from the classifier', () => {
  const src = readSrc(GUARD_REL);
  const fn = src.slice(src.indexOf('export function isStudioGovernedDomainPath'),
    src.indexOf('function isNonStudioOnlyDiff'));
  assert.equal(fn.includes("!== 'unknown_scope'"), false);
  assert.ok(fn.includes('STUDIO_GOVERNED_DOMAIN_PATTERNS'));
  assert.ok(fn.includes('FORBIDDEN_SCOPE_PATTERNS'));
});
test('S008 the applicability predicate is all-or-nothing', () => {
  const src = readSrc(GUARD_REL);
  const fn = src.slice(src.indexOf('function isNonStudioOnlyDiff'), src.indexOf('// Caller-aware branch evaluation'));
  assert.ok(fn.includes('.some((p) => isStudioGovernedDomainPath(p))'));
});

// ===========================================================================
// E — evidence
// ===========================================================================
test('E001 this slice ships its own test, gate and evidence directory', () => {
  for (const rel of [TEST_REL, GATE_REL]) assert.ok(fs.existsSync(path.join(ROOT, rel)), rel);
  assert.ok(fs.existsSync(path.join(ROOT, EV_REL)));
});
for (const doc of ['README.md', 'IMPLEMENTATION-PLAN.md', 'SCOPE-CONTRACT.md',
  'DOMAIN-VS-AUTHORIZATION.md', 'NEGATIVE-MATRIX.md', 'TEST-MATRIX.md', 'GATE-MATRIX.md',
  'CI-BLOCKER-ROOT-CAUSE.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md']) {
  test(`E002 evidence present and non-trivial: ${doc}`, () => assert.ok(readEv(doc).length > 200, doc));
}
test('E003 the root cause document records the red run and the 61 failures', () => {
  const doc = readEv('CI-BLOCKER-ROOT-CAUSE.md');
  assert.match(doc, /31041688686/);
  assert.match(doc, /61/);
});
test('E004 the domain document states that domain is not authorization', () => {
  const doc = readEv('DOMAIN-VS-AUTHORIZATION.md');
  assert.match(doc, /STUDIO_GOVERNED_DOMAIN_PATTERNS/);
  assert.match(doc, /unknown_scope/);
});
test('E005 readiness declares the honest limits', () => {
  const doc = readEv('READINESS.md');
  assert.match(doc, /mainVerifiedGreen:\s*false/);
  assert.match(doc, /postMergeRevalidationRequired:\s*true/);
  assert.match(doc, /p1_01CiEnforcementDelivered:\s*false/);
});
test('E006 readiness records the catalog shape this slice produces', () => {
  const doc = readEv('READINESS.md');
  assert.match(doc, /catalogEntries:\s*46/);
  assert.match(doc, /catalogActiveSlices:\s*0/);
  assert.match(doc, /catalogOpenPullRequestStatuses:\s*0/);
  assert.match(doc, /catalogCompatibilityTrueCount:\s*0/);
});
test('E007 the negative matrix records every fail-closed state', () => {
  const doc = readEv('NEGATIVE-MATRIX.md');
  for (const token of ['unknown_scope', 'forbidden_scope', 'ambiguous_active_slice',
    'no_active_slice_resolved', 'invalid_changed_paths']) assert.ok(doc.includes(token), token);
});
test('E008 no historical evidence directory of an earlier slice is touched', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) {
    if (!p.startsWith('docs/evidence/')) continue;
    assert.ok(p.startsWith(EV_REL), p);
  }
});
test('E009 the workflow is NOT part of this slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.equal(p.startsWith('.github/'), false, p);
});

// ===========================================================================
// T — this branch, judged by its own rules
// ===========================================================================
test('T001 this branch is not applicable, or resolves exactly this slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = consumer(f);
  if (r.reason === 'empty_branch_diff' || r.reason === 'non_studio_branch') {
    assert.equal(r.notApplicable, true);
    assert.equal(r.activeSliceId, null);
    return;
  }
  assert.equal(r.activeSliceId, APPLICABILITY, JSON.stringify(r));
  assert.deepEqual(r.activeCandidates, [APPLICABILITY]);
});
test('T002 this branch is sound for this slice', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  const r = consumer(f);
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION]) {
  test(`T003 this branch is sound for earlier caller ${caller}`, () => {
    const f = changedOnThisBranch(); if (f === null) return;
    assert.equal(consumer(f, caller).safe, true);
  });
}
test('T004 this branch touches no forbidden path', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.notEqual(classifyStudioScopePath(p), 'forbidden_scope', p);
});
test('T005 this branch touches no Studio blueprint-engine source', () => {
  const f = changedOnThisBranch(); if (f === null) return;
  for (const p of f) assert.equal(p.startsWith('src/studio/'), false, p);
});
test('T006 when this branch owns the diff, every path is authorized by the active slice', () => {
  const f = changedOnThisBranch(); if (f === null || f.length === 0) return;
  const a = createResolvedActiveStudioSlicePathAuthorizer(f);
  if (!a.ok) { assert.equal(consumer(f).notApplicable, true); return; }
  for (const p of f) assert.equal(a.isAuthorized(p), true, p);
  for (const p of ['src/App.jsx', 'docs/nobody/x.md', 'src/modules/x.js']) {
    assert.equal(a.isAuthorized(p), false, p);
  }
});
test('T007 the empty diff and the non-Studio diff are both admitted, and differently', () => {
  assert.equal(consumer([]).reason, 'empty_branch_diff');
  assert.equal(consumer(['.github/workflows/foundation-governance.yml']).reason, 'non_studio_branch');
});
test('T008 the future CI-enforcement branch would be admitted by every consumer', () => {
  // The whole point of this slice: the 6-line workflow PR that comes next must not be
  // rejected by 61 governance assertions. Proven here against every governance caller.
  for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION, APPLICABILITY]) {
    const r = consumer(['.github/workflows/foundation-governance.yml'], caller);
    assert.equal(r.safe, true, caller);
    assert.equal(r.reason, 'non_studio_branch', caller);
  }
});
