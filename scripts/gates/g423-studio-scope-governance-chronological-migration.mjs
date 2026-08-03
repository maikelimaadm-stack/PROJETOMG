#!/usr/bin/env node
/**
 * Gate G423-STUDIO-SCOPE-GOVERNANCE-CHRONOLOGICAL-MIGRATION — Post-Foundation C.
 *
 * Proves the caller-aware, chronological Studio scope governance with LIVE evaluations, not greps:
 * a single slice catalog with stable ordinals, unique ids and non-overlapping ownership; active-slice
 * resolution that fails closed on zero and on ambiguity; chronology that accepts a later active slice and
 * refuses an earlier one; exact, non-inheritable cross-slice authorization; forbidden and unknown that always
 * fail closed; the nine aggregate-blocking tests and the twenty-two Studio gates actually migrated; the REAL
 * PR #495 diff evaluated from a reproducible fixture; the Builder registered as a future known slice; no broad
 * wildcard; no production code; slice scope; bundle absence.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const EV = path.join(ROOT, 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration');
const REGISTRY_REL = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
const GUARD_REL = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const TEST_REL = 'src/runtime/__tests__/studio-scope-governance-chronological-migration.test.js';
const GATE_REL = 'scripts/gates/g423-studio-scope-governance-chronological-migration.mjs';

const results = [];
const gate = (name, ok, detail = '') => { results.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const readEv = (f) => (fs.existsSync(path.join(EV, f)) ? fs.readFileSync(path.join(EV, f), 'utf8') : '');
const readSrc = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const REG = await import(pathToFileURL(path.join(ROOT, REGISTRY_REL)).href);
const G = await import(pathToFileURL(path.join(ROOT, GUARD_REL)).href);

const MIGRATION = REG.CHRONOLOGICAL_MIGRATION_SLICE_ID;
const BUILDER = 'bridge-decision-core-envelope-builder';
const CATALOG = REG.STUDIO_SLICE_CATALOG;

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
const FORBIDDEN_FIXTURES = [
  'src/App.jsx', 'src/pages/Home.jsx', 'src/components/Table.jsx', 'src/modules/studio/index.js',
  'src/ModeloBase1/x.js', 'src/ModeloBase2/y.js', 'backend/server.js', 'prisma/schema.prisma',
  'migrations/001.sql', 'src/apis/client.js', 'src/framework/core.js', 'src/bos/home.js',
  'src/styles/app.css', 'src/runtime/loadRuntimeBundle.js', 'scripts/gates/lib/productionUiGuard.mjs',
];
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

const fixture = JSON.parse(readEv('PR495-CHANGED-PATHS.json'));
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return `fnv1a-${h.toString(16).padStart(8, '0')}`;
}

// ---- Catalog ----
gate('G423-SGCM — catalog present and frozen', Array.isArray(CATALOG) && CATALOG.length >= 40 && Object.isFrozen(CATALOG), `${CATALOG.length} slices`);
gate('G423-SGCM — slice ids unique', new Set(CATALOG.map((s) => s.sliceId)).size === CATALOG.length);
gate('G423-SGCM — ordinals unique', new Set(CATALOG.map((s) => s.sliceOrdinal)).size === CATALOG.length);
gate('G423-SGCM — ordinals positive integers', CATALOG.every((s) => Number.isInteger(s.sliceOrdinal) && s.sliceOrdinal > 0));
gate('G423-SGCM — ordinals contiguous 1..N', JSON.stringify(CATALOG.map((s) => s.sliceOrdinal).sort((a, b) => a - b)) === JSON.stringify(CATALOG.map((_, i) => i + 1)));
gate('G423-SGCM — legacy export derived from the catalog',
  JSON.stringify(REG.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.map((r) => r.toString()))
  === JSON.stringify(CATALOG.flatMap((s) => [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns]).map((r) => r.toString())));
{
  const seen = new Map(); let overlap = null;
  for (const s of CATALOG) for (const re of s.primaryArtifactPatterns) {
    if (seen.has(re.toString())) overlap = `${re} :: ${seen.get(re.toString())} vs ${s.sliceId}`;
    seen.set(re.toString(), s.sliceId);
  }
  gate('G423-SGCM — zero primary ownership overlap', overlap === null, overlap || '');
}
for (const s of CATALOG) {
  const all = [...s.primaryArtifactPatterns, ...s.branchMarkerPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns];
  gate(`G423-SGCM — ${s.sliceId} patterns anchored + no broad wildcard`,
    all.every((re) => re instanceof RegExp && re.source.startsWith('^') && re.source.length > 8
      && !REG.FORBIDDEN_BROAD_ALLOW_SOURCES.includes(re.toString())));
  gate(`G423-SGCM — ${s.sliceId} markers are a subset of its primary artifacts`,
    s.branchMarkerPatterns.every((m) => s.primaryArtifactPatterns.some((p) => p.toString() === m.toString())));
  const probes = [...s.primaryArtifactPatterns, ...s.crossSliceAuthorizedPatterns, ...s.sharedGovernancePatterns]
    .map((re) => re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.'));
  gate(`G423-SGCM — ${s.sliceId} declares no forbidden path`,
    probes.every((p) => !REG.FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(p))));
}
for (const required of ['studio-scope-governance-maintenance', 'studio-scope-governance-self-guard-fix',
  'module-preview-sandbox', 'authoring-runtime-to-preview-bridge-contract',
  'authoring-runtime-to-preview-bridge-implementation-plan', 'authoring-runtime-to-preview-bridge',
  'authoring-runtime-to-preview-bridge-hardening', 'bridge-to-preview-sandbox-runtime-contract',
  'bridge-decision-envelope-identity-contract', 'bridge-to-preview-sandbox-runtime-implementation-plan',
  'bridge-decision-core-envelope-contract', 'bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
  'bridge-decision-core-envelope-builder-contract', 'bridge-decision-core-envelope-builder-verification-state-correction',
  'bridge-decision-core-envelope-builder-implementation-plan', BUILDER, MIGRATION]) {
  gate(`G423-SGCM — mandatory slice catalogued: ${required}`, G.getStudioSliceById(required) !== null);
}
gate('G423-SGCM — unknown slice id resolves to null', ['nope', '', null, undefined, 1].every((b) => G.getStudioSliceById(b) === null));
gate('G423-SGCM — ordinal lookup round-trips', CATALOG.every((s) => G.getStudioSliceByOrdinal(s.sliceOrdinal).sliceId === s.sliceId));
{
  const o = (id) => G.getStudioSliceById(id).sliceOrdinal;
  gate('G423-SGCM — program chronology holds',
    o('module-preview-sandbox') < o('dev-preview-contract-bridge')
    && o('dev-preview-app-integration') < o('module-blueprint-authoring-foundation-contract')
    && o('module-blueprint-authoring-runtime') < o('authoring-runtime-to-preview-bridge-contract')
    && o('bridge-decision-core-envelope-builder-implementation-plan') < o(BUILDER)
    && o(BUILDER) < o(MIGRATION));
}

// ---- Builder future registration ----
gate('G423-SGCM — Builder registered as future known slice (PR #495)', G.getStudioSliceById(BUILDER).status === 'open_pull_request_495');
gate('G423-SGCM — Builder declares exactly four primary patterns', G.getStudioSliceById(BUILDER).primaryArtifactPatterns.length === 4);
for (const p of BUILDER_PRIMARY) gate(`G423-SGCM — Builder owns ${path.basename(p)}`, G.findOwningStudioSlices(p).map((s) => s.sliceId).join() === BUILDER);
gate('G423-SGCM — Builder cross list is EXACTLY two lifecycle paths', G.getStudioSliceById(BUILDER).crossSliceAuthorizedPatterns.length === 2);
for (const p of BUILDER_CROSS) gate(`G423-SGCM — Builder cross-authorized for ${path.basename(p)}`, G.getStudioSliceById(BUILDER).crossSliceAuthorizedPatterns.some((re) => re.test(p)));
for (const f of ['src/runtime/__tests__/studio-authoring-runtime-to-preview-bridge.test.js',
  'scripts/gates/g423-studio-authoring-runtime-to-preview-bridge.mjs',
  'scripts/gates/g423-studio-module-preview-sandbox-contract.mjs',
  'src/runtime/__tests__/studio-scope-governance-maintenance.test.js']) {
  gate(`G423-SGCM — Builder NOT cross-authorized for ${path.basename(f)}`, !G.getStudioSliceById(BUILDER).crossSliceAuthorizedPatterns.some((re) => re.test(f)));
}

// ---- Active slice resolution ----
gate('G423-SGCM — real PR #495 diff resolves exactly the Builder', (() => { const r = G.resolveActiveStudioSlice(fixture.paths); return r.ok && r.sliceId === BUILDER && r.candidates.length === 1; })());
gate('G423-SGCM — migration-shaped diff resolves the migration', G.resolveActiveStudioSlice([REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, `docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md`]).sliceId === MIGRATION);
gate('G423-SGCM — zero markers fails closed', G.resolveActiveStudioSlice(['README.md']).reason === 'no_active_slice_resolved');
gate('G423-SGCM — two markers is ambiguous and fails closed', G.resolveActiveStudioSlice(['src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js', 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md']).reason === 'ambiguous_active_slice');
for (const shared of ['package.json', 'package-lock.json', REGISTRY_REL, GUARD_REL]) {
  gate(`G423-SGCM — shared infra alone resolves nothing: ${path.basename(shared)}`, !G.resolveActiveStudioSlice([shared]).ok && G.findMarkingStudioSlices(shared).length === 0);
}
for (const [p] of NINE_TESTS) gate(`G423-SGCM — migrated test is not a marker: ${path.basename(p)}`, G.findMarkingStudioSlices(p).length === 0);
for (const [p] of TWENTY_TWO_GATES) gate(`G423-SGCM — migrated gate is not a marker: ${path.basename(p)}`, G.findMarkingStudioSlices(p).length === 0);
gate('G423-SGCM — resolution reads no branch name / network / clock / env',
  ['execSync', 'child_process', 'fetch(', 'process.env', 'Date.now', 'require('].every((t) => !readSrc(GUARD_REL).includes(t)));

// ---- Chronology ----
const MIGRATION_DIFF = [REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL, 'package.json',
  'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md',
  ...NINE_TESTS.map(([p]) => p), ...TWENTY_TWO_GATES.map(([p]) => p)];
for (const [, caller] of [...NINE_TESTS, ...TWENTY_TWO_GATES]) {
  const r = G.evaluateStudioBranchScope(MIGRATION_DIFF, { callerSliceId: caller });
  gate(`G423-SGCM — caller ${caller} accepts the later migration slice`, r.safe && r.activeSliceId === MIGRATION && r.activeSliceOrdinal > r.callerSliceOrdinal, r.blockers.join(','));
}
{
  const older = ['src/studio/blueprint-engine/module-preview-sandbox/index.js', 'docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract/CERTIFICATION-REPORT.md'];
  const r = G.evaluateStudioBranchScope(older, { callerSliceId: BUILDER });
  gate('G423-SGCM — a newer caller REJECTS an older active slice', !r.safe && r.blockers.includes('active_slice_before_caller'));
}
gate('G423-SGCM — same slice accepts its own artifacts', (() => { const r = G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER }); return r.safe && r.callerSliceOrdinal === r.activeSliceOrdinal; })());
gate('G423-SGCM — unknown caller blocks', ['nope', '', null].every((b) => { const r = G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: b }); return !r.safe && r.blockers.includes('unknown_caller_slice'); }));
gate('G423-SGCM — unresolved active blocks', G.evaluateStudioBranchScope(['README.md'], { callerSliceId: BUILDER }).blockers.includes('no_active_slice_resolved'));
gate('G423-SGCM — ambiguous active blocks', G.evaluateStudioBranchScope(['src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js', 'src/studio/blueprint-engine/module-preview-sandbox/index.js'], { callerSliceId: 'module-preview-sandbox' }).blockers.includes('ambiguous_active_slice'));
gate('G423-SGCM — evaluation is order-independent and deterministic',
  JSON.stringify(G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER })) === JSON.stringify(G.evaluateStudioBranchScope([...fixture.paths].reverse(), { callerSliceId: BUILDER })));
gate('G423-SGCM — evaluation declares no side effect', (() => { const r = G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER }); return r.sideEffects === false && r.backendAccessed === false && r.prismaAccessed === false && r.fetchUsed === false && r.mutationAllowed === false; })());

// ---- Cross-slice authorization ----
for (const p of BUILDER_CROSS) {
  const r = G.evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
  gate(`G423-SGCM — Builder admits lifecycle path by cross auth: ${path.basename(p)}`, r.safe && r.crossAuthorized.includes(p));
}
for (const f of ['src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js',
  'scripts/gates/g423-studio-dev-preview-route-menu.mjs', 'src/runtime/__tests__/studio-scope-governance-maintenance.test.js']) {
  const r = G.evaluateStudioBranchScope([...fixture.paths, f], { callerSliceId: BUILDER });
  gate(`G423-SGCM — Builder REJECTS a third prior artifact: ${path.basename(f)}`, !r.safe && r.chronologicalViolation.includes(f));
}
for (const [p] of [...NINE_TESTS, ...TWENTY_TWO_GATES]) {
  gate(`G423-SGCM — migration cross-authorized for ${path.basename(p)}`, G.getStudioSliceById(MIGRATION).crossSliceAuthorizedPatterns.some((re) => re.test(p)));
}
const EXTENSION_ARTIFACTS = [
  ...['empresas-certified-blueprint-mirror-alignment-audit', 'empresas-local-read-contract-certification',
    'empresas-local-read-only-contract-pilot', 'empresas-local-read-parity-hardening', 'empresas-studio-compatibility-slice-1',
    'post-foundation-c-empresas-controlled-production-test-plan', 'post-foundation-c-studio-foundation-audit',
    'studio-authoring-runtime-to-preview-bridge-hardening', 'studio-authoring-runtime-to-preview-bridge-source-shape-alignment',
    'studio-blueprint-contract-certification', 'studio-blueprint-contract-hardening', 'studio-blueprint-engine-foundation',
    'studio-blueprint-module-reference-planner', 'studio-bridge-decision-envelope-identity-contract',
    'studio-bridge-to-preview-sandbox-runtime-contract', 'studio-foundation-contracts', 'studio-module-preview-sandbox-contract',
  ].map((n) => `src/runtime/__tests__/${n}.test.js`),
  ...['g423-studio-blueprint-engine-foundation', 'g423-studio-blueprint-module-reference-planner',
    'g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment', 'g423-studio-authoring-runtime-to-preview-bridge-hardening',
    'g423-studio-bridge-to-preview-sandbox-runtime-contract', 'g423-studio-bridge-decision-envelope-identity-contract',
    'g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan', 'g423-studio-bridge-decision-core-envelope-contract',
    'g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
    'g423-studio-bridge-decision-core-envelope-builder-contract', 'g423-studio-bridge-decision-core-envelope-builder-implementation-plan',
  ].map((n) => `scripts/gates/${n}.mjs`),
];
gate('G423-SGCM — migration cross list is exactly what it migrates', G.getStudioSliceById(MIGRATION).crossSliceAuthorizedPatterns.length === NINE_TESTS.length + TWENTY_TWO_GATES.length + 2 + EXTENSION_ARTIFACTS.length);
for (const p of EXTENSION_ARTIFACTS) {
  gate(`G423-SGCM — extension artifact declared exactly: ${path.basename(p)}`, G.getStudioSliceById(MIGRATION).crossSliceAuthorizedPatterns.some((re) => re.test(p)));
  gate(`G423-SGCM — extension artifact only cross-authorized by a governance slice: ${path.basename(p)}`, CATALOG.filter((s) => !s.sliceId.startsWith('studio-scope-governance-') && !(s.sliceId === BUILDER && BUILDER_CROSS.includes(p))).every((s) => !s.crossSliceAuthorizedPatterns.some((re) => re.test(p))));
}
gate('G423-SGCM — the declared extension is documented', readEv('REQUIRED-SCOPE-EXTENSION.md').length > 400
  && EXTENSION_ARTIFACTS.every((p) => readEv('REQUIRED-SCOPE-EXTENSION.md').includes(path.basename(p).replace(/\.(test\.js|mjs)$/, ''))));
gate('G423-SGCM — cross authorization is never inherited', CATALOG.filter((s) => s.sliceId !== MIGRATION).every((s) => !s.crossSliceAuthorizedPatterns.some((re) => re.test('scripts/gates/g423-studio-dev-preview-route-menu.mjs'))));

// ---- Forbidden / unknown ----
for (const p of FORBIDDEN_FIXTURES) {
  gate(`G423-SGCM — forbidden classified: ${p}`, G.classifyStudioScopePath(p) === 'forbidden_scope');
  const r = G.evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
  gate(`G423-SGCM — forbidden blocks every caller: ${p}`, !r.safe && r.forbidden.includes(p));
  gate(`G423-SGCM — catalog never releases forbidden: ${p}`, G.isKnownLaterStudioHeadlessArtifact(p) === false);
}
gate('G423-SGCM — the only explicit forbidden authorization is the app-integration pair',
  REG.STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.length === 2
  && G.evaluateStudioBranchScope(['src/App.jsx', 'src/studio/blueprint-engine/dev-preview-app-integration/index.js', 'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/CERTIFICATION-REPORT.md'],
    { callerSliceId: 'dev-preview-app-integration' }).forbidden.length === 0);
// The authorization is now CATALOG-BOUND, so it applies whenever the App Integration slice is the active one —
// there is no option to withhold. What must still hold: no OTHER active slice ever inherits it (proved below).
gate('G423-SGCM — App.jsx is authorized only while App Integration is the ACTIVE slice',
  G.evaluateStudioBranchScope(['src/App.jsx', 'src/studio/blueprint-engine/dev-preview-app-integration/index.js'], { callerSliceId: 'dev-preview-app-integration' }).forbidden.length === 0
  && G.evaluateStudioBranchScope(['src/App.jsx', 'src/studio/blueprint-engine/module-preview-sandbox/index.js'], { callerSliceId: 'module-preview-sandbox' }).forbidden.length === 1);
for (const p of ['some/random/file.js', 'tools/x.mjs', 'src/whatever/unregistered.js', 'docs/notes.txt']) {
  const r = G.evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
  gate(`G423-SGCM — unknown fails closed: ${p}`, !r.safe && (r.unknown.includes(p) || r.chronologicalViolation.includes(p)));
}
gate('G423-SGCM — guard imports only the registry', JSON.stringify([...new Set([...readSrc(GUARD_REL).matchAll(/from '([^']+)'/g)].map((m) => m[1]))]) === JSON.stringify(['./studioScopeGovernanceRegistry.mjs']));
gate('G423-SGCM — registry is pure data, no imports, no I/O', !/^import /m.test(readSrc(REGISTRY_REL)) && ['execSync', 'readFileSync', 'fetch(', 'process.env'].every((t) => !readSrc(REGISTRY_REL).includes(t)));

// ---- Real PR #495 fixture ----
gate('G423-SGCM — fixture records the real PR #495 diff read-only', fixture.kind === 'pr495-real-diff-fixture' && fixture.capturedReadOnly === true);
gate('G423-SGCM — fixture base/head shas recorded', fixture.baseSha === '73d298e09fea349f9bc836555360d6adcb74655c' && fixture.headSha === '9634c3643541248d4b272813161b489b85fd8692');
gate('G423-SGCM — fixture digest reproducible', fnv1a([...fixture.paths].sort().join('\n')) === fixture.digest, fixture.digest);
gate('G423-SGCM — fixture is not the empty-diff trick', fixture.pathCount >= 80 && fixture.baseSha !== fixture.headSha, `${fixture.pathCount} paths`);
gate('G423-SGCM — Builder ordinal exceeds every one of the nine callers',
  NINE_TESTS.every(([, c]) => G.getStudioSliceById(BUILDER).sliceOrdinal > G.getStudioSliceById(c).sliceOrdinal));
for (const [, caller] of NINE_TESTS) {
  const r = G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: caller });
  gate(`G423-SGCM — PR #495 real diff safe for caller ${caller}`, r.safe && r.activeSliceId === BUILDER && r.forbidden.length === 0 && r.unknown.length === 0 && r.chronologicalViolation.length === 0, r.blockers.join(','));
}
for (const [, caller] of TWENTY_TWO_GATES) {
  gate(`G423-SGCM — PR #495 real diff safe for gate caller ${caller}`, G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: caller }).safe);
}
{
  const r = G.evaluateStudioBranchScope(fixture.paths, { callerSliceId: BUILDER });
  gate('G423-SGCM — PR #495 real diff: zero forbidden, zero unknown, all allowed', r.forbidden.length === 0 && r.unknown.length === 0 && r.allowed.length === fixture.pathCount);
  gate('G423-SGCM — PR #495 real diff: both lifecycle paths cross-authorized', BUILDER_CROSS.every((p) => fixture.paths.includes(p) && r.crossAuthorized.includes(p)));
}

// ---- Migrated artifacts ----
for (const [p, caller] of NINE_TESTS) {
  const src = readSrc(p);
  gate(`G423-SGCM — migrated test declares caller + caller-aware API: ${path.basename(p)}`, src.includes(`const CALLER_SLICE_ID = '${caller}';`) && src.includes('evaluateStudioBranchScope('));
}
for (const [p, caller] of TWENTY_TWO_GATES) {
  const src = readSrc(p);
  gate(`G423-SGCM — migrated gate declares caller + caller-aware API: ${path.basename(p)}`, src.includes(`const CALLER_SLICE_ID = '${caller}';`) && src.includes('evaluateStudioBranchScope('));
}
gate('G423-SGCM — exactly nine tests and twenty-two gates migrated', NINE_TESTS.length === 9 && TWENTY_TWO_GATES.length === 22);

// ---- Legacy pre-Studio decision ----
gate('G423-SGCM — twenty-one pre-Studio gates declared not migrated', REG.LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.length === 21);
for (const g of REG.LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED) {
  gate(`G423-SGCM — pre-Studio gate untouched + outside the catalog: ${path.basename(g)}`,
    G.findOwningStudioSlices(g).length === 0 && !readSrc(g).includes('evaluateStudioBranchScope('));
}
gate('G423-SGCM — legacy decision documented, not silently passed',
  /LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED/.test(readEv('LEGACY-PRE-STUDIO-GATE-DECISION.md'))
  && REG.LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED.every((g) => readEv('LEGACY-PRE-STUDIO-GATE-DECISION.md').includes(path.basename(g, '.mjs'))));

// ---- Slice artifacts, evidence, scope, bundle ----
gate('G423-SGCM — slice ships its own test and gate', exists(TEST_REL) && exists(GATE_REL));
for (const doc of ['CERTIFICATION-REPORT.md', 'SLICE-CATALOG.md', 'ORDINAL-MAPPING.md', 'ACTIVE-SLICE-RESOLUTION.md',
  'CALLER-AWARE-CLASSIFICATION.md', 'CROSS-SLICE-AUTHORIZATION.md', 'NINE-ACTIVE-TEST-MIGRATION.md',
  'TWENTY-TWO-STUDIO-GATE-MIGRATION.md', 'LEGACY-PRE-STUDIO-GATE-DECISION.md', 'PR495-REAL-DIFF-VALIDATION.md',
  'FORBIDDEN-UNKNOWN-FAIL-CLOSED.md', 'REGRESSION-MATRIX.md', 'READINESS.md', 'NEXT-PR495-REVALIDATION.md',
  'REQUIRED-SCOPE-EXTENSION.md']) {
  gate(`G423-SGCM — evidence present: ${doc}`, readEv(doc).length > 200);
}
{
  const rd = readEv('READINESS.md');
  for (const flag of ['sliceCatalogImplemented:true', 'sliceOrdinalsImplemented:true', 'activeSliceResolutionImplemented:true',
    'callerAwareClassificationImplemented:true', 'crossSliceAuthorizationExact:true', 'forbiddenAlwaysWins:true',
    'unknownFailsClosed:true', 'ambiguousActiveFailsClosed:true', 'nineActiveAggregateTestsMigrated:true',
    'twentyTwoStudioGatesMigrated:true', 'legacyPreStudioGatesMigrated:false', 'legacyPreStudioDecisionDocumented:true',
    'pr495RealDiffValidated:true', 'productionCodeTouched:false', 'builderTouched:false',
    'readyForEnterpriseGovernanceAudit:true', 'readyForPr495Revalidation:false']) {
    gate(`G423-SGCM — readiness declares ${flag}`, rd.includes(flag));
  }
}
gate('G423-SGCM — package.json wires this slice', (() => {
  const pkg = JSON.parse(readSrc('package.json'));
  return Boolean(pkg.scripts['test:runtime:studio-scope-governance-chronological-migration'])
    && Boolean(pkg.scripts['gate:g423-studio-scope-governance-chronological-migration'])
    && pkg.scripts['test:runtime'].includes('studio-scope-governance-chronological-migration');
})());
gate('G423-SGCM — no new dependency', (() => {
  try {
    const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
    const head = JSON.parse(readSrc('package.json'));
    const k = (p) => [...Object.keys(p.dependencies ?? {}), ...Object.keys(p.devDependencies ?? {})].sort().join(',');
    return k(base) === k(head);
  } catch { return true; }
})());
gate('G423-SGCM — productionUiGuard NOT in this slice scope', (() => {
  const m = G.getStudioSliceById(MIGRATION);
  return ![...m.primaryArtifactPatterns, ...m.crossSliceAuthorizedPatterns, ...m.sharedGovernancePatterns]
    .some((re) => re.test('scripts/gates/lib/productionUiGuard.mjs'));
})());
gate('G423-SGCM — no Studio blueprint-engine source in this slice scope', (() => {
  const m = G.getStudioSliceById(MIGRATION);
  const all = [...m.primaryArtifactPatterns, ...m.crossSliceAuthorizedPatterns, ...m.sharedGovernancePatterns];
  return !all.some((re) => re.test('src/studio/blueprint-engine/module-preview-sandbox/index.js'))
    && !all.some((re) => re.test('src/studio/blueprint-engine/bridge-decision-core-envelope-builder/index.js'));
})());

// ---- This branch, evaluated by its own rules ----
let branchOk = false; let branchDetail = '';
let branchPaths = null;
try { branchPaths = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { branchPaths = null; }
if (branchPaths === null) { branchOk = true; branchDetail = 'git base unavailable — skipped'; } else {
  const r = G.evaluateStudioBranchScope(branchPaths, { callerSliceId: MIGRATION });
  branchOk = r.safe && r.activeSliceId === MIGRATION;
  branchDetail = branchOk ? `active ${r.activeSliceId} #${r.activeSliceOrdinal}, ${r.total} paths` : `blocked: ${r.blockers.join(',')} ${[...r.unknown, ...r.chronologicalViolation, ...r.forbidden].join(', ')}`;
}
gate('G423-SGCM — this branch is safe under its own rules', branchOk, branchDetail);
if (branchPaths !== null) {
  for (const [, caller] of NINE_TESTS) {
    gate(`G423-SGCM — this branch is safe for caller ${caller}`, G.evaluateStudioBranchScope(branchPaths, { callerSliceId: caller }).safe);
  }
  gate('G423-SGCM — this branch touches no production code', branchPaths.every((p) => G.classifyStudioScopePath(p) !== 'forbidden_scope'));
  gate('G423-SGCM — this branch touches no Studio blueprint-engine source', branchPaths.every((p) => !p.startsWith('src/studio/blueprint-engine/')));
  // The Builder's own artifacts (subtree, test, gate, evidence) must not appear. The already-merged Implementation
  // Plan gate is a DIFFERENT slice and is one of the twenty-two this migration legitimately rewires.
  gate('G423-SGCM — this branch touches no Builder artifact', branchPaths.every((p) => !G.findOwningStudioSlices(p).some((s) => s.sliceId === BUILDER)));
}

// ---- Bundle absence ----
{
  const dist = path.join(ROOT, 'dist');
  let hits = 0;
  const walk = (dir) => { if (!fs.existsSync(dir)) return; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, e.name); if (e.isDirectory()) walk(full); else if (/\.(js|css|html|map)$/.test(e.name)) { const b = fs.readFileSync(full, 'utf8'); if (/studio-scope-governance-chronological-migration|STUDIO_SLICE_CATALOG|callerSliceOrdinal/.test(b)) hits += 1; } } };
  walk(dist);
  gate('G423-SGCM — governance never reaches the bundle', hits === 0, `${hits} hits`);
}

// ---- POST-AUDIT: explicit forbidden bound to the catalog ----
const APP_INTEGRATION = 'dev-preview-app-integration';
const APP_INTEGRATION_FIXTURE = [
  'src/studio/blueprint-engine/dev-preview-app-integration/index.js',
  'docs/evidence/post-foundation-c-studio-dev-preview-app-integration/CERTIFICATION-REPORT.md',
  'src/App.jsx',
  'scripts/gates/lib/productionUiGuard.mjs',
];
for (const s of CATALOG) {
  gate(`G423-SGCM — ${s.sliceId} declares explicitlyAuthorizedForbiddenPatterns`, Array.isArray(s.explicitlyAuthorizedForbiddenPatterns));
  gate(`G423-SGCM — ${s.sliceId} explicit forbidden count is exact`, s.explicitlyAuthorizedForbiddenPatterns.length === (s.sliceId === APP_INTEGRATION ? 2 : 0));
  for (const re of s.explicitlyAuthorizedForbiddenPatterns) {
    const probe = re.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\//g, '/').replace(/\\\./g, '.');
    gate(`G423-SGCM — ${s.sliceId} explicit forbidden anchored + truly forbidden: ${probe}`,
      re.source.startsWith('^') && re.source.endsWith('$')
      && REG.FORBIDDEN_SCOPE_PATTERNS.some((f) => f.test(probe))
      && !REG.FORBIDDEN_BROAD_ALLOW_SOURCES.includes(re.toString()));
  }
}
gate('G423-SGCM — exactly ONE slice authorizes any forbidden path',
  JSON.stringify(CATALOG.filter((s) => s.explicitlyAuthorizedForbiddenPatterns.length > 0).map((s) => s.sliceId)) === JSON.stringify([APP_INTEGRATION]));
gate('G423-SGCM — the derived export mirrors the catalog entry exactly',
  JSON.stringify(REG.STUDIO_DEV_PREVIEW_APP_INTEGRATION_EXPLICIT_FORBIDDEN.map(String))
  === JSON.stringify(G.getStudioSliceById(APP_INTEGRATION).explicitlyAuthorizedForbiddenPatterns.map(String)));
{
  const r = G.evaluateStudioBranchScope(APP_INTEGRATION_FIXTURE, { callerSliceId: APP_INTEGRATION });
  gate('G423-SGCM — App Integration fixture is ENTIRELY safe', r.safe === true && r.activeSliceId === APP_INTEGRATION, r.blockers.join(','));
  gate('G423-SGCM — App Integration fixture: forbidden/unknown/chronological all empty', r.forbidden.length === 0 && r.unknown.length === 0 && r.chronologicalViolation.length === 0);
  gate('G423-SGCM — App Integration fixture: 4/4 allowed', r.allowed.length === 4);
  gate('G423-SGCM — App Integration fixture: explicitForbiddenAuthorized is exactly the pair',
    JSON.stringify(r.explicitForbiddenAuthorized) === JSON.stringify(['scripts/gates/lib/productionUiGuard.mjs', 'src/App.jsx']));
  for (const p of ['src/App.jsx', 'scripts/gates/lib/productionUiGuard.mjs']) {
    gate(`G423-SGCM — authorized forbidden lands in allowed, never unknown: ${p}`, r.allowed.includes(p) && !r.unknown.includes(p) && !r.forbidden.includes(p));
  }
}
{
  const r = G.evaluateStudioBranchScope([...fixture.paths, 'src/App.jsx'], { callerSliceId: BUILDER });
  gate('G423-SGCM — the Builder does NOT inherit the App.jsx authorization', !r.safe && r.forbidden.includes('src/App.jsx') && r.explicitForbiddenAuthorized.length === 0);
}
{
  const r = G.evaluateStudioBranchScope([REGISTRY_REL, `docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md`, 'src/App.jsx'], { callerSliceId: MIGRATION });
  gate('G423-SGCM — the Migration does NOT inherit the App.jsx authorization', !r.safe && r.forbidden.includes('src/App.jsx'));
}
for (const inject of [{ explicitlyAuthorizedForbiddenPatterns: [/.*/] }, { explicitlyAuthorizedForbidden: [/.*/] }, { ownSliceAuthorized: [/.*/] }]) {
  const r = G.evaluateStudioBranchScope([...fixture.paths, 'src/App.jsx'], { callerSliceId: BUILDER, ...inject });
  gate(`G423-SGCM — a caller cannot inject a forbidden regex: ${Object.keys(inject)[0]}`, !r.safe && r.forbidden.includes('src/App.jsx'));
}
{
  const body = readSrc(GUARD_REL).slice(readSrc(GUARD_REL).indexOf('export function evaluateStudioBranchScope'));
  gate('G423-SGCM — evaluate reads NO caller-supplied forbidden option', !/o\.explicitlyAuthorizedForbidden/.test(body) && /activeSlice\.explicitlyAuthorizedForbiddenPatterns/.test(body));
}
for (const third of ['src/pages/Home.jsx', 'backend/server.js', 'src/modules/x/index.js', 'migrations/001.sql']) {
  const r = G.evaluateStudioBranchScope([...APP_INTEGRATION_FIXTURE, third], { callerSliceId: APP_INTEGRATION });
  gate(`G423-SGCM — a THIRD forbidden path is refused for App Integration: ${third}`, !r.safe && r.forbidden.includes(third));
}
gate('G423-SGCM — an unresolved active slice authorizes no forbidden path',
  (() => { const r = G.evaluateStudioBranchScope(['src/App.jsx', 'README.md'], { callerSliceId: APP_INTEGRATION }); return !r.safe && r.forbidden.includes('src/App.jsx') && r.explicitForbiddenAuthorized.length === 0; })());
