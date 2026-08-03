/**
 * G423 — Studio Builder Lifecycle Normalization.
 *
 * Slice 45. Verifies, with LIVE checks (never a grep-only proof), that the catalog reached its
 * correct FINAL state after PR #495 was merged:
 *  - the Builder at ordinal 41 is `merged` and no longer authorized to carry historical
 *    branch consumers, while keeping the exact scope of the merged PR (4 primary, 8 cross);
 *  - slice 44 is `merged` and this slice is the only active one;
 *  - ZERO slices carry `historicalBranchConsumerCompatibility`, so every earlier active slice
 *    is fail-closed for a later consumer — the Builder included, with no special case left;
 *  - the guard, the wrapper and the chronological core are untouched, and the Builder's
 *    functional subtree is not in this slice's scope at all.
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
  HISTORICAL_BRANCH_CONSUMERS_SLICE_ID, BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID,
} from './lib/studioScopeGovernanceRegistry.mjs';

const ROOT = process.cwd();
const NORMALIZATION = BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID;
const CONSUMERS = HISTORICAL_BRANCH_CONSUMERS_SLICE_ID;
const CORRECTION = MAIN_DIFF_CORRECTION_SLICE_ID;
const MIGRATION = CHRONOLOGICAL_MIGRATION_SLICE_ID;
const MAINTENANCE = 'studio-scope-governance-maintenance';
const BUILDER = 'bridge-decision-core-envelope-builder';
const APP_INTEGRATION = 'dev-preview-app-integration';
const CALLER_SLICE_ID = NORMALIZATION;

const TEST_REL = 'src/runtime/__tests__/studio-builder-lifecycle-normalization.test.js';
const GATE_REL = 'scripts/gates/g423-studio-builder-lifecycle-normalization.mjs';
const EV_REL = 'docs/evidence/post-foundation-c-studio-builder-lifecycle-normalization/';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

const OWN_DIFF = [REGISTRY_REL, TEST_REL, GATE_REL, `${EV_REL}READINESS.md`, 'package.json'];

/** The six governance consumers whose lifecycle expectations this slice updates. */
const SIX_CONSUMERS = [
  'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js',
  'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs',
  'src/runtime/__tests__/studio-scope-governance-main-diff-correction.test.js',
  'scripts/gates/g423-studio-scope-governance-main-diff-correction.mjs',
  'src/runtime/__tests__/studio-scope-governance-historical-branch-consumers.test.js',
  'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.mjs',
];

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

const MARKER = {
  24: 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/X.md',
  41: 'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/X.md',
  44: 'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
  45: `${EV_REL}READINESS.md`,
};

const LOOKALIKES = [
  'docs/random-migration-plan.md', 'tools/custom-migration-helper.js', 'config/menu.json',
  'tools/navigation-generator.js', 'scripts/gates/g423-unregistered-route-menu.mjs',
  'src/runtime/__tests__/unlisted-empresas-change.test.js', 'scripts/gates/g423-unlisted-empresas-change.mjs',
  'docs/evidence/unregistered-empresas-change/file.md',
];

const FORBIDDEN = ['src/App.jsx', 'backend/server.js', 'src/modules/x.js', 'src/pages/x.jsx',
  'src/components/x.jsx', 'prisma/schema.prisma', 'scripts/gates/lib/productionUiGuard.mjs',
  'migrations/001.sql', 'backend/prisma/migrations/x/migration.sql', 'anything.sql',
  'prisma/migrations/20240101_init/migration.sql', 'scripts/migrateUsers.js'];

const readSrc = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; } };
const readEv = (n) => readSrc(`${EV_REL}${n}`);

let pass = 0; let total = 0; const failures = [];
const gate = (name, ok, detail = '') => {
  total += 1;
  if (ok) { pass += 1; console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`); }
  else { failures.push(name); console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`); }
};
const slice = (id) => G.getStudioSliceById(id);

console.log('--- G423-STUDIO-BUILDER-LIFECYCLE-NORMALIZATION ---\n');

// =====================================================================
// Catalog after normalization
// =====================================================================
gate('G423-BLN — catalog holds exactly 45 slices', STUDIO_SLICE_CATALOG.length === 45, String(STUDIO_SLICE_CATALOG.length));
gate('G423-BLN — slice ids unique', new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceId)).size === STUDIO_SLICE_CATALOG.length);
gate('G423-BLN — ordinals unique and positive',
  new Set(STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal)).size === STUDIO_SLICE_CATALOG.length
  && STUDIO_SLICE_CATALOG.every((s) => Number.isInteger(s.sliceOrdinal) && s.sliceOrdinal > 0));
