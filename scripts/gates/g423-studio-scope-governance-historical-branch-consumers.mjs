/**
 * G423 — Studio Scope Governance Historical Branch Consumers.
 *
 * Slice 44. Verifies, with LIVE checks (never a grep-only proof), that:
 *  - the catalog is contiguous 1..44 and this slice is registered exactly;
 *  - the CORE certification APIs are byte-for-byte unweakened: an earlier active
 *    slice still FAILS a later caller through evaluateStudioBranchScope and through
 *    evaluateStudioBranchDiffScope, and no permissive option was introduced;
 *  - the NEW consumer-applicability boundary separates BRANCH CERTIFICATION from
 *    CONSUMER APPLICABILITY: a later consumer riding an older branch is declared
 *    NOT APPLICABLE only after the branch has been re-certified against the slice
 *    that actually owns it, and never masks a forbidden, unknown, foreign,
 *    ambiguous or unresolved path;
 *  - the nine tests, the twenty-two gates and the five branch-judging governance
 *    consumers really ask about their own applicability;
 *  - PR #495 is out of this slice's reach, in the catalog and in the diff.
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
  HISTORICAL_BRANCH_CONSUMERS_SLICE_ID,
} from './lib/studioScopeGovernanceRegistry.mjs';

const ROOT = process.cwd();
const CONSUMERS = HISTORICAL_BRANCH_CONSUMERS_SLICE_ID;
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const MAINTENANCE = 'studio-scope-governance-maintenance';
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';
const CALLER_SLICE_ID = CONSUMERS;

const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs';
const EV_REL = 'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

/** A minimal, deterministic diff that resolves THIS slice as the active one. */
const OWN_DIFF = [REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, `${EV_REL}READINESS.md`];

/** The representative diff of PR #495 — the Builder, ordinal 41. */
const BUILDER41_FIXTURE = [
  'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js',
  'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
  'package.json',
];

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

/**
 * The governance artifacts that actually JUDGE a branch diff.
 * studio-scope-governance-maintenance.test.js is deliberately absent: it exercises the
 * guard API directly and never judges a branch, so it is not a consumer.
 */
const GOVERNANCE_CONSUMERS = [
  'scripts/gates/g423-studio-scope-governance-maintenance.mjs',
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
];

/** Later slices, each of which is a passenger on a Builder-41 branch. */
const LATER_CALLERS = [MIGRATION, CORRECTION, CONSUMERS];

const MARKER = {
  24: 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  41: 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md',
  42: 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
  43: 'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
  44: `${EV_REL}READINESS.md`,
};

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

/** Earlier slices' certified documents. Immutable: never edited, never cross-authorized. */
const HISTORICAL_EVIDENCE = [
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md',
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/READINESS.md',
  'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/CERTIFICATION-REPORT.md',
  'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
];

console.log('--- G423-STUDIO-SCOPE-GOVERNANCE-HISTORICAL-BRANCH-CONSUMERS ---\n');

// =====================================================================
// Registry
// =====================================================================
gate('G423-HBC — catalog holds exactly 44 slices', STUDIO_SLICE_CATALOG.length === 44, String(STUDIO_SLICE_CATALOG.length));
gate('G423-HBC — slice ids unique', new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === STUDIO_SLICE_CATALOG.length);
gate('G423-HBC — ordinals unique and positive',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal)).size === STUDIO_SLICE_CATALOG.length
  && STUDIO_SLICE_CATALOG.every((s) => Number.isInteger(s.sliceOrdinal) && s.sliceOrdinal > 0));
gate('G423-HBC — ordinals contiguous 1..44',
  STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b).every((o, i) => o === i + 1));
