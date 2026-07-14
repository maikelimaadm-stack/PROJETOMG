import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  classifyStudioScopePath,
  isKnownLaterStudioHeadlessArtifact,
  filterForbiddenScopePaths,
  filterUnknownScopePaths,
  filterKnownLaterStudioHeadlessArtifacts,
  assertNoForbiddenScopePaths,
  createStudioScopeGovernanceReport,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';
import {
  FORBIDDEN_SCOPE_PATTERNS,
  KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS,
  FORBIDDEN_BROAD_ALLOW_SOURCES,
} from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

const PREVIEW = {
  source: 'src/studio/blueprint-engine/module-preview-sandbox/createStudioModulePreviewSandboxContract.js',
  test: 'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js',
  gate: 'scripts/gates/g423-studio-module-preview-sandbox-contract.mjs',
  evidence: 'docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract/CERTIFICATION-REPORT.md',
};

// ===== Existence (1-2) =====
test('1. registry exists', () => assert.ok(exists('scripts/gates/lib/studioScopeGovernanceRegistry.mjs')));
test('2. helper exists', () => assert.ok(exists('scripts/gates/lib/studioScopeGovernanceGuard.mjs')));

// ===== Preview Sandbox artifacts classified as known later (3-6) =====
test('3. preview source => known_later', () => assert.equal(classifyStudioScopePath(PREVIEW.source), 'known_later_studio_headless_artifact'));
test('4. preview test => known_later', () => assert.equal(classifyStudioScopePath(PREVIEW.test), 'known_later_studio_headless_artifact'));
test('5. preview gate => known_later', () => assert.equal(classifyStudioScopePath(PREVIEW.gate), 'known_later_studio_headless_artifact'));
test('6. preview evidence => known_later', () => assert.equal(classifyStudioScopePath(PREVIEW.evidence), 'known_later_studio_headless_artifact'));

// ===== Forbidden paths (7-15) =====
test('7. src/modules/studio/foo.js forbidden', () => assert.equal(classifyStudioScopePath('src/modules/studio/foo.js'), 'forbidden_scope'));
test('8. src/modules/empresas/foo.js forbidden', () => assert.equal(classifyStudioScopePath('src/modules/empresas/foo.js'), 'forbidden_scope'));
test('9. backend/prisma/schema.prisma forbidden', () => assert.equal(classifyStudioScopePath('backend/prisma/schema.prisma'), 'forbidden_scope'));
test('10. backend/foo.js forbidden', () => assert.equal(classifyStudioScopePath('backend/foo.js'), 'forbidden_scope'));
test('11. src/App.jsx forbidden', () => assert.equal(classifyStudioScopePath('src/App.jsx'), 'forbidden_scope'));
test('12. src/pages/Foo.jsx forbidden', () => assert.equal(classifyStudioScopePath('src/pages/Foo.jsx'), 'forbidden_scope'));
test('13. src/components/Foo.jsx forbidden', () => assert.equal(classifyStudioScopePath('src/components/Foo.jsx'), 'forbidden_scope'));
test('14. migrations/001.sql forbidden', () => assert.equal(classifyStudioScopePath('migrations/001.sql'), 'forbidden_scope'));
test('15. productionUiGuard forbidden unless explicitly authorized', () => {
  assert.equal(classifyStudioScopePath('scripts/gates/lib/productionUiGuard.mjs'), 'forbidden_scope');
  assert.equal(classifyStudioScopePath('scripts/gates/lib/productionUiGuard.mjs', { explicitlyAuthorizedForbidden: [/^scripts\/gates\/lib\/productionUiGuard\.mjs$/] }), 'own_slice_allowed');
});