gate('G423-BLN — ordinals contiguous 1..45',
  STUDIO_SLICE_CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b).every((o, i) => o === i + 1));
gate('G423-BLN — every entry keeps the same ten keys',
  STUDIO_SLICE_CATALOG.every((s) => Object.keys(s).sort().join(',')
    === 'branchMarkerPatterns,crossSliceAuthorizedPatterns,explicitlyAuthorizedForbiddenPatterns,historicalBranchConsumerCompatibility,primaryArtifactPatterns,sharedGovernancePatterns,sliceId,sliceOrdinal,status,title'));
gate('G423-BLN — this slice is the only active one',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'active_slice').map((s) => s.sliceId).join(',') === NORMALIZATION);
gate('G423-BLN — this slice is registered at ordinal 45', slice(NORMALIZATION) !== null && slice(NORMALIZATION).sliceOrdinal === 45);
gate('G423-BLN — slice 44 is merged', slice(CONSUMERS).sliceOrdinal === 44 && slice(CONSUMERS).status === 'merged');
gate('G423-BLN — the Builder is merged', slice(BUILDER).sliceOrdinal === 41 && slice(BUILDER).status === 'merged');
gate('G423-BLN — the Builder carries no historical branch consumer authorization',
  slice(BUILDER).historicalBranchConsumerCompatibility === false);
gate('G423-BLN — ZERO slices carry the authorization',
  STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility).length === 0,
  `${STUDIO_SLICE_CATALOG.filter((s) => s.historicalBranchConsumerCompatibility).length} authorized`);
gate('G423-BLN — the authorization is a boolean on every entry',
  STUDIO_SLICE_CATALOG.every((s) => typeof s.historicalBranchConsumerCompatibility === 'boolean'));
gate('G423-BLN — no merged slice is authorized',
  STUDIO_SLICE_CATALOG.filter((s) => s.status === 'merged').every((s) => s.historicalBranchConsumerCompatibility === false));
gate('G423-BLN — no slice is left in a pull-request status',
  STUDIO_SLICE_CATALOG.every((s) => !/open_pull_request/.test(s.status)));
gate('G423-BLN — the Builder keeps 4 primary, 8 cross, 0 explicit forbidden', (() => {
  const b = slice(BUILDER);
  return b.primaryArtifactPatterns.length === 4 && b.crossSliceAuthorizedPatterns.length === 8
    && new Set(b.crossSliceAuthorizedPatterns.map((r) => r.source)).size === 8
    && b.explicitlyAuthorizedForbiddenPatterns.length === 0;
})());
gate('G423-BLN — the Builder cross list is still the exact eight paths',
  ['src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
    'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
    ...SIX_CONSUMERS].every((p) => G.isPathAuthorizedForStudioSlice(p, BUILDER) === true));
gate('G423-BLN — this slice primary is exactly three patterns', slice(NORMALIZATION).primaryArtifactPatterns.length === 3);
gate('G423-BLN — this slice marker is exactly the evidence directory', (() => {
  const m = slice(NORMALIZATION).branchMarkerPatterns;
  return m.length === 1 && m[0].test(`${EV_REL}X.md`) && !m[0].test(TEST_REL) && !m[0].test(GATE_REL);
})());
gate('G423-BLN — this slice marker is a subset of its primary set',
  slice(NORMALIZATION).branchMarkerPatterns.every((m) => slice(NORMALIZATION).primaryArtifactPatterns.some((p) => p.source === m.source)));
gate('G423-BLN — this slice cross list is exactly the six governance consumers', (() => {
  const c = slice(NORMALIZATION).crossSliceAuthorizedPatterns;
  return c.length === 6 && new Set(c.map((r) => r.source)).size === 6
    && SIX_CONSUMERS.every((p) => c.some((r) => r.test(p)));
})());
gate('G423-BLN — this slice cross list is anchored to single files, no wildcard, no evidence, no guard',
  slice(NORMALIZATION).crossSliceAuthorizedPatterns.every((r) => r.source.startsWith('^') && r.source.endsWith('$')
    && !/^\^?\.[*+]/.test(r.source) && !/docs\\\/evidence/.test(r.source)
    && !/studioScopeGovernanceGuard/.test(r.source)));