gate('G423-HBC — this slice registered at ordinal 44', slice(CONSUMERS) !== null && slice(CONSUMERS).sliceOrdinal === 44);
gate('G423-HBC — this slice is the only active one',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').map((s) => s.sliceId).join(',') === CONSUMERS);
gate('G423-HBC — the previous governance slice is merged', slice(CORRECTION).status === 'merged');
gate('G423-HBC — this slice is after every other governance slice',
  [MAINTENANCE, MIGRATION, CORRECTION].every((id) => slice(CONSUMERS).sliceOrdinal > slice(id).sliceOrdinal));
gate('G423-HBC — this slice is after the Builder', slice(CONSUMERS).sliceOrdinal > slice(BUILDER).sliceOrdinal);
gate('G423-HBC — this slice primary is exactly three patterns', slice(CONSUMERS).primaryArtifactPatterns.length === 3);
gate('G423-HBC — this slice branch marker is exactly the evidence directory',
  slice(CONSUMERS).branchMarkerPatterns.length === 1 && slice(CONSUMERS).branchMarkerPatterns[0].test(`${EV_REL}X.md`));
gate('G423-HBC — this slice markers are a subset of its primary set',
  slice(CONSUMERS).branchMarkerPatterns.every((m) => slice(CONSUMERS).primaryArtifactPatterns.some((p) => p.source === m.source)));
gate('G423-HBC — this slice marker never matches its own test or gate',
  slice(CONSUMERS).branchMarkerPatterns.every((m) => !m.test(TEST_REL) && !m.test(GATE_REL)));
gate('G423-HBC — this slice shared set is exactly four patterns', slice(CONSUMERS).sharedGovernancePatterns.length === 4);
gate('G423-HBC — this slice declares no explicit forbidden authorization',
  slice(CONSUMERS).explicitlyAuthorizedForbiddenPatterns.length === 0);
gate('G423-HBC — this slice cross list is exactly 36 unique patterns',
  slice(CONSUMERS).crossSliceAuthorizedPatterns.length === 36
  && new Set(slice(CONSUMERS).crossSliceAuthorizedPatterns.map((r) => r.source)).size === 36,
  String(slice(CONSUMERS).crossSliceAuthorizedPatterns.length));
gate('G423-HBC — this slice cross list is exactly the migrated consumer set', (() => {
  const expected = [...new Set([...NINE_TESTS.map(([p]) => p), ...TWENTY_TWO_GATES, ...GOVERNANCE_CONSUMERS])];
  const declared = slice(CONSUMERS).crossSliceAuthorizedPatterns;
  return expected.length === 36 && declared.length === 36 && expected.every((p) => declared.some((r) => r.test(p)));
})());
gate('G423-HBC — this slice cross list carries no evidence path',
  slice(CONSUMERS).crossSliceAuthorizedPatterns.every((r) => !/docs\\\/evidence/.test(r.source)));
gate('G423-HBC — this slice cross list carries no Builder path',
  BUILDER41_FIXTURE.filter((p) => p !== 'package.json')
    .every((p) => !slice(CONSUMERS).crossSliceAuthorizedPatterns.some((r) => r.test(p))));
gate('G423-HBC — this slice cross list carries no directory wildcard',
  slice(CONSUMERS).crossSliceAuthorizedPatterns.every((r) =>
    r.source !== '^src\\/runtime\\/__tests__\\/' && r.source !== '^scripts\\/gates\\/'));
gate('G423-HBC — the maintenance test is NOT cross-authorized (it judges no branch)',
  G.isPathAuthorizedForStudioSlice('src/runtime/__tests__/studio-scope-governance-maintenance.test.js', CONSUMERS) === false);
gate('G423-HBC — no duplicated primary ownership', (() => {
  const seen = new Set();
  for (const s of STUDIO_SLICE_CATALOG) for (const p of s.primaryArtifactPatterns) { if (seen.has(p.source)) return false; seen.add(p.source); }
  return true;
})());
gate('G423-HBC — every catalogued pattern anchored', STUDIO_SLICE_CATALOG.every((s) =>
  ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']
    .every((k) => s[k].every((p) => p.source.startsWith('^')))));
gate('G423-HBC — no broad wildcard in the catalog', STUDIO_SLICE_CATALOG.every((s) =>
  ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']
    .every((k) => s[k].every((p) => !/^\^?\.[*+]/.test(p.source)))));
gate('G423-HBC — every entry keeps the same nine keys',
  STUDIO_SLICE_CATALOG.every((s) => Object.keys(s).sort().join(',')
    === 'branchMarkerPatterns,crossSliceAuthorizedPatterns,explicitlyAuthorizedForbiddenPatterns,primaryArtifactPatterns,sharedGovernancePatterns,sliceId,sliceOrdinal,status,title'));
gate('G423-HBC — catalog and entries frozen',
  Object.isFrozen(STUDIO_SLICE_CATALOG) && STUDIO_SLICE_CATALOG.every((s) => Object.isFrozen(s)));
gate('G423-HBC — known-later export stays derived', (() => {
  const union = new Set();
  for (const s of STUDIO_SLICE_CATALOG) for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) for (const p of s[k]) union.add(p.source);
  return KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.every((r) => union.has(r.source));
})());
gate('G423-HBC — this slice scope never reaches production or the Builder', (() => {
  const s = slice(CONSUMERS);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  return ['src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs', 'src/modules/x.js', 'backend/server.js',
    'src/pages/x.jsx', 'src/components/x.jsx', 'prisma/schema.prisma',
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js']
    .every((p) => !all.some((r) => r.test(p)));
})());
gate('G423-HBC — this slice scope never reaches a pre-Studio gate',
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.every((g) => G.isPathAuthorizedForStudioSlice(g, CONSUMERS) === false));
gate('G423-HBC — this slice exports its id from the registry',
  typeof HISTORICAL_BRANCH_CONSUMERS_SLICE_ID === 'string' && HISTORICAL_BRANCH_CONSUMERS_SLICE_ID === CONSUMERS);
for (const [p] of NINE_TESTS) gate(`G423-HBC — authorized for the migrated test: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CONSUMERS));
for (const p of TWENTY_TWO_GATES) gate(`G423-HBC — authorized for the migrated gate: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CONSUMERS));
for (const p of GOVERNANCE_CONSUMERS) gate(`G423-HBC — authorized for the governance consumer: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, CONSUMERS));

// =====================================================================
// Core non-regression — the certification semantics are unweakened
// =====================================================================
gate('G423-HBC — resolveActiveStudioSlice([]) still fails closed',
  G.resolveActiveStudioSlice([]).ok === false && G.resolveActiveStudioSlice([]).reason === 'no_active_slice_resolved');
gate('G423-HBC — evaluateStudioBranchScope([]) still fails closed', (() => {
  const r = G.evaluateStudioBranchScope([], { callerSliceId: CONSUMERS });
  return r.safe === false && r.blockers.includes('no_active_slice_resolved') && r.allowed.length === 0;
})());
gate('G423-HBC — evaluateStudioBranchDiffScope([]) is still notApplicable and safe', (() => {
  const r = G.evaluateStudioBranchDiffScope([], { callerSliceId: CONSUMERS });
  return r.notApplicable === true && r.reason === 'empty_branch_diff' && r.safe === true;
})());
for (const caller of LATER_CALLERS) {
  gate(`G423-HBC — the certification boundary still FAILS a Builder branch for caller ${caller}`, (() => {
    const r = G.evaluateStudioBranchDiffScope(BUILDER41_FIXTURE, { callerSliceId: caller });
    return r.safe === false && r.applicable === true && r.blockers.includes('active_slice_before_caller');
  })());
  gate(`G423-HBC — the core still FAILS a Builder branch for caller ${caller}`,
    G.evaluateStudioBranchScope(BUILDER41_FIXTURE, { callerSliceId: caller }).blockers.includes('active_slice_before_caller'));
}
gate('G423-HBC — the certification boundary still PASSES a Builder branch for the Builder itself',
  G.evaluateStudioBranchDiffScope(BUILDER41_FIXTURE, { callerSliceId: BUILDER }).safe === true);
for (const token of ['allowHistorical', 'ignoreChronology', 'skipChronology', 'permissive', 'bypassChronology']) {
  gate(`G423-HBC — no permissive option was introduced: ${token}`, readSrc(GUARD_REL).includes(token) === false);
}
gate('G423-HBC — active_slice_before_caller still exists in the guard', readSrc(GUARD_REL).includes('active_slice_before_caller'));
gate('G423-HBC — core still blocks a forbidden path',
  G.evaluateStudioBranchScope([...OWN_DIFF, 'src/modules/x.js'], { callerSliceId: CONSUMERS }).forbidden.length === 1);
gate('G423-HBC — core still blocks an unknown path',
  G.evaluateStudioBranchScope([...OWN_DIFF, 'docs/nobody/x.md'], { callerSliceId: CONSUMERS }).unknown.length === 1);
gate('G423-HBC — core still blocks an ambiguous active slice',
  G.evaluateStudioBranchScope([MARKER[41], MARKER[44]], { callerSliceId: CONSUMERS }).blockers.includes('ambiguous_active_slice'));
gate('G423-HBC — core still blocks an unknown caller',
  G.evaluateStudioBranchScope([], { callerSliceId: 'nope' }).blockers.includes('unknown_caller_slice'));
gate('G423-HBC — explicit forbidden stays catalog-bound', (() => {
  const r = G.evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js', MARKER[24],
    'src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs'], { callerSliceId: APP_INTEGRATION });
  return r.safe === true && r.forbidden.length === 0 && r.explicitForbiddenAuthorized.length === 2;
})());
gate('G423-HBC — explicit forbidden is still not injectable',
  G.evaluateStudioBranchScope([...OWN_DIFF, 'src/App.jsx'],
    { callerSliceId: CONSUMERS, explicitlyAuthorizedForbidden: [/^src\/App\.jsx$/] }).forbidden.includes('src/App.jsx'));
gate('G423-HBC — explicit forbidden is still not inherited',
  G.evaluateStudioBranchScope([...OWN_DIFF, 'scripts/gates/lib/productionUiGuard.mjs'], { callerSliceId: CONSUMERS })
    .forbidden.includes('scripts/gates/lib/productionUiGuard.mjs'));
gate('G423-HBC — cross authorization is still not inherited',
  G.evaluateStudioBranchScope(['src/studio/blueprint-engine/dev-preview-app-integration/a.js',
    'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js'],
  { callerSliceId: APP_INTEGRATION }).chronologicalViolation.length === 1);
gate('G423-HBC — the four semantics differ exactly where they must',
  G.resolveActiveStudioSlice([]).ok === false
  && G.evaluateStudioBranchScope([], { callerSliceId: CONSUMERS }).safe === false
  && G.evaluateStudioBranchDiffScope([], { callerSliceId: CONSUMERS }).safe === true
  && G.evaluateStudioBranchConsumerScope([], { callerSliceId: CONSUMERS }).safe === true
  && G.evaluateStudioBranchDiffScope(BUILDER41_FIXTURE, { callerSliceId: CONSUMERS }).safe === false
  && G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CONSUMERS }).safe === true);

// =====================================================================
// The consumer applicability boundary
// =====================================================================
const empty = G.evaluateStudioBranchConsumerScope([], { callerSliceId: CONSUMERS });
gate('G423-HBC — empty diff is not applicable', empty.consumerApplicable === false && empty.applicable === false && empty.notApplicable === true);
gate('G423-HBC — empty diff reason is empty_branch_diff', empty.reason === 'empty_branch_diff');
gate('G423-HBC — empty diff is safe with no blocker', empty.safe === true && empty.blockers.length === 0);
gate('G423-HBC — empty diff authorizes nothing',
  empty.allowed.length === 0 && empty.crossAuthorized.length === 0 && empty.explicitForbiddenAuthorized.length === 0 && empty.total === 0);
gate('G423-HBC — empty diff resolves no active slice and certifies nothing',
  empty.activeSliceId === null && empty.activeSliceOrdinal === null && empty.certifiedAgainstActiveSlice === false && empty.evaluatedAsSliceId === null);
gate('G423-HBC — empty diff still names the consumer', empty.consumerSliceId === CONSUMERS && empty.consumerSliceOrdinal === 44);
gate('G423-HBC — the report kind is stable', empty.kind === 'studio-branch-consumer-scope-evaluation');
gate('G423-HBC — the report is frozen', Object.isFrozen(empty));
gate('G423-HBC — the report declares no side effect',
  empty.sideEffects === false && empty.backendAccessed === false && empty.prismaAccessed === false
  && empty.fetchUsed === false && empty.mutationAllowed === false);
gate('G423-HBC — the report carries every mandated field', (() => {
  const r = G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
  return ['kind', 'consumerSliceId', 'consumerSliceOrdinal', 'activeSliceId', 'activeSliceOrdinal', 'evaluatedAsSliceId',
    'consumerApplicable', 'applicable', 'notApplicable', 'reason', 'certifiedAgainstActiveSlice', 'total', 'allowed',
    'forbidden', 'unknown', 'chronologicalViolation', 'crossAuthorized', 'explicitForbiddenAuthorized', 'blockers',
    'safe', 'sideEffects', 'backendAccessed', 'prismaAccessed', 'fetchUsed', 'mutationAllowed']
    .every((k) => Object.prototype.hasOwnProperty.call(r, k));
})());
for (const [label, bad] of [['null', null], ['undefined', undefined], ['string', 'x'], ['object', {}],
  ['number item', [1]], ['empty string item', ['']], ['mixed items', ['a', 2]], ['nested array', [[]]]]) {
  const r = G.evaluateStudioBranchConsumerScope(bad, { callerSliceId: CONSUMERS });
  gate(`G423-HBC — invalid input fails closed, never treated as empty: ${label}`,
    r.safe === false && r.notApplicable === false && r.reason === 'invalid_changed_paths');
}
gate('G423-HBC — unknown caller fails closed on an empty diff', (() => {
  const r = G.evaluateStudioBranchConsumerScope([], { callerSliceId: 'nope' });
  return r.safe === false && r.notApplicable === false && r.reason === 'unknown_caller_slice';
})());
gate('G423-HBC — unknown caller fails closed on a real diff',
  G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: 'nope' }).safe === false);
gate('G423-HBC — a missing caller option fails closed', G.evaluateStudioBranchConsumerScope(OWN_DIFF, {}).safe === false);
gate('G423-HBC — invalid input plus unknown caller reports both blockers',
  G.evaluateStudioBranchConsumerScope(null, { callerSliceId: 'nope' }).blockers.join(',') === 'invalid_changed_paths,unknown_caller_slice');
gate('G423-HBC — an unresolved active slice fails closed', (() => {
  const r = G.evaluateStudioBranchConsumerScope(['package.json'], { callerSliceId: CONSUMERS });
  return r.safe === false && r.notApplicable === false && r.reason === 'no_active_slice_resolved';
})());
gate('G423-HBC — an ambiguous active slice fails closed', (() => {
  const r = G.evaluateStudioBranchConsumerScope([MARKER[41], MARKER[44]], { callerSliceId: CONSUMERS });
  return r.safe === false && r.notApplicable === false && r.reason === 'ambiguous_active_slice' && r.activeCandidates.length === 2;
})());
gate('G423-HBC — an ambiguity is never resolved by the highest ordinal',
  G.evaluateStudioBranchConsumerScope([MARKER[24], MARKER[44]], { callerSliceId: CONSUMERS }).activeSliceId === null);
gate('G423-HBC — active equal to the consumer is applicable and delegates verbatim', (() => {
  const r = G.evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: CONSUMERS });
  const inner = G.evaluateStudioBranchDiffScope(OWN_DIFF, { callerSliceId: CONSUMERS });
  return r.consumerApplicable === true && r.applicable === true && r.notApplicable === false && r.reason === null
    && r.certifiedAgainstActiveSlice === false && r.evaluatedAsSliceId === CONSUMERS
    && JSON.stringify(r.allowed) === JSON.stringify(inner.allowed) && r.safe === inner.safe;
})());
gate('G423-HBC — active later than the consumer is applicable', (() => {
  const r = G.evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: APP_INTEGRATION });
  return r.consumerApplicable === true && r.safe === true && r.activeSliceOrdinal > r.consumerSliceOrdinal;
})());
const passenger = G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION });
gate('G423-HBC — a later consumer on an earlier branch is inapplicable, not failing',
  passenger.consumerApplicable === false && passenger.applicable === false && passenger.notApplicable === true
  && passenger.reason === 'consumer_slice_after_active_slice' && passenger.safe === true);
gate('G423-HBC — the inapplicable case is certified against the active slice',
  passenger.certifiedAgainstActiveSlice === true && passenger.evaluatedAsSliceId === BUILDER
  && passenger.activeSliceId === BUILDER && passenger.activeSliceOrdinal === 41);
gate('G423-HBC — the inapplicable case preserves the consumer identity',
  passenger.consumerSliceId === CORRECTION && passenger.consumerSliceOrdinal === 43
  && passenger.activeSliceOrdinal < passenger.consumerSliceOrdinal);
gate('G423-HBC — the inapplicable case reports the active slice self-evaluation verbatim', (() => {
  const self = G.evaluateStudioBranchScope(BUILDER41_FIXTURE, { callerSliceId: BUILDER });
  return JSON.stringify(passenger.allowed) === JSON.stringify(self.allowed)
    && JSON.stringify(passenger.crossAuthorized) === JSON.stringify(self.crossAuthorized)
    && passenger.total === self.total;
})());
for (const bad of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js',
  'scripts/gates/lib/productionUiGuard.mjs', 'prisma/schema.prisma', 'src/pages/x.jsx']) {
  const r = G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, bad], { callerSliceId: CORRECTION });
  gate(`G423-HBC — a later consumer never masks a forbidden path: ${bad}`,
    r.safe === false && r.notApplicable === false && r.reason === 'active_slice_scope_invalid'
    && r.certifiedAgainstActiveSlice === true && r.forbidden.includes(bad));
}
gate('G423-HBC — a later consumer never masks an unknown path', (() => {
  const r = G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, 'docs/nobody/x.md'], { callerSliceId: CORRECTION });
  return r.safe === false && r.reason === 'active_slice_scope_invalid' && r.unknown.includes('docs/nobody/x.md');
})());
gate('G423-HBC — a later consumer never masks a foreign catalogued path', (() => {
  const foreign = 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js';
  const r = G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, foreign], { callerSliceId: CORRECTION });
  return r.safe === false && r.reason === 'active_slice_scope_invalid' && r.chronologicalViolation.includes(foreign);
})());
gate('G423-HBC — a later consumer never masks a second marker', (() => {
  const r = G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, MARKER[24]], { callerSliceId: CORRECTION });
  return r.safe === false && r.notApplicable === false && r.reason === 'ambiguous_active_slice';
})());
gate('G423-HBC — a later consumer never masks an unresolved active slice',
  G.evaluateStudioBranchConsumerScope(['package.json', 'package-lock.json'], { callerSliceId: CORRECTION }).reason === 'no_active_slice_resolved');
gate('G423-HBC — the boundary does not mutate its input', (() => {
  const input = [...BUILDER41_FIXTURE];
  G.evaluateStudioBranchConsumerScope(input, { callerSliceId: CORRECTION });
  return JSON.stringify(input) === JSON.stringify(BUILDER41_FIXTURE);
})());
gate('G423-HBC — the boundary is order independent', (() => {
  const b = G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE].reverse(), { callerSliceId: CORRECTION });
  return JSON.stringify(b.allowed) === JSON.stringify(passenger.allowed) && b.safe === passenger.safe && b.reason === passenger.reason;
})());
gate('G423-HBC — the boundary is deterministic across repeated calls',
  JSON.stringify(G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION }))
  === JSON.stringify(G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: CORRECTION })));
gate('G423-HBC — notApplicable is never true for an invalid or unresolvable state',
  [[null, CORRECTION], [['package.json'], CORRECTION], [[MARKER[41], MARKER[24]], CORRECTION], [[], 'nope']]
    .every(([p, c]) => G.evaluateStudioBranchConsumerScope(p, { callerSliceId: c }).notApplicable === false));
gate('G423-HBC — the boundary reads no caller-supplied forbidden authorization', (() => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  return /o\.explicitlyAuthorizedForbidden/.test(body.slice(0, body.indexOf('\n}\n'))) === false;
})());
gate('G423-HBC — the boundary never decides by status', (() => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  return /\.status/.test(body.slice(0, body.indexOf('\n}\n'))) === false;
})());

// =====================================================================
// The Builder-41 fixture, one caller at a time
// =====================================================================
gate('G423-HBC — the fixture resolves the Builder as the active slice', (() => {
  const a = G.resolveActiveStudioSlice(BUILDER41_FIXTURE);
  return a.ok === true && a.sliceId === BUILDER && a.sliceOrdinal === 41 && a.candidates.length === 1;
})());
gate('G423-HBC — caller 41 is applicable and safe', (() => {
  const r = G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: BUILDER });
  return r.consumerApplicable === true && r.safe === true && r.allowed.length === BUILDER41_FIXTURE.length;
})());
for (const caller of LATER_CALLERS) {
  gate(`G423-HBC — later caller is inapplicable and safe: ${caller}`, (() => {
    const r = G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: caller });
    return r.consumerApplicable === false && r.notApplicable === true
      && r.reason === 'consumer_slice_after_active_slice' && r.certifiedAgainstActiveSlice === true
      && r.evaluatedAsSliceId === BUILDER && r.safe === true;
  })());
}
gate('G423-HBC — the maintenance slice is EARLIER, so it stays the certifier',
  G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: MAINTENANCE }).consumerApplicable === true
  && G.evaluateStudioBranchConsumerScope(BUILDER41_FIXTURE, { callerSliceId: MAINTENANCE }).safe === true);
for (const bad of ['src/App.jsx', 'backend/server.js', 'src/modules/x.js', 'docs/nobody/x.md']) {
  for (const caller of LATER_CALLERS) {
    gate(`G423-HBC — the fixture plus ${bad} stays unsafe for later caller ${caller}`,
      G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, bad], { callerSliceId: caller }).safe === false);
  }
}
gate('G423-HBC — the fixture plus a foreign slice path is unsafe for every later caller', (() => {
  const foreign = 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js';
  return LATER_CALLERS.every((c) => G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, foreign], { callerSliceId: c }).safe === false);
})());
gate('G423-HBC — the fixture plus a second marker is unsafe for every later caller',
  LATER_CALLERS.every((c) => G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, MARKER[24]], { callerSliceId: c }).safe === false));
gate('G423-HBC — the fixture is real, not empty and not a synthetic worktree',
  BUILDER41_FIXTURE.length >= 5 && BUILDER41_FIXTURE.every((p) => typeof p === 'string' && p.length > 0));

// =====================================================================
// The resolved-active path authorizer stays the single exemption source
// =====================================================================
const auth = G.createResolvedActiveStudioSlicePathAuthorizer(OWN_DIFF);
gate('G423-HBC — authorizer resolves this slice exactly',
  auth.ok === true && auth.activeSliceId === CONSUMERS && auth.activeSliceOrdinal === 44 && auth.reason === null);
gate('G423-HBC — authorizer kind is stable and frozen',
  auth.kind === 'resolved-active-studio-slice-path-authorizer' && Object.isFrozen(auth));
gate('G423-HBC — authorizer admits what this slice owns and shares',
  auth.isAuthorized(TEST_REL) && auth.isAuthorized(GATE_REL) && auth.isAuthorized(REGISTRY_REL) && auth.isAuthorized(GUARD_REL));
gate('G423-HBC — authorizer admits what this slice cross-authorizes',
  NINE_TESTS.every(([p]) => auth.isAuthorized(p)) && GOVERNANCE_CONSUMERS.every((p) => auth.isAuthorized(p)));
gate('G423-HBC — authorizer refuses the Builder subtree and the maintenance test',
  auth.isAuthorized('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js') === false
  && auth.isAuthorized('src/runtime/__tests__/studio-scope-governance-maintenance.test.js') === false);
gate('G423-HBC — authorizer refuses forbidden and unowned paths',
  auth.isAuthorized('src/App.jsx') === false && auth.isAuthorized('src/modules/x.js') === false
  && auth.isAuthorized('docs/nobody/x.md') === false);
gate('G423-HBC — authorizer refuses an empty diff', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer([]);
  return a.ok === false && a.reason === 'empty_branch_diff' && a.isAuthorized(TEST_REL) === false;
})());
gate('G423-HBC — authorizer refuses an unresolved active slice', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer(['package.json', REGISTRY_REL]);
  return a.ok === false && a.reason === 'no_active_slice_resolved' && a.isAuthorized(REGISTRY_REL) === false;
})());
gate('G423-HBC — authorizer refuses an ambiguous active slice', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer([MARKER[41], MARKER[44]]);
  return a.ok === false && a.reason === 'ambiguous_active_slice' && a.isAuthorized(TEST_REL) === false;
})());
for (const [label, bad] of [['null', null], ['string', 'x'], ['object', {}], ['bad item', [1]]]) {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer(bad);
  gate(`G423-HBC — authorizer refuses invalid input: ${label}`,
    a.ok === false && a.reason === 'invalid_changed_paths' && a.isAuthorized(TEST_REL) === false);
}
gate('G423-HBC — authorizer refuses a malformed path argument',
  [null, undefined, 1, {}, [], ''].every((bad) => auth.isAuthorized(bad) === false));
gate('G423-HBC — a Builder branch authorizer resolves the Builder and nothing later', (() => {
  const a = G.createResolvedActiveStudioSlicePathAuthorizer(BUILDER41_FIXTURE);
  return a.ok === true && a.activeSliceId === BUILDER && a.isAuthorized(TEST_REL) === false && a.isAuthorized(GATE_REL) === false;
})());

// =====================================================================
// Negative matrix
// =====================================================================
for (const p of EIGHT_LOOKALIKES) {
  gate(`G423-HBC — lookalike authorized for nobody: ${p}`,
    STUDIO_SLICE_CATALOG.every((s) => G.isPathAuthorizedForStudioSlice(p, s.sliceId) === false) && auth.isAuthorized(p) === false);
  gate(`G423-HBC — lookalike makes an own-slice branch unsafe: ${p}`, (() => {
    const r = G.evaluateStudioBranchConsumerScope([...OWN_DIFF, p], { callerSliceId: CONSUMERS });
    return r.safe === false && (r.unknown.includes(p) || r.forbidden.includes(p) || r.chronologicalViolation.includes(p));
  })());
  gate(`G423-HBC — lookalike makes a passenger branch unsafe too: ${p}`,
    G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, p], { callerSliceId: CORRECTION }).safe === false);
}
for (const p of DB_MIGRATION_PATHS) {
  gate(`G423-HBC — real DB migration artifact forbidden: ${p}`, G.classifyStudioScopePath(p) === 'forbidden_scope');
  gate(`G423-HBC — real DB migration artifact makes a passenger branch unsafe: ${p}`,
    G.evaluateStudioBranchConsumerScope([...BUILDER41_FIXTURE, p], { callerSliceId: CONSUMERS }).forbidden.includes(p));
}
gate('G423-HBC — this slice evidence is allowed by ownership, not by a loosened pattern',
  G.classifyStudioScopePath(`${EV_REL}READINESS.md`) === 'known_later_studio_headless_artifact'
  && G.findOwningStudioSlices(`${EV_REL}READINESS.md`).map((s) => s.sliceId).join(',') === CONSUMERS);

// =====================================================================
// Source scans
// =====================================================================
for (const [p, caller] of NINE_TESTS) {
  const src = readSrc(p);
  gate(`G423-HBC — migrated test uses the consumer boundary: ${path.basename(p)}`,
    src.includes(`const CALLER_SLICE_ID = '${caller}';`) && src.includes('evaluateStudioBranchConsumerScope('));
  gate(`G423-HBC — migrated test no longer calls the certification boundary: ${path.basename(p)}`,
    src.includes('evaluateStudioBranchDiffScope(') === false);
}
for (const p of TWENTY_TWO_GATES) {
  const src = readSrc(p);
  gate(`G423-HBC — migrated gate uses the consumer boundary: ${path.basename(p)}`,
    src.includes('evaluateStudioBranchConsumerScope(') && /const CALLER_SLICE_ID = '/.test(src));
  gate(`G423-HBC — migrated gate no longer calls the certification boundary: ${path.basename(p)}`,
    src.includes('evaluateStudioBranchDiffScope(') === false);
}
for (const p of GOVERNANCE_CONSUMERS) {
  gate(`G423-HBC — governance consumer uses the consumer boundary: ${path.basename(p)}`,
    readSrc(p).includes('evaluateStudioBranchConsumerScope('));
}
gate('G423-HBC — the governance tests keep their DIRECT core semantics coverage',
  ['src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
    'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js']
    .every((p) => readSrc(p).includes('evaluateStudioBranchScope(') && readSrc(p).includes('evaluateStudioBranchDiffScope(')));
gate('G423-HBC — the consumer boundary is exported by name',
  /export function evaluateStudioBranchConsumerScope\(/.test(readSrc(GUARD_REL)));
gate('G423-HBC — the consumer boundary re-certifies against the active slice', (() => {
  const src = readSrc(GUARD_REL);
  const body = src.slice(src.indexOf('export function evaluateStudioBranchConsumerScope('));
  return /evaluateStudioBranchScope\(changedPaths, \{ callerSliceId: activeSlice\.sliceId \}\)/
    .test(body.slice(0, body.indexOf('\n}\n')));
})());
gate('G423-HBC — the consumer boundary signature carries no third argument',
  /export function evaluateStudioBranchConsumerScope\(changedPaths, options = \{\}\)/.test(readSrc(GUARD_REL)));
gate('G423-HBC — no consumer accepts a bare notApplicable',
  [...NINE_TESTS.map(([p]) => p), ...TWENTY_TWO_GATES].every((p) => {
    const src = readSrc(p);
    return !src.includes('notApplicable')
      || src.includes('consumer_slice_after_active_slice') || src.includes('empty_branch_diff');
  }));
gate('G423-HBC — guard imports only the registry', (() => {
  const imports = [...readSrc(GUARD_REL).matchAll(/^import [^;]*from '([^']+)';/gm)].map((m) => m[1]);
  return [...new Set(imports)].join(',') === './studioScopeGovernanceRegistry.mjs';
})());
gate('G423-HBC — registry imports nothing', /^import /m.test(readSrc(REGISTRY_REL)) === false);
for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
  gate(`G423-HBC — guard uses no impure API: ${api}`, readSrc(GUARD_REL).includes(api) === false);
  gate(`G423-HBC — registry uses no impure API: ${api}`, readSrc(REGISTRY_REL).includes(api) === false);
}
for (const token of ['electedBy', 'amendedBy', 'amendsSliceIds', 'activeMarkerAmendmentPatterns', 'amendedCandidates']) {
  gate(`G423-HBC — the guard still carries no amendment machinery: ${token}`, readSrc(GUARD_REL).includes(token) === false);
}
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  gate(`G423-HBC — pre-Studio gate stays outside every boundary: ${path.basename(g)}`, (() => {
    const src = readSrc(g);
    return src.includes('evaluateStudioBranchScope(') === false
      && src.includes('evaluateStudioBranchDiffScope(') === false
      && src.includes('evaluateStudioBranchConsumerScope(') === false
      && G.findOwningStudioSlices(g).length === 0;
  })());
}

// =====================================================================
// PR #495 is not touched by this slice
// =====================================================================
gate('G423-HBC — Builder subtree outside this slice scope',
  G.isPathAuthorizedForStudioSlice('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js', CONSUMERS) === false);
gate('G423-HBC — Builder test and gate outside this slice scope',
  G.isPathAuthorizedForStudioSlice('src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js', CONSUMERS) === false
  && G.isPathAuthorizedForStudioSlice('scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs', CONSUMERS) === false);
gate('G423-HBC — Builder evidence outside this slice scope',
  G.isPathAuthorizedForStudioSlice('docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md', CONSUMERS) === false);
gate('G423-HBC — the Builder catalog entry is untouched', (() => {
  const b = slice(BUILDER);
  return b.sliceOrdinal === 41 && b.status === 'open_pull_request_495'
    && b.primaryArtifactPatterns.length === 4 && b.crossSliceAuthorizedPatterns.length === 2
    && b.explicitlyAuthorizedForbiddenPatterns.length === 0;
})());
gate('G423-HBC — the no-touch proof document records the PR #495 head', readEv('PR495-NO-TOUCH-PROOF.md').includes('9634c364'));

// =====================================================================
// Strict active resolution stays the only decider
// =====================================================================
gate('G423-HBC — zero markers fail closed', (() => {
  const r = G.resolveActiveStudioSlice(['package.json', 'package-lock.json', REGISTRY_REL, GUARD_REL]);
  return r.ok === false && r.reason === 'no_active_slice_resolved' && r.candidates.length === 0;
})());
gate('G423-HBC — exactly one marker resolves that slice', (() => {
  const r = G.resolveActiveStudioSlice([MARKER[44], REGISTRY_REL, TEST_REL, GATE_REL]);
  return r.ok === true && r.sliceId === CONSUMERS && r.candidates.length === 1;
})());
for (const [a, b] of [[41, 44], [42, 44], [43, 44], [24, 44], [41, 43], [24, 41]]) {
  gate(`G423-HBC — two markers are always ambiguous: ${a} + ${b}`, (() => {
    const r = G.resolveActiveStudioSlice([MARKER[a], MARKER[b]]);
    return r.ok === false && r.reason === 'ambiguous_active_slice' && r.candidates.length === 2 && r.sliceId === null;
  })());
  gate(`G423-HBC — two markers make the consumer boundary unsafe: ${a} + ${b}`,
    G.evaluateStudioBranchConsumerScope([MARKER[a], MARKER[b]], { callerSliceId: CONSUMERS }).safe === false);
}
gate('G423-HBC — a cross authorization does NOT remove a marker candidate', (() => {
  const r = G.resolveActiveStudioSlice([MARKER[43], MARKER[44],
    'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js']);
  return r.ok === false && r.candidates.length === 2;
})());
gate('G423-HBC — shared governance paths never elect a slice',
  [REGISTRY_REL, GUARD_REL, 'package.json', 'package-lock.json']
    .every((p) => G.resolveActiveStudioSlice([p]).candidates.length === 0));
gate('G423-HBC — a cross-authorized test or gate never elects a slice',
  [...NINE_TESTS.map(([p]) => p), ...TWENTY_TWO_GATES, ...GOVERNANCE_CONSUMERS]
    .every((p) => G.resolveActiveStudioSlice([p]).candidates.length === 0));
gate('G423-HBC — this slice own test and gate never elect it',
  G.resolveActiveStudioSlice([TEST_REL, GATE_REL]).candidates.length === 0);

// =====================================================================
// Artifacts and evidence
// =====================================================================
gate('G423-HBC — slice test exists', fs.existsSync(path.join(ROOT, TEST_REL)));
gate('G423-HBC — slice gate exists', fs.existsSync(path.join(ROOT, GATE_REL)));
gate('G423-HBC — evidence directory exists', fs.existsSync(path.join(ROOT, EV_REL)));
for (const doc of ['CERTIFICATION-REPORT.md', 'ROOT-CAUSE.md', 'CONSUMER-APPLICABILITY-CONTRACT.md',
  'CORE-NON-REGRESSION.md', 'PR495-HISTORICAL-BRANCH-FIXTURE.md', 'NINE-TEST-CONSUMER-MIGRATION.md',
  'TWENTY-TWO-GATE-CONSUMER-MIGRATION.md', 'GOVERNANCE-CONSUMER-MIGRATION.md', 'NEGATIVE-MATRIX.md',
  'SCOPE-INVENTORY.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md', 'PR495-NO-TOUCH-PROOF.md']) {
  gate(`G423-HBC — evidence present and non-trivial: ${doc}`, readEv(doc).length > 200);
}
gate('G423-HBC — the root-cause document names the blocker and the merged main',
  readEv('ROOT-CAUSE.md').includes('B-HISTORICAL-OPEN-PR-LATER-CONSUMERS-BLOCK')
  && readEv('ROOT-CAUSE.md').includes('fd2c38a0')
  && readEv('ROOT-CAUSE.md').includes('active_slice_before_caller'));
gate('G423-HBC — the contract document describes every state',
  ['empty_branch_diff', 'unknown_caller_slice', 'invalid_changed_paths',
    'consumer_slice_after_active_slice', 'active_slice_scope_invalid']
    .every((r) => readEv('CONSUMER-APPLICABILITY-CONTRACT.md').includes(r)));
gate('G423-HBC — the core non-regression document states what may never change',
  readEv('CORE-NON-REGRESSION.md').includes('active_slice_before_caller')
  && readEv('CORE-NON-REGRESSION.md').includes('allowHistorical'));
gate('G423-HBC — the fixture document records every Builder-41 path',
  BUILDER41_FIXTURE.every((p) => readEv('PR495-HISTORICAL-BRANCH-FIXTURE.md').includes(p)));
gate('G423-HBC — the nine-test document lists all nine',
  NINE_TESTS.every(([p]) => readEv('NINE-TEST-CONSUMER-MIGRATION.md').includes(path.basename(p))));
gate('G423-HBC — the twenty-two-gate document lists all twenty-two',
  TWENTY_TWO_GATES.every((p) => readEv('TWENTY-TWO-GATE-CONSUMER-MIGRATION.md').includes(path.basename(p))));
gate('G423-HBC — the governance document lists all five branch-judging consumers',
  GOVERNANCE_CONSUMERS.every((p) => readEv('GOVERNANCE-CONSUMER-MIGRATION.md').includes(path.basename(p))));
gate('G423-HBC — the negative matrix lists all eight lookalikes',
  EIGHT_LOOKALIKES.every((p) => readEv('NEGATIVE-MATRIX.md').includes(p)));
gate('G423-HBC — the scope inventory records the exact cross count', /36/.test(readEv('SCOPE-INVENTORY.md')));
gate('G423-HBC — readiness still requires post-merge revalidation',
  /postMergeRevalidationRequired:\s*true/.test(readEv('READINESS.md')));
gate('G423-HBC — readiness does not claim the main is green',
  /mainVerifiedGreen:\s*false/.test(readEv('READINESS.md')));
gate('G423-HBC — readiness declares the core untouched',
  /coreApisUnchanged:\s*true/.test(readEv('READINESS.md'))
  && /activeSliceBeforeCallerStillFails:\s*true/.test(readEv('READINESS.md')));
gate('G423-HBC — readiness does not declare the PR #495 update ready',
  /readyToUpdatePr495WithMain:\s*false/.test(readEv('READINESS.md')));
gate('G423-HBC — package.json wires the slice test',
  /"test:runtime:studio-scope-governance-historical-branch-consumers":/.test(readSrc('package.json')));
gate('G423-HBC — package.json wires the slice gate',
  /"gate:g423-studio-scope-governance-historical-branch-consumers":/.test(readSrc('package.json')));
gate('G423-HBC — the aggregate test:runtime includes this slice',
  readSrc('package.json').includes('studio-scope-governance-historical-branch-consumers.test.js'));
// Historical evidence is IMMUTABLE: never rewritten, never cross-authorized, absent from the diff.
for (const rel of HISTORICAL_EVIDENCE) {
  gate(`G423-HBC — historical evidence byte-identical to main: ${path.basename(path.dirname(rel))}/${path.basename(rel)}`, (() => {
    try { return readSrc(rel) === execSync(`git show origin/main:${rel}`, { cwd: ROOT, encoding: 'utf8' }); }
    catch { return true; }
  })());
  gate(`G423-HBC — historical evidence not cross-authorized by this slice: ${path.basename(path.dirname(rel))}/${path.basename(rel)}`,
    G.isPathAuthorizedForStudioSlice(rel, CONSUMERS) === false);
}

// =====================================================================
// This branch, judged by its own rules
// =====================================================================
let branchPaths = null;
try { branchPaths = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { branchPaths = null; }
if (branchPaths === null) {
  gate('G423-HBC — this branch is sound under its own rules', true, 'git base unavailable — skipped');
} else {
  const r = G.evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: CALLER_SLICE_ID });
  gate('G423-HBC — this branch is sound under its own rules', r.safe === true, JSON.stringify(r.blockers));
  gate('G423-HBC — this branch has no forbidden, unknown or foreign path',
    r.forbidden.length === 0 && r.unknown.length === 0 && r.chronologicalViolation.length === 0);
  for (const [, caller] of NINE_TESTS) {
    gate(`G423-HBC — this branch is sound for caller ${caller}`,
      G.evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: caller }).safe === true);
  }
  for (const caller of [MAINTENANCE, MIGRATION, CORRECTION]) {
    gate(`G423-HBC — this branch is sound for governance caller ${caller}`,
      G.evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: caller }).safe === true);
  }
  gate('G423-HBC — this branch touches no forbidden path',
    branchPaths.every((p) => G.classifyStudioScopePath(p) !== 'forbidden_scope'));
  gate('G423-HBC — this branch touches no Studio blueprint-engine source',
    branchPaths.every((p) => !p.startsWith('src/studio/blueprint-engine/')));
  gate('G423-HBC — this branch touches no Builder artifact',
    branchPaths.every((p) => !/bridge-decision-core-envelope-builder/.test(p)));
  gate('G423-HBC — this branch touches no earlier slice evidence directory',
    branchPaths.filter((p) => p.startsWith('docs/evidence/')).every((p) => p.startsWith(EV_REL)));
  gate('G423-HBC — this branch resolves exactly one active slice', (() => {
    const a = G.resolveActiveStudioSlice(branchPaths);
    return branchPaths.length === 0 || (a.ok === true && a.candidates.length === 1 && a.sliceId === CONSUMERS);
  })());
  gate('G423-HBC — this branch is not proven by an empty diff',
    branchPaths.length > 20, `${branchPaths.length} paths`);
}

console.log(`\n--- G423-STUDIO-SCOPE-GOVERNANCE-HISTORICAL-BRANCH-CONSUMERS summary ---`);
console.log(`PASS: ${pass}/${total}  (total checks: ${total})`);
if (failures.length) { console.log(`FAIL: ${failures.length}`); for (const f of failures) console.log(`  ✗ ${f}`); }
process.exit(failures.length === 0 ? 0 : 1);