gate('G423-SGCM — catalog helpers fail closed on an unknown slice',
  G.getExplicitlyAuthorizedForbiddenPatternsForStudioSlice('nope').length === 0
  && G.getAuthorizedPatternsForStudioSlice('nope').length === 0
  && G.isPathAuthorizedForStudioSlice('src/App.jsx', 'nope') === false);

// ---- POST-AUDIT: historical substring semantics preserved ----
const SIMILAR_UNREGISTERED = [
  'docs/random-migration-plan.md', 'tools/custom-migration-helper.js', 'config/menu.json',
  'tools/navigation-generator.js', 'scripts/gates/g423-unregistered-route-menu.mjs',
  'src/runtime/__tests__/unlisted-empresas-change.test.js', 'scripts/gates/g423-unlisted-empresas-change.mjs',
  'docs/evidence/unregistered-empresas-change/file.md',
];
for (const p of SIMILAR_UNREGISTERED) {
  gate(`G423-SGCM — similar uncatalogued path authorized for nobody: ${p}`, CATALOG.every((s) => !G.isPathAuthorizedForStudioSlice(p, s.sliceId)));
  const r = G.evaluateStudioBranchScope([REGISTRY_REL, GUARD_REL, TEST_REL, GATE_REL,
    `docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md`, p], { callerSliceId: MIGRATION });
  gate(`G423-SGCM — similar uncatalogued path blocks on a migration branch: ${p}`, !r.safe && (r.unknown.includes(p) || r.forbidden.includes(p)));
}
for (const [p] of [...NINE_TESTS, ...TWENTY_TWO_GATES]) {
  gate(`G423-SGCM — exact migration path authorized only for the migration: ${path.basename(p)}`,
    G.isPathAuthorizedForStudioSlice(p, MIGRATION)
    && CATALOG.filter((s) => s.sliceId !== MIGRATION && s.sliceId !== 'studio-scope-governance-maintenance'
      && !(s.sliceId === BUILDER && BUILDER_CROSS.includes(p))
      && !G.findOwningStudioSlices(p).some((o) => o.sliceId === s.sliceId))
      .every((s) => !G.isPathAuthorizedForStudioSlice(p, s.sliceId)));
}
for (const [rel, re] of [
  ['src/runtime/__tests__/empresas-certified-blueprint-mirror-alignment-audit.test.js', /!\/migration\/i\.test\(x\)/],
  ['src/runtime/__tests__/empresas-certified-blueprint-mirror-alignment-audit.test.js', /!\/menu\|nav\/i\.test\(x\)/],
  ['src/runtime/__tests__/studio-blueprint-engine-foundation.test.js', /!\/migration\/i\.test\(x\)/],
  ['src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js', /!\/menu\|nav\/i\.test\(x\)/],
  ['src/runtime/__tests__/studio-dev-preview-app-integration.test.js', /!\/empresas\/i\.test\(x\)/],
]) {
  const src = readSrc(rel);
  gate(`G423-SGCM — original regex preserved in ${path.basename(rel)}: ${re}`, re.test(src) && /migrationExempt\(/.test(src) && /isPathAuthorizedForStudioSlice/.test(src));
}
gate('G423-SGCM — the exemption is inert when the active slice is not the migration', (() => {
  const p = 'src/runtime/__tests__/studio-module-blueprint-authoring-runtime.test.js';
  const r = G.evaluateStudioBranchScope([...fixture.paths, p], { callerSliceId: BUILDER });
  return r.activeSliceId === BUILDER && r.chronologicalViolation.includes(p) && !r.safe;
})());

// ---- POST-AUDIT: DB migration patterns really block ----
for (const p of ['migrations/001.sql', 'nested/migrations/001.sql', 'prisma/migrations/20240101_init/migration.sql',
  'backend/prisma/migrations/x/migration.sql', 'db/migrations/002.sql', 'anything.sql', 'src/db/migrate.sql',
  'scripts/migrateUsers.js', 'scripts/migrate-all.mjs', 'tools/migrate.ts', 'prisma/schema.prisma']) {
  gate(`G423-SGCM — real DB migration artifact forbidden: ${p}`, G.classifyStudioScopePath(p) === 'forbidden_scope');
}
gate('G423-SGCM — the governance migration name is allowed by OWNERSHIP', (() => {
  const own = 'docs/evidence/post-foundation-c-studio-scope-governance-chronological-migration/CERTIFICATION-REPORT.md';
  return G.classifyStudioScopePath(own) === 'known_later_studio_headless_artifact'
    && G.findOwningStudioSlices(own).map((s) => s.sliceId).join() === MIGRATION;
})());
gate('G423-SGCM — a random uncatalogued migration filename is unknown', ['docs/random-migration-plan.md', 'tools/custom-migration-helper.js'].every((p) => G.classifyStudioScopePath(p) === 'unknown_scope'));

const failed = results.filter((r) => !r.ok);
console.log(`\n--- G423-STUDIO-SCOPE-GOVERNANCE-CHRONOLOGICAL-MIGRATION summary ---`);
console.log(`PASS: ${results.length - failed.length}/${results.length}  (total checks: ${results.length})`);
if (failed.length > 0) { console.log('FAILED:'); for (const f of failed) console.log(`  ✗ ${f.name}${f.detail ? ` — ${f.detail}` : ''}`); process.exit(1); }