gate('G423-BLN — this slice shared set is registry plus the two manifests',
  slice(NORMALIZATION).sharedGovernancePatterns.length === 3
  && ['package.json', 'package-lock.json', REGISTRY_REL].every((p) =>
    slice(NORMALIZATION).sharedGovernancePatterns.some((r) => r.test(p))));
gate('G423-BLN — this slice declares no explicit forbidden authorization',
  slice(NORMALIZATION).explicitlyAuthorizedForbiddenPatterns.length === 0);
gate('G423-BLN — this slice is not authorized for historical branch consumers',
  slice(NORMALIZATION).historicalBranchConsumerCompatibility === false);
gate('G423-BLN — no duplicated primary ownership', (() => {
  const seen = new Set();
  for (const s of STUDIO_SLICE_CATALOG) for (const p of s.primaryArtifactPatterns) { if (seen.has(p.source)) return false; seen.add(p.source); }
  return true;
})());
gate('G423-BLN — every catalogued pattern anchored', STUDIO_SLICE_CATALOG.every((s) =>
  ['primaryArtifactPatterns', 'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns', 'explicitlyAuthorizedForbiddenPatterns']
    .every((k) => s[k].every((p) => p.source.startsWith('^')))));
gate('G423-BLN — no broad wildcard in the catalog', STUDIO_SLICE_CATALOG.every((s) =>
  ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']
    .every((k) => s[k].every((p) => !/^\^?\.[*+]/.test(p.source)))));
gate('G423-BLN — catalog and entries frozen',
  Object.isFrozen(STUDIO_SLICE_CATALOG) && STUDIO_SLICE_CATALOG.every((s) => Object.isFrozen(s)));
gate('G423-BLN — known-later export stays derived', (() => {
  const union = new Set();
  for (const s of STUDIO_SLICE_CATALOG) for (const k of ['primaryArtifactPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns']) for (const p of s[k]) union.add(p.source);
  return KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.every((r) => union.has(r.source));
})());
gate('G423-BLN — the registry exports this slice id by name',
  /export const BUILDER_LIFECYCLE_NORMALIZATION_SLICE_ID/.test(readSrc(REGISTRY_REL))
  && NORMALIZATION === 'studio-builder-lifecycle-normalization');
gate('G423-BLN — the catalog has no parallel authorization list',
  /export const [A-Z_]*HISTORICAL_BRANCH_CONSUMER_COMPAT/.test(readSrc(REGISTRY_REL)) === false);
gate('G423-BLN — this slice scope never reaches production, the Builder or the guard', (() => {
  const s = slice(NORMALIZATION);
  const all = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  return ['src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs', 'src/modules/x.js', 'backend/server.js',
    'src/pages/x.jsx', 'src/components/x.jsx', 'prisma/schema.prisma', GUARD_REL,
    'src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js']
    .every((p) => !all.some((r) => r.test(p)));
})());
gate('G423-BLN — this slice scope never reaches a pre-Studio gate',
  LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.every((g) => G.isPathAuthorizedForStudioSlice(g, NORMALIZATION) === false));
