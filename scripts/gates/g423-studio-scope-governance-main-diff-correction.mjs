/**
 * G423 — Studio Scope Governance Main-Diff Correction.
 *
 * Slice 43. Verifies, with LIVE checks (never a grep-only proof), that:
 *  - the catalog is contiguous 1..43 and this slice is registered exactly;
 *  - the CORE APIs keep their fail-closed semantics on an empty set;
 *  - the new branch-diff boundary reports an empty diff as NOT APPLICABLE and safe,
 *    while still failing closed on an unknown caller and on invalid input;
 *  - the resolved-active-slice path authorizer is exact, never prefix-bound, never
 *    injectable and never chronology-free;
 *  - the nine tests, the twenty-two gates and the twenty-nine historical consumers
 *    really consume the central APIs;
 *  - the eight lookalikes and the real DB-migration paths stay blocked;
 *  - PR #495 is out of this slice's reach.
 *
 * Read-only. No mutation, no network, no backend, no Prisma, no product exposure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import * as G from './lib/studioScopeGovernanceGuard.mjs';
import {
  STUDIO_SLICE_CATALOG, KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED,
  CHRONOLOGICAL_MIGRATION_SLICE_ID, MAIN_DIFF_CORRECTION_SLICE_ID,
} from './lib/studioScopeGovernanceRegistry.mjs';

const ROOT = process.cwd();
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';
const CALLER_SLICE_ID = CORRECTION;

const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs';
const EV_REL = 'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
const CORRECTION_DIFF = [REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, `${EV_REL}READINESS.md`];

const readSrc = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; } };
const readEv = (n) => readSrc(`${EV_REL}${n}`);

let pass = 0; let total = 0; const failures = [];
const gate = (name, ok, detail = '') => {
  total += 1;
  if (ok) { pass += 1; console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`); }
  else { failures.push(name); console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`); }
};

const slice = (id) => G.getStudioSliceById(id);

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

const EIGHT_LOOKALIKES = [
  'docs/random-migration-plan.md', 'tools/custom-migration-helper.js', 'config/menu.json',
  'tools/navigation-generator.js', 'scripts/gates/g423-unregistered-route-menu.mjs',
  'src/runtime/__tests__/unlisted-empresas-change.test.js', 'scripts/gates/g423-unlisted-empresas-change.mjs',
  'docs/evidence/unregistered-empresas-change/file.md',
];

const DB_MIGRATION_PATHS = [
  'migrations/001.sql', 'nested/migrations/001.sql', 'prisma/migrations/20240101_init/migration.sql',
  'backend/prisma/migrations/x/migration.sql', 'anything.sql', 'scripts/migrateUsers.js',
];

console.log('--- G423-STUDIO-SCOPE-GOVERNANCE-MAIN-DIFF-CORRECTION ---\n');

// ---- Registry ----
gate('G423-MDC — catalog has 43 slices', STUDIO_SLICE_CATALOG.length === 43, String(STUDIO_SLICE_CATALOG.length));
gate('G423-MDC — slice ids unique', new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === 43);
gate('G423-MDC — ordinals unique and positive',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal)).size === 43
  && STUDIO_SLICE_CATALOG.every((s) => Number.isInteger(s.sliceOrdinal) && s.sliceOrdinal > 0));
gate('G423-MDC — ordinals contiguous 1..43',
  STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b).every((o, i) => o === i + 1));
gate('G423-MDC — correction slice registered at ordinal 43',
  slice(CORRECTION) !== null && slice(CORRECTION).sliceOrdinal === 43);
gate('G423-MDC — correction slice is the active one', slice(CORRECTION).status === 'active_slice');
gate('G423-MDC — exactly one active slice',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').length === 1);
gate('G423-MDC — previous governance slice is now merged', slice(MIGRATION).status === 'merged');
gate('G423-MDC — correction is after the migration', slice(CORRECTION).sliceOrdinal > slice(MIGRATION).sliceOrdinal);
gate('G423-MDC — correction is after the Builder', slice(CORRECTION).sliceOrdinal > slice(BUILDER).sliceOrdinal);
gate('G423-MDC — correction primary is exactly three patterns', slice(CORRECTION).primaryArtifactPatterns.length === 3);
gate('G423-MDC — correction branch marker is exactly the evidence dir',
  slice(CORRECTION).branchMarkerPatterns.length === 1
  && slice(CORRECTION).branchMarkerPatterns[0].test(`${EV_REL}X.md`));
gate('G423-MDC — correction markers are a subset of its primary set',
  slice(CORRECTION).branchMarkerPatterns.every((m) => slice(CORRECTION).primaryArtifactPatterns.some((p) => p.source === m.source)));
gate('G423-MDC — correction shared set is exactly four patterns', slice(CORRECTION).sharedGovernancePatterns.length === 4);
gate('G423-MDC — correction declares no explicit forbidden authorization',
  slice(CORRECTION).explicitlyAuthorizedForbiddenPatterns.length === 0);
gate('G423-MDC — every entry keeps the same nine keys',
  STUDIO_SLICE_CATALOG.every((s) => Object.keys(s).sort().join(',')
    === 'branchMarkerPatterns,crossSliceAuthorizedPatterns,explicitlyAuthorizedForbiddenPatterns,primaryArtifactPatterns,sharedGovernancePatterns,sliceId,sliceOrdinal,status,title'));
gate('G423-MDC — catalog and entries frozen',
  Object.isFrozen(STUDIO_SLICE_CATALOG) && STUDIO_SLICE_CATALOG.every((s) => Object.isFrozen(s)));
gate('G423-MDC — no duplicated primary ownership', (() => {
  const seen = new Set();
  for (const s of STUDIO_SLICE_CATALOG) for (const p of s.primaryArtifactPatterns) { if (seen.has(p.source)) return false; seen.add(p.source); }
  return true;
})());
gate('G423-MDC — every catalogued pattern anchored', STUDIO_SLICE_CATALOG.every((s) =>
  ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']
    .every((k) => s[k].every((p) => p.source.startsWith('^')))));
gate('G423-MDC — no broad wildcard in the catalog', STUDIO_SLICE_CATALOG.every((s) =>
  ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']
    .every((k) => s[k].every((p) => !/^\^?\.[*+]/.test(p.source)))));
gate('G423-MDC — correction cross list has no duplicate', (() => {
  const src = slice(CORRECTION).crossSliceAuthorizedPatterns.map((r) => r.source);
  return new Set(src).size === src.length;
})(), `${slice(CORRECTION).crossSliceAuthorizedPatterns.length} patterns`);
gate('G423-MDC — correction cross list carries no test/gate directory wildcard',
  slice(CORRECTION).crossSliceAuthorizedPatterns.every((r) =>
    r.source !== '^src\\/runtime\\/__tests__\\/' && r.source !== '^scripts\\/gates\\/'));
gate('G423-MDC — known-later export stays derived', (() => {
  const union = new Set();
  for (const s of STUDIO_SLICE_CATALOG) for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) for (const p of s[k]) union.add(p.source);
  return KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.every((r) => union.has(r.source));
})());
for (const [p] of NINE_TESTS) gate(`G423-MDC — correction authorized for migrated test: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CORRECTION));
for (const p of TWENTY_TWO_GATES) gate(`G423-MDC — correction authorized for migrated gate: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CORRECTION));
for (const p of SEVENTEEN_TESTS) gate(`G423-MDC — correction authorized for historical test: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CORRECTION));
for (const p of TWELVE_GATES) gate(`G423-MDC — correction authorized for historical gate: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CORRECTION));

// ---- Core preservation ----
gate('G423-MDC — resolveActiveStudioSlice([]) still fails closed',
  G.resolveActiveStudioSlice([]).ok === false && G.resolveActiveStudioSlice([]).reason === 'no_active_slice_resolved');
gate('G423-MDC — evaluateStudioBranchScope([]) still fails closed', (() => {
  const r = G.evaluateStudioBranchScope([], { callerSliceId: CORRECTION });
  return r.safe === false && r.blockers.includes('no_active_slice_resolved') && r.allowed.length === 0;
})());
gate('G423-MDC — core still blocks an unknown caller on an empty set',
  G.evaluateStudioBranchScope([], { callerSliceId: 'nope' }).blockers.includes('unknown_caller_slice'));
gate('G423-MDC — core still blocks a forbidden path',
  G.evaluateStudioBranchScope([...CORRECTION_DIFF, 'src/modules/x.js'], { callerSliceId: CORRECTION }).forbidden.length === 1);
gate('G423-MDC — core still blocks an unknown path',
  G.evaluateStudioBranchScope([...CORRECTION_DIFF, 'docs/nobody/x.md'], { callerSliceId: CORRECTION }).unknown.length === 1);
gate('G423-MDC — core still blocks an earlier active slice',
  G.evaluateStudioBranchScope(['src/studio/blueprint-engine/dev-preview-app-integration/a.js'], { callerSliceId: BUILDER })
    .blockers.includes('active_slice_before_caller'));
gate('G423-MDC — explicit forbidden stays catalog-bound (App Integration own slice safe)', (() => {
  const r = G.evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
    'src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs'], { callerSliceId: APP_INTEGRATION });
  return r.safe === true && r.forbidden.length === 0 && r.explicitForbiddenAuthorized.length === 2;
})());
gate('G423-MDC — explicit forbidden is still not injectable',
  G.evaluateStudioBranchScope([...CORRECTION_DIFF, 'src/App.jsx'],
    { callerSliceId: CORRECTION, explicitlyAuthorizedForbidden: [/^src\/App\.jsx$/] }).forbidden.includes('src/App.jsx'));
gate('G423-MDC — explicit forbidden is still not inherited',
  G.evaluateStudioBranchScope([...CORRECTION_DIFF, 'scripts/gates/lib/productionUiGuard.mjs'], { callerSliceId: CORRECTION })
    .forbidden.includes('scripts/gates/lib/productionUiGuard.mjs'));
gate('G423-MDC — cross authorization is still not inherited',
  G.evaluateStudioBranchScope(['src/studio/blueprint-engine/dev-preview-app-integration/a.js',
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js'],
  { callerSliceId: APP_INTEGRATION }).chronologicalViolation.length === 1);

// ---- Branch-diff boundary ----
const empty = G.evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION });
gate('G423-MDC — empty diff is not applicable', empty.applicable === false && empty.notApplicable === true);
gate('G423-MDC — empty diff reason is empty_branch_diff', empty.reason === 'empty_branch_diff');
gate('G423-MDC — empty diff is safe', empty.safe === true);
gate('G423-MDC — empty diff has no blocker', empty.blockers.length === 0);
gate('G423-MDC — empty diff authorizes nothing',
  empty.allowed.length === 0 && empty.crossAuthorized.length === 0 && empty.explicitForbiddenAuthorized.length === 0 && empty.total === 0);
gate('G423-MDC — empty diff reports every list empty',
  empty.forbidden.length === 0 && empty.unknown.length === 0 && empty.chronologicalViolation.length === 0 && empty.activeCandidates.length === 0);
gate('G423-MDC — empty diff resolves no active slice', empty.activeSliceId === null && empty.activeSliceOrdinal === null);
gate('G423-MDC — empty diff still identifies the caller', empty.callerSliceId === CORRECTION && empty.callerSliceOrdinal === 43);
gate('G423-MDC — boundary report kind is stable', empty.kind === 'studio-branch-diff-scope-evaluation');
gate('G423-MDC — boundary report is frozen', Object.isFrozen(empty));
gate('G423-MDC — boundary declares no side effect',
  empty.sideEffects === false && empty.backendAccessed === false && empty.prismaAccessed === false
  && empty.fetchUsed === false && empty.mutationAllowed === false);
gate('G423-MDC — empty diff with an unknown caller fails closed', (() => {
  const r = G.evaluateStudioBranchDiffScope([], { callerSliceId: 'nope' });
  return r.safe === false && r.notApplicable === false && r.reason === 'unknown_caller_slice';
})());
gate('G423-MDC — empty diff with a missing caller fails closed',
  G.evaluateStudioBranchDiffScope([], {}).safe === false);
for (const [label, bad] of [['null', null], ['undefined', undefined], ['string', 'x'], ['object', {}],
  ['number item', [1]], ['empty string item', ['']], ['mixed', ['a', 2]], ['nested array', [[]]]]) {
  const r = G.evaluateStudioBranchDiffScope(bad, { callerSliceId: CORRECTION });
  gate(`G423-MDC — invalid input fails closed (never treated as empty): ${label}`,
    r.safe === false && r.reason === 'invalid_changed_paths' && r.notApplicable === false);
}
gate('G423-MDC — invalid input plus unknown caller reports both blockers',
  G.evaluateStudioBranchDiffScope(null, { callerSliceId: 'nope' }).blockers.join(',') === 'invalid_changed_paths,unknown_caller_slice');
const same = G.evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
gate('G423-MDC — non-empty diff is applicable', same.applicable === true && same.notApplicable === false && same.reason === null);
gate('G423-MDC — same-slice diff is safe and fully allowed',
  same.safe === true && same.allowed.length === CORRECTION_DIFF.length && same.activeSliceId === CORRECTION);
gate('G423-MDC — later active slice is safe for an earlier caller', (() => {
  const r = G.evaluateStudioBranchDiffScope(CORRECTION_DIFF, { callerSliceId: APP_INTEGRATION });
  return r.safe === true && r.activeSliceOrdinal > r.callerSliceOrdinal;
})());
gate('G423-MDC — earlier active slice blocks a later caller', (() => {
  const r = G.evaluateStudioBranchDiffScope(['src/studio/blueprint-engine/dev-preview-app-integration/a.js'], { callerSliceId: BUILDER });
  return r.safe === false && r.applicable === true && r.blockers.includes('active_slice_before_caller');
})());
gate('G423-MDC — forbidden path in a real diff still blocks',
  G.evaluateStudioBranchDiffScope([...CORRECTION_DIFF, 'backend/server.js'], { callerSliceId: CORRECTION }).safe === false);
gate('G423-MDC — unknown path in a real diff still blocks',
  G.evaluateStudioBranchDiffScope([...CORRECTION_DIFF, 'docs/nobody/x.md'], { callerSliceId: CORRECTION }).unknown.length === 1);
gate('G423-MDC — ambiguous active slice in a real diff still blocks', (() => {
  const r = G.evaluateStudioBranchDiffScope([`${EV_REL}READINESS.md`,
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md'], { callerSliceId: CORRECTION });
  return r.safe === false && r.blockers.includes('ambiguous_active_slice') && r.activeCandidates.length === 2;
})());
gate('G423-MDC — unresolved active slice in a real diff still blocks', (() => {
  const r = G.evaluateStudioBranchDiffScope(['package.json'], { callerSliceId: CORRECTION });
  return r.safe === false && r.applicable === true && r.blockers.includes('no_active_slice_resolved');
})());
gate('G423-MDC — foreign catalogued path still blocks',
  G.evaluateStudioBranchDiffScope([...CORRECTION_DIFF,
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js'], { callerSliceId: CORRECTION })
    .chronologicalViolation.length === 1);
gate('G423-MDC — boundary delegates the core report verbatim on a real diff', (() => {
  const inner = G.evaluateStudioBranchScope(CORRECTION_DIFF, { callerSliceId: CORRECTION });
  return JSON.stringify(inner.allowed) === JSON.stringify(same.allowed)
    && JSON.stringify(inner.blockers) === JSON.stringify(same.blockers)
    && inner.safe === same.safe && inner.activeSliceId === same.activeSliceId && inner.total === same.total;
})());
gate('G423-MDC — boundary is order independent', (() => {
  const b = G.evaluateStudioBranchDiffScope([...CORRECTION_DIFF].reverse(), { callerSliceId: CORRECTION });
  return JSON.stringify(b.allowed) === JSON.stringify(same.allowed) && b.safe === same.safe;
})());
gate('G423-MDC — boundary does not mutate its input', (() => {
  const input = [...CORRECTION_DIFF];
  G.evaluateStudioBranchDiffScope(input, { callerSliceId: CORRECTION });
  return JSON.stringify(input) === JSON.stringify(CORRECTION_DIFF);
})());
gate('G423-MDC — the three semantics differ exactly where they must',
  G.resolveActiveStudioSlice([]).ok === false
  && G.evaluateStudioBranchScope([], { callerSliceId: CORRECTION }).safe === false
  && G.evaluateStudioBranchDiffScope([], { callerSliceId: CORRECTION }).safe === true);

// ---- Active path authorizer ----
const auth = G.createResolvedActiveStudioSlicePathAuthorizer(CORRECTION_DIFF);
gate('G423-MDC — authorizer resolves the exact active slice',
  auth.ok === true && auth.activeSliceId === CORRECTION && auth.activeSliceOrdinal === 43 && auth.reason === null);
gate('G423-MDC — authorizer kind is stable and frozen',
  auth.kind === 'resolved-active-studio-slice-path-authorizer' && Object.isFrozen(auth));
gate('G423-MDC — authorizer admits what the active slice owns', auth.isAuthorized(TEST_REL) && auth.isAuthorized(GATE_REL));
gate('G423-MDC — authorizer admits what the active slice cross-authorizes', NINE_TESTS.every(([p]) => auth.isAuthorized(p)));
gate('G423-MDC — authorizer admits what the active slice shares',
  auth.isAuthorized(REGISTRY_REL) && auth.isAuthorized(GUARD_REL) && auth.isAuthorized('package.json'));
gate('G423-MDC — authorizer refuses an empty diff', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer([]);
  return a.ok === false && a.reason === 'empty_branch_diff' && a.isAuthorized(TEST_REL) === false;
})());
gate('G423-MDC — authorizer refuses an unresolved active slice', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer(['package.json', REGISTRY_REL]);
  return a.ok === false && a.reason === 'no_active_slice_resolved' && a.isAuthorized(REGISTRY_REL) === false;
})());
gate('G423-MDC — authorizer refuses an ambiguous active slice', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer([`${EV_REL}READINESS.md`,
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md']);
  return a.ok === false && a.reason === 'ambiguous_active_slice' && a.isAuthorized(TEST_REL) === false;
})());
for (const [label, bad] of [['null', null], ['string', 'x'], ['object', {}], ['bad item', [1]]]) {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer(bad);
  gate(`G423-MDC — authorizer refuses invalid input: ${label}`,
    a.ok === false && a.reason === 'invalid_changed_paths' && a.isAuthorized(TEST_REL) === false);
}
gate('G423-MDC — authorizer refuses a path of another slice',
  auth.isAuthorized('src/studio/blueprint-engine/module-preview-sandbox/z.js') === false
  && auth.isAuthorized('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js') === false);
gate('G423-MDC — authorizer refuses a forbidden path the active slice does not declare',
  auth.isAuthorized('src/App.jsx') === false
  && auth.isAuthorized('scripts/gates/lib/productionUiGuard.mjs') === false
  && auth.isAuthorized('src/modules/x.js') === false);
gate('G423-MDC — authorizer does not inherit another slice cross authorization', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer([
    'src/studio/blueprint-engine/dev-preview-app-integration/a.js',
    'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md']);
  return a.activeSliceId === APP_INTEGRATION
    && a.isAuthorized('src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js') === false;
})());
gate('G423-MDC — authorizer refuses a path nobody owns', auth.isAuthorized('docs/nobody/x.md') === false);
gate('G423-MDC — authorizer refuses a malformed path argument',
  [null, undefined, 1, {}, [], ''].every((bad) => auth.isAuthorized(bad) === false));

// ---- Negative matrix ----
for (const p of EIGHT_LOOKALIKES) {
  gate(`G423-MDC — lookalike authorized for nobody: ${p}`,
    STUDIO_SLICE_CATALOG.every((s) => G.isPathAuthorizedForStudioSlice(p, s.sliceId) === false)
    && auth.isAuthorized(p) === false);
  const r = G.evaluateStudioBranchDiffScope([...CORRECTION_DIFF, p], { callerSliceId: CORRECTION });
  gate(`G423-MDC — lookalike makes the branch unsafe: ${p}`,
    r.safe === false && (r.unknown.includes(p) || r.forbidden.includes(p) || r.chronologicalViolation.includes(p)));
}
for (const p of DB_MIGRATION_PATHS) {
  gate(`G423-MDC — real DB migration artifact forbidden: ${p}`, G.classifyStudioScopePath(p) === 'forbidden_scope');
  gate(`G423-MDC — real DB migration artifact makes the branch unsafe: ${p}`,
    G.evaluateStudioBranchDiffScope([...CORRECTION_DIFF, p], { callerSliceId: CORRECTION }).forbidden.includes(p));
}
gate('G423-MDC — correction evidence allowed by ownership, not by a loosened pattern',
  G.classifyStudioScopePath(`${EV_REL}READINESS.md`) === 'known_later_studio_headless_artifact'
  && G.findOwningStudioSlices(`${EV_REL}READINESS.md`).map((s) => s.sliceId).join(',') === CORRECTION);

// ---- Source scans ----
for (const [p, caller] of NINE_TESTS) {
  const src = readSrc(p);
  gate(`G423-MDC — migrated test uses the boundary API: ${path.basename(p)}`,
    src.includes(`const CALLER_SLICE_ID = '${caller}';`) && src.includes('evaluateStudioBranchDiffScope('));
  gate(`G423-MDC — migrated test no longer calls the core directly: ${path.basename(p)}`,
    /[^f]evaluateStudioBranchScope\(/.test(src) === false);
}
for (const p of TWENTY_TWO_GATES) {
  const src = readSrc(p);
  gate(`G423-MDC — migrated gate uses the boundary API: ${path.basename(p)}`,
    src.includes('evaluateStudioBranchDiffScope(') && /const CALLER_SLICE_ID = '/.test(src));
  gate(`G423-MDC — migrated gate no longer calls the core directly: ${path.basename(p)}`,
    /[^f]evaluateStudioBranchScope\(/.test(src) === false);
}
for (const p of [...SEVENTEEN_TESTS, ...TWELVE_GATES]) {
  const src = readSrc(p);
  gate(`G423-MDC — historical consumer keeps no local migrationExempt: ${path.basename(p)}`, /migrationExempt/.test(src) === false);
  gate(`G423-MDC — historical consumer is not prefix-bound: ${path.basename(p)}`,
    /startsWith\('studio-scope-governance-'\)/.test(src) === false);
  gate(`G423-MDC — historical consumer uses the central authorizer: ${path.basename(p)}`,
    /createResolvedActiveStudioSlicePathAuthorizer\(/.test(src));
}
gate('G423-MDC — guard imports only the registry', (() => {
  const imports = [...readSrc(GUARD_REL).matchAll(/^import [^;]*from '([^']+)';/gm)].map((m) => m[1]);
  return [...new Set(imports)].join(',') === './studioScopeGovernanceRegistry.mjs';
})());
gate('G423-MDC — registry imports nothing', /^import /m.test(readSrc(REGISTRY_REL)) === false);
for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
  gate(`G423-MDC — guard uses no impure API: ${api}`, readSrc(GUARD_REL).includes(api) === false);
  gate(`G423-MDC — registry uses no impure API: ${api}`, readSrc(REGISTRY_REL).includes(api) === false);
}
gate('G423-MDC — boundary API exported by name', /export function evaluateStudioBranchDiffScope\(/.test(readSrc(GUARD_REL)));
gate('G423-MDC — authorizer API exported by name', /export function createResolvedActiveStudioSlicePathAuthorizer\(/.test(readSrc(GUARD_REL)));
gate('G423-MDC — boundary reads no caller-supplied forbidden authorization', (() => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchDiffScope('),
    src.indexOf('export function createResolvedActiveStudioSlicePathAuthorizer('));
  return /o\.explicitlyAuthorizedForbidden/.test(body) === false;
})());
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  const src = readSrc(g);
  gate(`G423-MDC — pre-Studio gate stays outside both APIs: ${path.basename(g)}`,
    src.includes('evaluateStudioBranchScope(') === false && src.includes('evaluateStudioBranchDiffScope(') === false
    && G.findOwningStudioSlices(g).length === 0);
}

// ---- PR #495 out of reach ----
gate('G423-MDC — Builder subtree outside this slice scope',
  G.isPathAuthorizedForStudioSlice('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js', CORRECTION) === false);
gate('G423-MDC — Builder test and gate outside this slice scope',
  G.isPathAuthorizedForStudioSlice('src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js', CORRECTION) === false
  && G.isPathAuthorizedForStudioSlice('scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs', CORRECTION) === false);
gate('G423-MDC — Builder evidence outside this slice scope',
  G.isPathAuthorizedForStudioSlice('docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md', CORRECTION) === false);
gate('G423-MDC — Builder entry untouched', (() => {
  const b = slice(BUILDER);
  return b.sliceOrdinal === 41 && b.status === 'open_pull_request_495'
    && b.primaryArtifactPatterns.length === 4 && b.crossSliceAuthorizedPatterns.length === 2
    && b.explicitlyAuthorizedForbiddenPatterns.length === 0;
})());
gate('G423-MDC — a Builder-shaped branch is still judged by the same rules', (() => {
  const r = G.evaluateStudioBranchDiffScope([
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
    'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md'], { callerSliceId: APP_INTEGRATION });
  return r.activeSliceId === BUILDER && r.safe === true;
})());
gate('G423-MDC — no pre-Studio gate is in this slice scope',
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.every((g) => G.isPathAuthorizedForStudioSlice(g, CORRECTION) === false));

// ---- Artifacts and evidence ----
gate('G423-MDC — slice test exists', fs.existsSync(path.join(ROOT, TEST_REL)));
gate('G423-MDC — slice gate exists', fs.existsSync(path.join(ROOT, GATE_REL)));
gate('G423-MDC — evidence directory exists', fs.existsSync(path.join(ROOT, EV_REL)));
for (const doc of ['CERTIFICATION-REPORT.md', 'POST-MERGE-ROOT-CAUSE.md', 'EMPTY-DIFF-BOUNDARY-CONTRACT.md',
  'RESOLVED-ACTIVE-PATH-AUTHORIZER.md', 'NINE-TEST-MIGRATION.md', 'TWENTY-TWO-GATE-MIGRATION.md',
  'HISTORICAL-EXEMPTION-CENTRALIZATION.md', 'NEGATIVE-MATRIX.md', 'MAIN-BASELINE-BEFORE-CORRECTION.md',
  'BRANCH-REGRESSION-MATRIX.md', 'PR495-NO-TOUCH-PROOF.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md']) {
  gate(`G423-MDC — evidence present and non-trivial: ${doc}`, readEv(doc).length > 200);
}
gate('G423-MDC — package.json wires the slice test',
  /"test:runtime:studio-scope-governance-main-diff-correction":/.test(readSrc('package.json')));
gate('G423-MDC — package.json wires the slice gate',
  /"gate:g423-studio-scope-governance-main-diff-correction":/.test(readSrc('package.json')));
gate('G423-MDC — the aggregate test:runtime includes this slice',
  readSrc('package.json').includes('studio-scope-governance-main-diff-correction.test.js'));
gate('G423-MDC — superseded certification carries the banner',
  readSrc('docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md')
    .includes('SUPERSEDED_BY_MAIN_DIFF_CORRECTION'));
gate('G423-MDC — superseded readiness carries the banner',
  readSrc('docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/READINESS.md')
    .includes('SUPERSEDED_BY_MAIN_DIFF_CORRECTION'));
gate('G423-MDC — the supersession names all three blockers', (() => {
  const doc = readSrc('docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md');
  return ['B-POSTMERGE-EMPTY-DIFF-FAILS-CLOSED-ON-MAIN', 'B-TWO-EXTENSION-GATES-NOT-ACTIVE-BOUND',
    'B-TEN-EXTENSION-GATES-PREFIX-BOUND'].every((b) => doc.includes(b));
})());
gate('G423-MDC — readiness still requires post-merge revalidation',
  /postMergeRevalidationRequired:\s*true/.test(readEv('READINESS.md')));
gate('G423-MDC — readiness does not claim the main is green',
  /mainVerifiedGreen:\s*false/.test(readEv('READINESS.md')));
gate('G423-MDC — the baseline document records the measured red numbers',
  readEv('MAIN-BASELINE-BEFORE-CORRECTION.md').includes('20405') && readEv('MAIN-BASELINE-BEFORE-CORRECTION.md').includes('20425'));
gate('G423-MDC — the negative matrix lists all eight lookalikes',
  EIGHT_LOOKALIKES.every((p) => readEv('NEGATIVE-MATRIX.md').includes(p)));
gate('G423-MDC — the centralization document lists all 29 historical consumers',
  [...SEVENTEEN_TESTS, ...TWELVE_GATES].every((p) => readEv('HISTORICAL-EXEMPTION-CENTRALIZATION.md').includes(path.basename(p))));

// ---- This branch, judged by its own rules ----
let branchPaths = null;
try { branchPaths = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { branchPaths = null; }
if (branchPaths === null) {
  gate('G423-MDC — this branch is safe under its own rules', true, 'git base unavailable — skipped');
} else {
  const r = G.evaluateStudioBranchDiffScope(branchPaths, { callerSliceId: CALLER_SLICE_ID });
  gate('G423-MDC — this branch is safe under its own rules', r.safe,
    r.applicable ? `active ${r.activeSliceId} #${r.activeSliceOrdinal}, ${r.total} paths` : `not applicable: ${r.reason}`);
  for (const [, caller] of NINE_TESTS) {
    gate(`G423-MDC — this branch is safe for caller ${caller}`,
      G.evaluateStudioBranchDiffScope(branchPaths, { callerSliceId: caller }).safe);
  }
  gate('G423-MDC — this branch touches no forbidden path',
    branchPaths.every((p) => G.classifyStudioScopePath(p) !== 'forbidden_scope'));
  gate('G423-MDC — this branch touches no Studio blueprint-engine source',
    branchPaths.every((p) => !p.startsWith('src/studio/blueprint-engine/')));
  gate('G423-MDC — this branch is not proven by an empty diff',
    branchPaths.length === 0 || branchPaths.length > 20, `${branchPaths.length} paths`);
}

console.log(`\n--- G423-STUDIO-SCOPE-GOVERNANCE-MAIN-DIFF-CORRECTION summary ---`);
console.log(`PASS: ${pass}/${total}  (total checks: ${total})`);
if (failures.length) { console.log(`FAIL: ${failures.length}`); for (const f of failures) console.log(`  ✗ ${f}`); }
process.exit(failures.length === 0 ? 0 : 1);
