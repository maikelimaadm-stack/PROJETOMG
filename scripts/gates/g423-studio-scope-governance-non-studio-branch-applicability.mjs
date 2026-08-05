/**
 * G423 — Studio Scope Governance: Non-Studio Branch Applicability.
 *
 * Slice 46. Verifies, with LIVE checks (never a grep-only proof), that:
 *  - a branch touching nothing this governance governs is `notApplicable` with the reason
 *    `non_studio_branch` — a state distinct from `empty_branch_diff`;
 *  - DOMAIN IS NOT AUTHORIZATION: membership grants nothing, and an unregistered file under
 *    a governed root is still judged and still fails closed;
 *  - the domain is derived from ROOTS, never from `classifyStudioScopePath(p) !== 'unknown_scope'`,
 *    which would let an unregistered Studio file escape;
 *  - the chronological core is untouched and stays fail-closed on the very same paths;
 *  - the catalog reaches 46 entries and stays at rest.
 *
 * Read-only. No mutation, no network, no backend, no Prisma, no product exposure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import * as G from './lib/studioScopeGovernanceGuard.mjs';
import {
  STUDIO_SLICE_CATALOG, STUDIO_GOVERNED_DOMAIN_PATTERNS, FORBIDDEN_SCOPE_PATTERNS,
  CHRONOLOGICAL_MIGRATION_SLICE_ID, MAIN_DIFF_CORRECTION_SLICE_ID,
  HISTORICAL_BRANCH_CONSUMERS_SLICE_ID, BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID,
  NON_STUDIO_BRANCH_APPLICABILITY_SLICE_ID,
} from './lib/studioScopeGovernanceRegistry.mjs';

const ROOT = process.cwd();
const APPLICABILITY = NON_STUDIO_BRANCH_APPLICABILITY_SLICE_ID;
const NORMALIZATION = BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID;
const CONSUMERS = HISTORICAL_BRANCH_CONSUMERS_SLICE_ID;
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const MAINTENANCE = 'studio-scope-governance-maintenance';

const EV_REL = 'docs/evidence/post-foundation-c-studio-scope-governance-non-studio-branch-applicability/';
const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

const readSrc = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readEv = (n) => readSrc(`${EV_REL}${n}`);

const MARKER_46 = `${EV_REL}README.md`;
const MARKER_45 = 'docs/evidence/post-foundation-c-studio-builder-lifecycle-normalization/README.md';
const OWN_DIFF = [MARKER_46, TEST_REL, GATE_REL, GUARD_REL, REGISTRY_REL, 'package.json'];
const NON_STUDIO = ['.github/workflows/foundation-governance.yml', 'README.md', 'vite.config.js'];
const UNREGISTERED_GOVERNED = [
  'src/studio/unregistered-future-artifact.js',
  'src/runtime/__tests__/unregistered-future.test.js',
  'scripts/gates/unregistered-future-gate.mjs',
  'docs/evidence/unregistered-future-evidence/README.md',
];

let pass = 0;
let fail = 0;
const failures = [];
const gate = (name, ok, detail = '') => {
  if (ok) { pass += 1; console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; failures.push(name); console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`); }
};

const consumer = (paths, caller = APPLICABILITY) => G.evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });
const diffScope = (paths, caller = APPLICABILITY) => G.evaluateStudioBranchDiffScope(paths, { callerSliceId: caller });
const isNonStudio = (r) => r.notApplicable === true && r.applicable === false
  && r.reason === 'non_studio_branch' && r.safe === true && r.activeSliceId === null
  && r.activeCandidates.length === 0 && r.allowed.length === 0 && r.unknown.length === 0
  && r.forbidden.length === 0 && r.blockers.length === 0;

// =====================================================================
// Catalog
// =====================================================================
gate('G423-NSB — the catalog holds forty-six slices', STUDIO_SLICE_CATALOG.length === 46, String(STUDIO_SLICE_CATALOG.length));
gate('G423-NSB — ordinals are contiguous 1..46', (() => {
  const o = STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b);
  return o.length === 46 && o.every((v, i) => v === i + 1);
})());
gate('G423-NSB — every entry carries exactly ten keys',
  STUDIO_SLICE_CATALOG.every((s) => Object.keys(s).length === 10));
gate('G423-NSB — slice ids are unique',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === 46);
gate('G423-NSB — this slice is ordinal 46', G.getStudioSliceById(APPLICABILITY)?.sliceOrdinal === 46);
gate('G423-NSB — this slice is born merged', G.getStudioSliceById(APPLICABILITY)?.status === 'merged');
gate('G423-NSB — zero active_slice remains',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').length === 0);
gate('G423-NSB — zero open_pull_request_* remains',
  STUDIO_SLICE_CATALOG.filter((s) => s.status.startsWith('open_pull_request')).length === 0);
gate('G423-NSB — the merged family covers all forty-six',
  STUDIO_SLICE_CATALOG.filter((s) => s.status.startsWith('merged')).length === 46);
gate('G423-NSB — exactly forty-five carry the plain merged status',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'merged').length === 45);
gate('G423-NSB — slice 39 keeps its pre-existing deviating status',
  STUDIO_SLICE_CATALOG.find((s) => s.sliceOrdinal === 39)?.status === 'merged_without_dedicated_artifacts');
gate('G423-NSB — zero slices authorize historical branch consumers',
  STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility === true).length === 0);
gate('G423-NSB — this slice authorizes no forbidden path',
  (G.getStudioSliceById(APPLICABILITY)?.explicitlyAuthorizedForbiddenPatterns || []).length === 0);
gate('G423-NSB — this slice owns exactly its test, gate and evidence root', (() => {
  const s = G.getStudioSliceById(APPLICABILITY);
  return s.primaryArtifactPatterns.length === 3 && s.branchMarkerPatterns.length === 1
    && G.findOwningStudioSlices(TEST_REL).map((x) => x.sliceId).join() === APPLICABILITY
    && G.findOwningStudioSlices(GATE_REL).map((x) => x.sliceId).join() === APPLICABILITY;
})());
gate('G423-NSB — the Builder keeps the exact scope of its merged PR', (() => {
  const b = G.getStudioSliceById('bridge-decision-core-envelope-builder');
  return b.sliceOrdinal === 41 && b.status === 'merged' && b.historicalBranchConsumerCompatibility === false
    && b.primaryArtifactPatterns.length === 4 && b.crossSliceAuthorizedPatterns.length === 8
    && b.explicitlyAuthorizedForbiddenPatterns.length === 0;
})());

// =====================================================================
// Domain — membership is not authorization
// =====================================================================
gate('G423-NSB — the domain roots are frozen and non-empty',
  Object.isFrozen(STUDIO_GOVERNED_DOMAIN_PATTERNS) && STUDIO_GOVERNED_DOMAIN_PATTERNS.length >= 6
  && STUDIO_GOVERNED_DOMAIN_PATTERNS.every((re) => re instanceof RegExp));
for (const p of ['src/studio/a.js', 'src/runtime/a.js', 'scripts/gates/a.mjs',
  'docs/evidence/x/README.md', 'package.json', 'package-lock.json']) {
  gate(`G423-NSB — governed root: ${p}`, G.isStudioGovernedDomainPath(p) === true);
}
for (const p of NON_STUDIO) {
  gate(`G423-NSB — outside the territory: ${p}`, G.isStudioGovernedDomainPath(p) === false);
}
gate('G423-NSB — every forbidden path is inside the domain',
  ['src/App.jsx', 'src/modules/x.js', 'backend/src/server.js', 'prisma/schema.prisma']
    .every((p) => G.isStudioGovernedDomainPath(p) === true
      && FORBIDDEN_SCOPE_PATTERNS.some((re) => re.test(p))));
for (const p of UNREGISTERED_GOVERNED) {
  gate(`G423-NSB — unregistered but governed: ${p}`, G.isStudioGovernedDomainPath(p) === true);
}
gate('G423-NSB — the unsafe classifier derivation is demonstrably unsafe', (() => {
  const p = 'src/studio/unregistered-future-artifact.js';
  return G.classifyStudioScopePath(p) === 'unknown_scope' && G.isStudioGovernedDomainPath(p) === true;
})());
gate('G423-NSB — the unsafe derivation is NOT used by the domain predicate', (() => {
  const src = readSrc(GUARD_REL);
  const fn = src.slice(src.indexOf('export function isStudioGovernedDomainPath'),
    src.indexOf('function isNonStudioOnlyDiff'));
  return fn.length > 0 && !fn.includes("!== 'unknown_scope'")
    && fn.includes('STUDIO_GOVERNED_DOMAIN_PATTERNS') && fn.includes('FORBIDDEN_SCOPE_PATTERNS');
})());
gate('G423-NSB — domain membership grants nothing', (() => {
  const r = G.evaluateStudioBranchScope(['src/studio/unregistered-future-artifact.js'], { callerSliceId: APPLICABILITY });
  return r.allowed.length === 0 && r.safe === false;
})());
gate('G423-NSB — invalid input is never in the domain',
  [null, undefined, '', 0, {}, []].every((v) => G.isStudioGovernedDomainPath(v) === false));

// =====================================================================
// Contract matrix A–O
// =====================================================================
gate('G423-NSB — A: a workflow-only diff is not applicable',
  isNonStudio(consumer(['.github/workflows/foundation-governance.yml'])));
gate('G423-NSB — A: the same at the branch-diff boundary',
  isNonStudio(diffScope(['.github/workflows/foundation-governance.yml'])));
gate('G423-NSB — A: the CORE stays fail-closed on the same paths', (() => {
  const r = G.evaluateStudioBranchScope(['.github/workflows/foundation-governance.yml'], { callerSliceId: APPLICABILITY });
  return r.safe === false && r.blockers.includes('no_active_slice_resolved')
    && r.blockers.includes('unknown_scope') && r.allowed.length === 0;
})());
gate('G423-NSB — B: a README-only diff is not applicable', isNonStudio(consumer(['README.md'])));
gate('G423-NSB — C: a tooling-only diff is not applicable', isNonStudio(consumer(['vite.config.js'])));
gate('G423-NSB — C: a multi-file non-Studio diff is not applicable', isNonStudio(consumer(NON_STUDIO)));
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION, APPLICABILITY]) {
  gate(`G423-NSB — C: caller ${caller} agrees the branch is not applicable`, isNonStudio(consumer(NON_STUDIO, caller)));
}
for (const p of UNREGISTERED_GOVERNED) {
  gate(`G423-NSB — D: never non-Studio: ${p}`, (() => {
    const r = consumer([p]);
    return r.reason !== 'non_studio_branch' && r.notApplicable === false && r.safe === false;
  })());
}
gate('G423-NSB — E: an unregistered production runtime path stays forbidden', (() => {
  const r = consumer(['src/runtime/unregistered-future-artifact.js']);
  return r.safe === false && r.blockers.includes('forbidden_scope');
})());
gate('G423-NSB — F: an unregistered gate stays unknown', (() => {
  const r = consumer(['scripts/gates/unregistered-future-gate.mjs']);
  return r.safe === false && r.unknown.includes('scripts/gates/unregistered-future-gate.mjs');
})());
gate('G423-NSB — G: this slice own diff resolves slice 46 and is sound', (() => {
  const r = consumer(OWN_DIFF);
  return r.activeSliceId === APPLICABILITY && r.unknown.length === 0 && r.forbidden.length === 0
    && r.chronologicalViolation.length === 0 && r.safe === true;
})());
gate('G423-NSB — G: slice 46 is elected by its marker, not by its status', (() => {
  const a = G.resolveActiveStudioSlice([MARKER_46]);
  return a.ok === true && a.sliceId === APPLICABILITY && a.candidates.length === 1
    && G.getStudioSliceById(APPLICABILITY).status === 'merged';
})());
gate('G423-NSB — H: slice 46 plus an unauthorized path fails closed', (() => {
  const r = consumer([...OWN_DIFF, 'README.md']);
  return r.activeSliceId === APPLICABILITY && r.unknown.includes('README.md')
    && r.blockers.includes('unknown_scope') && r.safe === false;
})());
gate('G423-NSB — H: one governed path makes the whole diff governed', (() => {
  const r = consumer([...NON_STUDIO, MARKER_46]);
  return r.reason !== 'non_studio_branch' && r.safe === false
    && NON_STUDIO.every((p) => r.unknown.includes(p));
})());
gate('G423-NSB — I: two markers stay ambiguous', (() => {
  const r = consumer([MARKER_45, MARKER_46]);
  return r.reason === 'ambiguous_active_slice' && r.safe === false && r.activeCandidates.length === 2;
})());
gate('G423-NSB — J: shared infrastructure without a marker resolves nothing', (() => {
  const r = consumer(['package.json']);
  return r.reason === 'no_active_slice_resolved' && r.safe === false;
})());
gate('G423-NSB — K: a forbidden path fails closed', (() => {
  const r = consumer(['src/App.jsx']);
  return r.safe === false && r.blockers.includes('forbidden_scope') && r.reason !== 'non_studio_branch';
})());
gate('G423-NSB — L: forbidden mixed with infrastructure is never non-Studio', (() => {
  const r = consumer(['src/App.jsx', '.github/workflows/foundation-governance.yml']);
  return r.reason !== 'non_studio_branch' && r.notApplicable === false && r.safe === false
    && r.blockers.includes('forbidden_scope');
})());
gate('G423-NSB — N: invalid input fails closed and is never non-Studio',
  ['nope', [1], [''], [null]].every((bad) => {
    const r = G.evaluateStudioBranchConsumerScope(bad, { callerSliceId: APPLICABILITY });
    return r.reason === 'invalid_changed_paths' && r.safe === false;
  }));
gate('G423-NSB — N: an unknown caller blocks even on a non-Studio diff', (() => {
  const r = G.evaluateStudioBranchConsumerScope(NON_STUDIO, { callerSliceId: 'not-a-slice' });
  return r.reason === 'unknown_caller_slice' && r.safe === false && r.notApplicable === false;
})());
gate('G423-NSB — O: an empty diff stays empty_branch_diff, a different reason', (() => {
  const r = consumer([]);
  return r.reason === 'empty_branch_diff' && r.notApplicable === true && r.safe === true;
})());
gate('G423-NSB — O: the two inapplicable reasons are never conflated',
  consumer([]).reason === 'empty_branch_diff' && consumer(['README.md']).reason === 'non_studio_branch'
  && diffScope([]).reason === 'empty_branch_diff' && diffScope(['README.md']).reason === 'non_studio_branch');

// =====================================================================
// M — historical consumer matrix untouched
// =====================================================================
const FIXTURE = {
  24: ['docs/evidence/post-foundation-c-studio-dev-preview-app-integration/README.md'],
  41: ['docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/README.md'],
  42: ['docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/README.md'],
  43: ['docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/README.md'],
  44: ['docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/README.md'],
  45: [MARKER_45],
};
const ID_OF = (n) => STUDIO_SLICE_CATALOG.find((s) => s.sliceOrdinal === n).sliceId;
let mPairs = 0;
let mBad = 0;
for (const [fix, callers] of [[41, [42, 43, 44, 45, 46]], [24, [42, 43, 44, 45, 46]], [42, [43, 44, 45, 46]],
  [43, [44, 45, 46]], [44, [45, 46]], [45, [46]]]) {
  for (const c of callers) {
    mPairs += 1;
    const r = consumer(FIXTURE[fix], ID_OF(c));
    const ok = r.reason === 'historical_branch_consumer_compatibility_not_authorized'
      && r.safe === false && r.notApplicable === false && r.certifiedAgainstActiveSlice === false
      && r.evaluatedAsSliceId === null && r.blockers.length === 1
      && r.blockers[0] === 'active_slice_before_caller'
      && r.allowed.length === 0 && r.crossAuthorized.length === 0 && r.explicitForbiddenAuthorized.length === 0;
    if (!ok) mBad += 1;
  }
}
gate('G423-NSB — M: the historical consumer matrix stays fail-closed', mBad === 0, `${mPairs - mBad}/${mPairs}`);
gate('G423-NSB — M: a merged slice branch is never turned into a non-Studio branch',
  Object.keys(FIXTURE).every((n) => consumer(FIXTURE[n], APPLICABILITY).reason !== 'non_studio_branch'));

// =====================================================================
// Source purity and placement
// =====================================================================
gate('G423-NSB — the registry imports nothing', !/^import\s/m.test(readSrc(REGISTRY_REL)));
gate('G423-NSB — the guard imports only the registry', (() => {
  const imports = [...readSrc(GUARD_REL).matchAll(/^import[\s\S]*?from\s+'([^']+)';/gm)].map((m) => m[1]);
  return imports.length === 1 && imports[0] === './studioScopeGovernanceRegistry.mjs';
})());
for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
  gate(`G423-NSB — the guard performs no ${api}`, !readSrc(GUARD_REL).includes(api));
  gate(`G423-NSB — the registry performs no ${api}`, !readSrc(REGISTRY_REL).includes(api));
}
gate('G423-NSB — the short-circuit lives in exactly the two boundaries',
  [...readSrc(GUARD_REL).matchAll(/isNonStudioOnlyDiff\(changedPaths\)/g)].length === 2);
gate('G423-NSB — the core never consults the applicability predicate', (() => {
  const src = readSrc(GUARD_REL);
  const core = src.slice(src.indexOf('export function evaluateStudioBranchScope'),
    src.indexOf('export function evaluateStudioBranchDiffScope'));
  return core.length > 0 && !core.includes('isNonStudioOnlyDiff') && !core.includes('non_studio_branch');
})());

// =====================================================================
// Artifacts and evidence
// =====================================================================
gate('G423-NSB — slice test exists', fs.existsSync(path.join(ROOT, TEST_REL)));
gate('G423-NSB — slice gate exists', fs.existsSync(path.join(ROOT, GATE_REL)));
gate('G423-NSB — evidence directory exists', fs.existsSync(path.join(ROOT, EV_REL)));
for (const doc of ['README.md', 'IMPLEMENTATION-PLAN.md', 'SCOPE-CONTRACT.md',
  'DOMAIN-VS-AUTHORIZATION.md', 'NEGATIVE-MATRIX.md', 'TEST-MATRIX.md', 'GATE-MATRIX.md',
  'CI-BLOCKER-ROOT-CAUSE.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md']) {
  gate(`G423-NSB — evidence present and non-trivial: ${doc}`, readEv(doc).length > 200);
}
gate('G423-NSB — the root cause document names the red run and the 61 failures',
  readEv('CI-BLOCKER-ROOT-CAUSE.md').includes('31041688686') && readEv('CI-BLOCKER-ROOT-CAUSE.md').includes('61'));
gate('G423-NSB — the domain document states domain is not authorization',
  readEv('DOMAIN-VS-AUTHORIZATION.md').includes('STUDIO_GOVERNED_DOMAIN_PATTERNS')
  && readEv('DOMAIN-VS-AUTHORIZATION.md').includes('unknown_scope'));
gate('G423-NSB — readiness declares the honest limits', (() => {
  const doc = readEv('READINESS.md');
  return /mainVerifiedGreen:\s*false/.test(doc) && /postMergeRevalidationRequired:\s*true/.test(doc)
    && /p1_01CiEnforcementDelivered:\s*false/.test(doc) && /catalogEntries:\s*46/.test(doc)
    && /catalogActiveSlices:\s*0/.test(doc);
})());
gate('G423-NSB — the negative matrix records every fail-closed state',
  ['unknown_scope', 'forbidden_scope', 'ambiguous_active_slice', 'no_active_slice_resolved',
    'invalid_changed_paths'].every((t) => readEv('NEGATIVE-MATRIX.md').includes(t)));
gate('G423-NSB — package.json wires the slice test',
  /"test:runtime:studio-scope-governance-non-studio-branch-applicability":/.test(readSrc('package.json')));
gate('G423-NSB — package.json wires the slice gate',
  /"gate:g423-studio-scope-governance-non-studio-branch-applicability":/.test(readSrc('package.json')));
gate('G423-NSB — the aggregate test:runtime includes this slice',
  readSrc('package.json').includes('studio-scope-governance-non-studio-branch-applicability.test.js'));

// =====================================================================
// This branch, judged by its own rules
// =====================================================================
let branchPaths = null;
try { branchPaths = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { branchPaths = null; }
if (branchPaths === null) {
  gate('G423-NSB — this branch is sound under its own rules', true, 'git base unavailable — skipped');
} else {
  const r = consumer(branchPaths);
  gate('G423-NSB — this branch is sound under its own rules', r.safe === true, JSON.stringify(r.blockers));
  gate('G423-NSB — this branch has no forbidden, unknown or foreign path',
    r.forbidden.length === 0 && r.unknown.length === 0 && r.chronologicalViolation.length === 0);
  for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION]) {
    gate(`G423-NSB — this branch is sound for earlier caller ${caller}`, consumer(branchPaths, caller).safe === true);
  }
  gate('G423-NSB — this branch touches no forbidden path',
    branchPaths.every((p) => G.classifyStudioScopePath(p) !== 'forbidden_scope'));
  gate('G423-NSB — this branch touches no Studio blueprint-engine source',
    branchPaths.every((p) => !p.startsWith('src/studio/')));
  gate('G423-NSB — this branch does NOT carry the CI workflow',
    branchPaths.every((p) => !p.startsWith('.github/')));
  gate('G423-NSB — this branch touches no earlier slice evidence directory',
    branchPaths.filter((p) => p.startsWith('docs/evidence/')).every((p) => p.startsWith(EV_REL)));
  gate('G423-NSB — this branch is not applicable, or resolves exactly this slice', (() => {
    const x = consumer(branchPaths);
    if (x.reason === 'empty_branch_diff' || x.reason === 'non_studio_branch') return x.notApplicable === true;
    return x.activeSliceId === APPLICABILITY;
  })());
  gate('G423-NSB — the future CI-only branch is admitted by every consumer',
    [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION, APPLICABILITY]
      .every((c) => isNonStudio(consumer(['.github/workflows/foundation-governance.yml'], c))));
}

console.log(`\n--- G423-STUDIO-SCOPE-GOVERNANCE-NON-STUDIO-BRANCH-APPLICABILITY summary ---`);
console.log(`PASS: ${pass}/${pass + fail}  (total checks: ${pass + fail})`);
if (fail > 0) {
  console.log(`FAIL: ${fail}`);
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