// ===== Unknown + non-reclassification (16-18) =====
test('16. unknown path fails by default', () => assert.equal(classifyStudioScopePath('src/whatever/random.js'), 'unknown_scope'));
test('17. known later never becomes own_slice_allowed', () => assert.notEqual(classifyStudioScopePath(PREVIEW.source), 'own_slice_allowed'));
test('18. forbidden_scope never tolerated (not in known-later filter)', () => {
  assert.deepEqual(filterKnownLaterStudioHeadlessArtifacts(['src/modules/studio/x.js', 'backend/y.js']), []);
  assert.ok(!isKnownLaterStudioHeadlessArtifact('src/modules/studio/x.js'));
});

// ===== Determinism + report (19-21) =====
test('19. helper is deterministic', () => {
  const p = ['backend/x.js', PREVIEW.source, 'src/random/z.js', 'src/App.jsx'];
  assert.equal(JSON.stringify(createStudioScopeGovernanceReport(p)), JSON.stringify(createStudioScopeGovernanceReport([...p].reverse())));
});
test('20. report is serializable', () => { const r = createStudioScopeGovernanceReport([PREVIEW.source]); assert.equal(typeof JSON.stringify(r), 'string'); });
test('21. report separates knownLater, forbidden, unknown', () => {
  const r = createStudioScopeGovernanceReport(['backend/x.js', PREVIEW.source, 'src/random/z.js']);
  assert.ok(r.forbidden.includes('backend/x.js') && r.knownLater.includes(PREVIEW.source) && r.unknown.includes('src/random/z.js'));
  assert.equal(r.blocked, true);
});

// ===== Branch-relative compatibility does not remove safety (22) =====
test('22. tolerating known-later does not tolerate forbidden alongside', () => {
  const changed = [PREVIEW.source, PREVIEW.test, 'src/modules/empresas/rogue.js'];
  const stillForeign = changed.filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  assert.deepEqual(stillForeign, ['src/modules/empresas/rogue.js']);
  assert.throws(() => assertNoForbiddenScopePaths(changed), /forbidden scope/);
});

// ===== Registry has no dangerous broad allow wildcard (23-26) =====
const knownSources = KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.map((re) => re.source);
test('23. registry has no broad src/studio/ allow', () => assert.ok(!knownSources.some((s) => s === '^src\\/studio\\/' || s === '^src\\/studio\\/.*' || s === '^src\\/studio\\/.+')));
test('24. registry has no broad src/ allow', () => assert.ok(!knownSources.some((s) => /^\^src\\\/(\.\*|\.\+)?\$?$/.test(s) || s === '^src\\/')));
test('25. registry has no broad backend/ allow', () => assert.ok(!knownSources.some((s) => s.includes('backend'))));
test('26. registry has no broad src/modules/ allow', () => assert.ok(!knownSources.some((s) => s.includes('modules'))));
test('26b. no registered forbidden broad-allow source leaks into known-later', () => assert.ok(!knownSources.some((s) => FORBIDDEN_BROAD_ALLOW_SOURCES.map((x) => x.slice(1, -1)).includes(s))));

// ===== Simulated diffs (27-31) =====
const PR462_DIFF = [
  'src/studio/blueprint-engine/module-preview-sandbox/index.js',
  'src/studio/blueprint-engine/module-preview-sandbox/createModulePreviewSandboxSession.js',
  'src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js',
  'scripts/gates/g423-studio-module-preview-sandbox-contract.mjs',
  'docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract/CERTIFICATION-REPORT.md',
  'package.json',
];
test('27. simulated PR #462 diff passes only via known-later/package (no forbidden/unknown)', () => {
  const r = createStudioScopeGovernanceReport(PR462_DIFF);
  assert.equal(r.forbidden.length, 0);
  assert.equal(r.unknown.length, 0);
  assert.equal(r.blocked, false);
  assert.ok(r.knownLater.length >= 4);
});
test('28. PR #462 + backend fails', () => { const r = createStudioScopeGovernanceReport([...PR462_DIFF, 'backend/route.js']); assert.equal(r.blocked, true); assert.ok(r.forbidden.includes('backend/route.js')); });
test('29. PR #462 + src/modules fails', () => { const r = createStudioScopeGovernanceReport([...PR462_DIFF, 'src/modules/novo/index.js']); assert.equal(r.blocked, true); assert.ok(r.forbidden.includes('src/modules/novo/index.js')); });
test('30. PR #462 + App.jsx fails', () => { const r = createStudioScopeGovernanceReport([...PR462_DIFF, 'src/App.jsx']); assert.equal(r.blocked, true); assert.ok(r.forbidden.includes('src/App.jsx')); });
test('31. PR #462 + rogue unknown source fails (dependency/random)', () => { const r = createStudioScopeGovernanceReport([...PR462_DIFF, 'src/rogue/dep.js']); assert.equal(r.blocked, true); assert.ok(r.unknown.includes('src/rogue/dep.js')); });