for (const p of SIX_CONSUMERS) {
  gate(`G423-BLN — authorized for the governance consumer: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, NORMALIZATION));
}
for (const p of ['src/runtime/__tests__/studio-scope-governance-maintenance.test.js',
  'scripts/gates/g423-studio-scope-governance-maintenance.mjs',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder.mjs',
  'src/runtime/__tests__/studio-bridge-decision-core-envelope-builder-implementation-plan.test.js',
  'scripts/gates/g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs',
  GUARD_REL,
  'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md',
  'docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/CERTIFICATION-REPORT.md',
  'scripts/gates/g423-studio-scope-governance-historical-branch-consumers.test.js']) {
  gate(`G423-BLN — NOT authorized for: ${path.basename(p)}`, G.isPathAuthorizedForStudioSlice(p, NORMALIZATION) === false);
}

// =====================================================================
// The lifecycle change, measured through the guard
// =====================================================================
for (const [ordinal, callers] of [[41, [MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION]],
  [24, [MIGRATION, CORRECTION, CONSUMERS, NORMALIZATION]],
  [42, [CORRECTION, CONSUMERS, NORMALIZATION]],
  [43, [CONSUMERS, NORMALIZATION]],
  [44, [NORMALIZATION]]]) {
  gate(`G423-BLN — the fixture of slice ${ordinal} resolves exactly one active slice`, (() => {
    const a = G.resolveActiveStudioSlice(FIXTURE[ordinal]);
    return a.ok === true && a.sliceOrdinal === ordinal && a.candidates.length === 1;
  })());
  gate(`G423-BLN — the fixture of slice ${ordinal} is sound for its OWN slice`, (() => {
    const own = G.resolveActiveStudioSlice(FIXTURE[ordinal]).sliceId;
    return G.evaluateStudioBranchScope(FIXTURE[ordinal], { callerSliceId: own }).safe === true;
  })());
  for (const caller of callers) {
    gate(`G423-BLN — slice ${ordinal} is fail-closed for later caller ${caller}`, (() => {
      const r = G.evaluateStudioBranchConsumerScope(FIXTURE[ordinal], { callerSliceId: caller });
      return r.activeSliceOrdinal === ordinal && r.activeSliceOrdinal < r.consumerSliceOrdinal
        && r.consumerApplicable === false && r.applicable === false && r.notApplicable === false
        && r.reason === 'historical_branch_consumer_compatibility_not_authorized'
        && r.certifiedAgainstActiveSlice === false && r.evaluatedAsSliceId === null
        && r.blockers.includes('active_slice_before_caller') && r.safe === false;
    })());
    gate(`G423-BLN — slice ${ordinal} authorizes nothing for later caller ${caller}`, (() => {
      const r = G.evaluateStudioBranchConsumerScope(FIXTURE[ordinal], { callerSliceId: caller });
      return r.allowed.length === 0 && r.crossAuthorized.length === 0
        && r.explicitForbiddenAuthorized.length === 0 && r.total === 0;
    })());
    gate(`G423-BLN — the core agrees with the wrapper for slice ${ordinal}, caller ${caller}`,
      G.evaluateStudioBranchDiffScope(FIXTURE[ordinal], { callerSliceId: caller })
        .blockers.includes('active_slice_before_caller'));
  }
}
gate('G423-BLN — the Builder branch is no longer a special case', (() => {
  const b = G.evaluateStudioBranchConsumerScope(FIXTURE[41], { callerSliceId: NORMALIZATION });
  const m = G.evaluateStudioBranchConsumerScope(FIXTURE[24], { callerSliceId: NORMALIZATION });
  return b.reason === m.reason && b.safe === m.safe && b.notApplicable === m.notApplicable;
})());
gate('G423-BLN — no self-certification is attempted anywhere',
  [41, 24, 42, 43, 44].every((o) => {
    const r = G.evaluateStudioBranchConsumerScope(FIXTURE[o], { callerSliceId: NORMALIZATION });
    return r.certifiedAgainstActiveSlice === false && r.evaluatedAsSliceId === null;
  }));
gate('G423-BLN — an EARLIER caller is still the certifier and stays applicable', (() => {
  const r = G.evaluateStudioBranchConsumerScope(FIXTURE[41], { callerSliceId: MAINTENANCE });
  return r.consumerApplicable === true && r.safe === true;
})());
gate('G423-BLN — this slice own diff is applicable and safe for itself', (() => {
  const r = G.evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: NORMALIZATION });
  return r.consumerApplicable === true && r.safe === true
    && r.allowed.length === OWN_DIFF.length && r.activeSliceId === NORMALIZATION;
})());
for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS]) {
  gate(`G423-BLN — this slice own diff is applicable and safe for earlier caller ${caller}`, (() => {
    const r = G.evaluateStudioBranchConsumerScope(OWN_DIFF, { callerSliceId: caller });
    return r.consumerApplicable === true && r.safe === true && r.activeSliceOrdinal > r.consumerSliceOrdinal;
  })());
}

// =====================================================================
// The core and the guard, unchanged
// =====================================================================
gate('G423-BLN — resolveActiveStudioSlice([]) fails closed',
  G.resolveActiveStudioSlice([]).ok === false && G.resolveActiveStudioSlice([]).reason === 'no_active_slice_resolved');
gate('G423-BLN — evaluateStudioBranchScope([]) fails closed',
  G.evaluateStudioBranchScope([], { callerSliceId: NORMALIZATION }).safe === false);
gate('G423-BLN — evaluateStudioBranchDiffScope([]) is notApplicable and safe', (() => {
  const r = G.evaluateStudioBranchDiffScope([], { callerSliceId: NORMALIZATION });
  return r.notApplicable === true && r.reason === 'empty_branch_diff' && r.safe === true;
})());
gate('G423-BLN — evaluateStudioBranchConsumerScope([]) is notApplicable and safe', (() => {
  const r = G.evaluateStudioBranchConsumerScope([], { callerSliceId: NORMALIZATION });
  return r.notApplicable === true && r.reason === 'empty_branch_diff' && r.safe === true
    && r.activeSliceId === null && r.allowed.length === 0;
})());
for (const [label, bad] of [['null', null], ['undefined', undefined], ['string', 'x'], ['object', {}],
  ['number item', [1]], ['empty string item', ['']], ['mixed items', ['a', 2]], ['nested array', [[]]]]) {
  gate(`G423-BLN — invalid input fails closed, never treated as empty: ${label}`, (() => {
    const r = G.evaluateStudioBranchConsumerScope(bad, { callerSliceId: NORMALIZATION });
    return r.safe === false && r.notApplicable === false && r.reason === 'invalid_changed_paths';
  })());
}
gate('G423-BLN — an unknown caller fails closed',
  [[], OWN_DIFF, FIXTURE[41]].every((p) => {
    const r = G.evaluateStudioBranchConsumerScope(p, { callerSliceId: 'nope' });
    return r.safe === false && r.reason === 'unknown_caller_slice' && r.notApplicable === false;
  }));
gate('G423-BLN — a missing caller option fails closed', G.evaluateStudioBranchConsumerScope(OWN_DIFF, {}).safe === false);
gate('G423-BLN — an unresolved active slice fails closed', (() => {
  const r = G.evaluateStudioBranchConsumerScope(['package.json'], { callerSliceId: NORMALIZATION });
  return r.safe === false && r.notApplicable === false && r.reason === 'no_active_slice_resolved';
})());
for (const [a, b] of [[41, 45], [24, 45], [44, 45], [24, 41], [41, 44]]) {
  gate(`G423-BLN — two markers are always ambiguous: ${a} + ${b}`, (() => {
    const r = G.resolveActiveStudioSlice([MARKER[a], MARKER[b]]);
    return r.ok === false && r.reason === 'ambiguous_active_slice' && r.candidates.length === 2 && r.sliceId === null;
  })());
  gate(`G423-BLN — an ambiguous diff fails closed through the consumer boundary: ${a} + ${b}`,
    G.evaluateStudioBranchConsumerScope([MARKER[a], MARKER[b]], { callerSliceId: NORMALIZATION }).safe === false);
}
gate('G423-BLN — ambiguity is decided BEFORE the authorization gate',
  G.evaluateStudioBranchConsumerScope([...FIXTURE[41], MARKER[24]], { callerSliceId: NORMALIZATION }).reason === 'ambiguous_active_slice');
gate('G423-BLN — status never decides active resolution',
  [24, 41, 44, 45].every((o) => {
    const r = G.resolveActiveStudioSlice([MARKER[o]]);
    return r.ok === true && r.sliceOrdinal === o;
  }));
gate('G423-BLN — shared governance paths never elect a slice',
  [REGISTRY_REL, GUARD_REL, 'package.json', 'package-lock.json']
    .every((p) => G.resolveActiveStudioSlice([p]).candidates.length === 0));
gate('G423-BLN — a cross-authorized path never elects a slice',
  SIX_CONSUMERS.every((p) => G.resolveActiveStudioSlice([p]).candidates.length === 0));
gate('G423-BLN — this slice own test and gate never elect it',
  G.resolveActiveStudioSlice([TEST_REL, GATE_REL]).candidates.length === 0);
for (const opt of [{ historicalBranchConsumerCompatibility: true }, { allowHistorical: true },
  { ignoreChronology: true }, { expectedActiveSlice: BUILDER }]) {
  gate(`G423-BLN — no caller option grants the authorization: ${Object.keys(opt)[0]}`, (() => {
    const r = G.evaluateStudioBranchConsumerScope(FIXTURE[41], { callerSliceId: NORMALIZATION, ...opt });
    return r.safe === false && r.reason === 'historical_branch_consumer_compatibility_not_authorized';
  })());
}
gate('G423-BLN — explicit forbidden stays catalog-bound and is not injectable',
  G.evaluateStudioBranchScope([...OWN_DIFF, 'src/App.jsx'],
    { callerSliceId: NORMALIZATION, explicitlyAuthorizedForbidden: [/^src\/App\.jsx$/] }).forbidden.includes('src/App.jsx'));
gate('G423-BLN — explicit forbidden is still honoured for the slice that declares it', (() => {
  const r = G.evaluateStudioBranchScope([
    'src/studio/blueprint-engine/dev-preview-app-integration/index.js', MARKER[24],
    'src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs'], { callerSliceId: APP_INTEGRATION });
  return r.safe === true && r.explicitForbiddenAuthorized.length === 2;
})());
gate('G423-BLN — the consumer report is frozen and side-effect free',
  [[], OWN_DIFF, FIXTURE[41], null].every((p) => {
    const r = G.evaluateStudioBranchConsumerScope(p, { callerSliceId: NORMALIZATION });
    return Object.isFrozen(r) && r.kind === 'studio-branch-consumer-scope-evaluation'
      && r.sideEffects === false && r.mutationAllowed === false && r.backendAccessed === false
      && r.prismaAccessed === false && r.fetchUsed === false;
  }));
gate('G423-BLN — the boundary is deterministic and does not mutate its input', (() => {
  const input = [...FIXTURE[41]];
  const a = JSON.stringify(G.evaluateStudioBranchConsumerScope(input, { callerSliceId: NORMALIZATION }));
  const b = JSON.stringify(G.evaluateStudioBranchConsumerScope(input, { callerSliceId: NORMALIZATION }));
  return a === b && JSON.stringify(input) === JSON.stringify(FIXTURE[41]);
})());
gate('G423-BLN — the guard keeps its authorization gate and its refusal',
  /export function evaluateStudioBranchConsumerScope\(/.test(readSrc(GUARD_REL))
  && /activeSlice\.historicalBranchConsumerCompatibility !== true/.test(readSrc(GUARD_REL))
  && readSrc(GUARD_REL).includes('active_slice_before_caller'));
for (const token of ['bridge-decision-core-envelope-builder', 'open_pull_request', '495',
  'sliceOrdinal === 41', 'allowHistorical', 'ignoreChronology', 'skipChronology', 'permissive', 'bypassChronology']) {
  gate(`G423-BLN — the guard hardcodes no identity and no permissive option: ${token}`, readSrc(GUARD_REL).includes(token) === false);
}
gate('G423-BLN — guard imports only the registry', (() => {
  const imports = [...readSrc(GUARD_REL).matchAll(/^import [^;]*from '([^']+)';/gm)].map((m) => m[1]);
  return [...new Set(imports)].join(',') === './studioScopeGovernanceRegistry.mjs';
})());
gate('G423-BLN — registry imports nothing', /^import /m.test(readSrc(REGISTRY_REL)) === false);
for (const api of ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'PrismaClient', 'readFileSync']) {
  gate(`G423-BLN — guard uses no impure API: ${api}`, readSrc(GUARD_REL).includes(api) === false);
  gate(`G423-BLN — registry uses no impure API: ${api}`, readSrc(REGISTRY_REL).includes(api) === false);
}

// =====================================================================
// Negatives
// =====================================================================
for (const p of FORBIDDEN) {
  gate(`G423-BLN — forbidden stays forbidden: ${p}`,
    G.classifyStudioScopePath(p) === 'forbidden_scope' && G.isPathAuthorizedForStudioSlice(p, NORMALIZATION) === false);
  gate(`G423-BLN — a forbidden path makes this branch unsafe: ${p}`,
    G.evaluateStudioBranchScope([...OWN_DIFF, p], { callerSliceId: NORMALIZATION }).safe === false);
}
for (const p of LOOKALIKES) {
  gate(`G423-BLN — lookalike authorized for nobody: ${p}`,
    STUDIO_SLICE_CATALOG.every((s) => G.isPathAuthorizedForStudioSlice(p, s.sliceId) === false));
  gate(`G423-BLN — lookalike makes this branch unsafe: ${p}`,
    G.evaluateStudioBranchScope([...OWN_DIFF, p], { callerSliceId: NORMALIZATION }).safe === false);
}
gate('G423-BLN — a foreign catalogued path is a chronological violation for this slice', (() => {
  const foreign = 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js';
  const r = G.evaluateStudioBranchScope([...OWN_DIFF, foreign], { callerSliceId: NORMALIZATION });
  return r.chronologicalViolation.includes(foreign) && r.safe === false;
})());
gate('G423-BLN — historical evidence is never cross-authorized by this slice',
  ['docs/evidence/post-foundation-c-studio-bridge-decision-core-envelope-builder/READINESS.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/SLICE-CATALOG.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-main-diff-correction/READINESS.md',
    'docs/evidence/post-foundation-c-studio-scope-governance-historical-branch-consumers/READINESS.md']
    .every((p) => G.isPathAuthorizedForStudioSlice(p, NORMALIZATION) === false));
gate('G423-BLN — the central guard is never cross-authorized by this slice',
  G.isPathAuthorizedForStudioSlice(GUARD_REL, NORMALIZATION) === false);
for (const g of LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  gate(`G423-BLN — pre-Studio gate stays outside every boundary: ${path.basename(g)}`, (() => {
    const src = readSrc(g);
    return src.includes('evaluateStudioBranchScope(') === false
      && src.includes('evaluateStudioBranchDiffScope(') === false
      && src.includes('evaluateStudioBranchConsumerScope(') === false
      && G.findOwningStudioSlices(g).length === 0;
  })());
}

// =====================================================================
// Source scans
// =====================================================================
for (const p of SIX_CONSUMERS) {
  gate(`G423-BLN — the governance consumer no longer asserts the transitional lifecycle: ${path.basename(p)}`, (() => {
    const src = readSrc(p);
    return /status\s*===\s*'open_pull_request_495'/.test(src) === false
      && /status,\s*'open_pull_request_495'/.test(src) === false;
  })());
  gate(`G423-BLN — the governance consumer carries no permissive option: ${path.basename(p)}`, (() => {
    const src = readSrc(p);
    return src.includes('allowHistorical: true') === false || src.includes('safe, false') || src.includes('safe === false');
  })());
}

// =====================================================================
// Artifacts and evidence
// =====================================================================
gate('G423-BLN — slice test exists', fs.existsSync(path.join(ROOT, TEST_REL)));
gate('G423-BLN — slice gate exists', fs.existsSync(path.join(ROOT, GATE_REL)));
gate('G423-BLN — evidence directory exists', fs.existsSync(path.join(ROOT, EV_REL)));
for (const doc of ['README.md', 'ROOT-CAUSE.md', 'REGISTRY-LIFECYCLE-TRANSITION.md',
  'BUILDER-COMPATIBILITY-RESET.md', 'SCOPE-INVENTORY.md', 'NEGATIVE-MATRIX.md',
  'CERTIFICATION-REPORT.md', 'READINESS.md', 'POST-MERGE-REVALIDATION-PLAN.md']) {
  gate(`G423-BLN — evidence present and non-trivial: ${doc}`, readEv(doc).length > 200);
}
gate('G423-BLN — the root cause document names the merged PR and the risk',
  readEv('ROOT-CAUSE.md').includes('5bfecd60')
  && readEv('ROOT-CAUSE.md').includes('historicalBranchConsumerCompatibility')
  && readEv('ROOT-CAUSE.md').includes('B-CONSUMER-INAPPLICABILITY-NOT-CATALOG-BOUND'));
gate('G423-BLN — the transition document records all three moves', (() => {
  const doc = readEv('REGISTRY-LIFECYCLE-TRANSITION.md');
  return doc.includes('open_pull_request_495') && doc.includes('merged')
    && doc.includes('active_slice') && doc.includes(BUILDER);
})());
gate('G423-BLN — the compatibility document states both sides of the change',
  readEv('BUILDER-COMPATIBILITY-RESET.md').includes('consumer_slice_after_active_slice')
  && readEv('BUILDER-COMPATIBILITY-RESET.md').includes('historical_branch_consumer_compatibility_not_authorized'));
gate('G423-BLN — the scope inventory records the exact six cross paths',
  SIX_CONSUMERS.every((p) => readEv('SCOPE-INVENTORY.md').includes(path.basename(p))));
gate('G423-BLN — the negative matrix records the fail-closed universality',
  readEv('NEGATIVE-MATRIX.md').includes('historical_branch_consumer_compatibility_not_authorized')
  && readEv('NEGATIVE-MATRIX.md').includes(BUILDER) && readEv('NEGATIVE-MATRIX.md').includes(APP_INTEGRATION));
gate('G423-BLN — readiness declares the normalized lifecycle', (() => {
  const doc = readEv('READINESS.md');
  return /builderStatusIs:\s*merged/.test(doc) && /builderCompatibilityIs:\s*false/.test(doc)
    && /slice44StatusIs:\s*merged/.test(doc) && /catalogCompatibilityTrueCount:\s*0/.test(doc)
    && /catalogActiveSlices:\s*1/.test(doc);
})());
gate('G423-BLN — readiness does not claim the main is green',
  /mainVerifiedGreen:\s*false/.test(readEv('READINESS.md'))
  && /postMergeRevalidationRequired:\s*true/.test(readEv('READINESS.md')));
gate('G423-BLN — readiness declares the core and the guard untouched', (() => {
  const doc = readEv('READINESS.md');
  return /guardModified:\s*false/.test(doc) && /coreApisUnchanged:\s*true/.test(doc)
    && /builderFunctionalSourceTouched:\s*false/.test(doc);
})());
gate('G423-BLN — the revalidation plan covers the zero-authorization state on main',
  readEv('POST-MERGE-REVALIDATION-PLAN.md').includes('historical_branch_consumer_compatibility_not_authorized')
  && readEv('POST-MERGE-REVALIDATION-PLAN.md').includes('empty_branch_diff'));
gate('G423-BLN — package.json wires the slice test',
  /"test:runtime:studio-builder-lifecycle-normalization":/.test(readSrc('package.json')));
gate('G423-BLN — package.json wires the slice gate',
  /"gate:g423-studio-builder-lifecycle-normalization":/.test(readSrc('package.json')));
gate('G423-BLN — the aggregate test:runtime includes this slice',
  readSrc('package.json').includes('studio-builder-lifecycle-normalization.test.js'));

// =====================================================================
// This branch, judged by its own rules
// =====================================================================
let branchPaths = null;
try { branchPaths = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { branchPaths = null; }
if (branchPaths === null) {
  gate('G423-BLN — this branch is sound under its own rules', true, 'git base unavailable — skipped');
} else {
  const r = G.evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: CALLER_SLICE_ID });
  gate('G423-BLN — this branch is sound under its own rules', r.safe === true, JSON.stringify(r.blockers));
  gate('G423-BLN — this branch has no forbidden, unknown or foreign path',
    r.forbidden.length === 0 && r.unknown.length === 0 && r.chronologicalViolation.length === 0);
  for (const caller of [MAINTENANCE, MIGRATION, CORRECTION, CONSUMERS]) {
    gate(`G423-BLN — this branch is sound for earlier caller ${caller}`,
      G.evaluateStudioBranchConsumerScope(branchPaths, { callerSliceId: caller }).safe === true);
  }
  gate('G423-BLN — this branch touches no forbidden path',
    branchPaths.every((p) => G.classifyStudioScopePath(p) !== 'forbidden_scope'));
  gate('G423-BLN — this branch touches no Studio blueprint-engine source',
    branchPaths.every((p) => !p.startsWith('src/studio/blueprint-engine/')));
  gate('G423-BLN — this branch touches no earlier slice evidence directory',
    branchPaths.filter((p) => p.startsWith('docs/evidence/')).every((p) => p.startsWith(EV_REL)));
  gate('G423-BLN — this branch does not touch the central guard',
    branchPaths.includes(GUARD_REL) === false);
  gate('G423-BLN — this branch resolves exactly this slice, or is empty', (() => {
    const a = G.resolveActiveStudioSlice(branchPaths);
    return branchPaths.length === 0
      || (a.ok === true && a.candidates.length === 1 && a.sliceId === NORMALIZATION);
  })());
  gate('G423-BLN — every path on this branch is authorized by the active slice', (() => {
    if (branchPaths.length === 0) return true;
    const a = G.createResolvedActiveStudioSlicePathAuthorizer(branchPaths);
    return a.ok === true && branchPaths.every((p) => a.isAuthorized(p))
      && ['src/App.jsx', 'docs/nobody/x.md', GUARD_REL].every((p) => a.isAuthorized(p) === false);
  })());
  gate('G423-BLN — branch diff is empty on main or substantive on a real slice branch',
    branchPaths.length === 0 || branchPaths.length >= 5, `${branchPaths.length} paths`);
  gate('G423-BLN — an empty diff is admitted ONLY as the safe empty_branch_diff state', (() => {
    if (branchPaths.length !== 0) return true;
    const e = G.evaluateStudioBranchConsumerScope([], { callerSliceId: CALLER_SLICE_ID });
    return e.reason === 'empty_branch_diff' && e.notApplicable === true && e.safe === true && e.activeSliceId === null;
  })());
  gate('G423-BLN — a non-empty branch diff is never treated as empty', (() => {
    if (branchPaths.length === 0) return true;
    return r.reason !== 'empty_branch_diff' && r.activeSliceId !== null;
  })());
}

console.log(`\n--- G423-STUDIO-BUILDER-LIFECYCLE-NORMALIZATION summary ---`);
console.log(`PASS: ${pass}/${total}  (total checks: ${total})`);
if (failures.length) { console.log(`FAIL: ${failures.length}`); for (const f of failures) console.log(`  ✗ ${f}`); }
process.exit(failures.length === 0 ? 0 : 1);