// ===== Old scope checks still block forbidden (32) =====
test('32. updated old scope-check pattern still blocks forbidden while tolerating known-later', () => {
  // Emulates how an old scope check now computes `outside`.
  const AUTHORIZED = [/^scripts\/gates\/lib\/studioScopeGovernanceRegistry\.mjs$/];
  const changed = [PREVIEW.source, 'src/modules/studio/x.js', 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'];
  const outside = changed
    .filter((f) => !AUTHORIZED.some((re) => re.test(f)))
    .filter((f) => !isKnownLaterStudioHeadlessArtifact(f));
  assert.deepEqual(outside, ['src/modules/studio/x.js']); // forbidden still surfaces
});

// ===== Helper purity / safety (33-35) =====
const helperSrc = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceGuard.mjs'), 'utf8');
const registrySrc = fs.readFileSync(path.join(ROOT, 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs'), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
test('33. helper imports no production code (only the registry)', () => {
  const imports = [...strip(helperSrc).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.deepEqual(imports, ['./studioScopeGovernanceRegistry.mjs']);
  const regImports = [...strip(registrySrc).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.deepEqual(regImports, []);
});
test('34. helper uses no fetch/Prisma/Railway/child_process', () => {
  const code = strip(helperSrc) + strip(registrySrc);
  assert.ok(!/\bfetch\s*\(|PrismaClient|@prisma|railway|child_process|execSync|spawn/i.test(code));
});
test('35. helper performs no mutation/side effect (report flags false)', () => {
  const r = createStudioScopeGovernanceReport([PREVIEW.source]);
  assert.ok(r.sideEffects === false && r.backendAccessed === false && r.prismaAccessed === false && r.fetchUsed === false && r.mutationAllowed === false);
});

// ===== FORBIDDEN registry sanity (36-37) =====
test('36. FORBIDDEN patterns are all RegExp and frozen', () => { assert.ok(Object.isFrozen(FORBIDDEN_SCOPE_PATTERNS)); assert.ok(FORBIDDEN_SCOPE_PATTERNS.every((re) => re instanceof RegExp)); });
test('37. KNOWN_LATER patterns are all RegExp and frozen', () => { assert.ok(Object.isFrozen(KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS)); assert.ok(KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.every((re) => re instanceof RegExp)); });

// ===== Evidence docs (D1-D8) =====
const DOCS = [
  'CERTIFICATION-REPORT.md', 'SCOPE-GOVERNANCE-REPORT.md', 'BRANCH-RELATIVE-SCOPE-ROOT-CAUSE.md',
  'REGISTRY-AND-HELPER.md', 'SECURITY-NON-REGRESSION.md', 'SCALABILITY-NOTES.md',
  'VALIDATION-REPORT.md', 'NEXT-STEPS.md',
];
for (let i = 0; i < DOCS.length; i += 1) {
  test(`D${i + 1}. ${DOCS[i]} exists`, () => assert.ok(exists(`docs/evidence/post-foundation-c-studio-scope-governance-maintenance/${DOCS[i]}`)));
}
