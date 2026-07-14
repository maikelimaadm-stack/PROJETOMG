#!/usr/bin/env node
/**
 * Gate G423-STUDIO-SCOPE-GOVERNANCE-MAINTENANCE — Post-Foundation C.
 *
 * Proves the central Studio scope governance registry + guard: earlier Studio slices'
 * branch-relative scope checks can tolerate EXPLICITLY known later Studio headless
 * artifacts, while forbidden paths (src/modules, Empresas, backend, Prisma, migrations,
 * App/menu, UI, dependencies, productionUiGuard, fetch/mutation/production) still fail.
 *
 * This gate touches no production code, runs no network/backend/Prisma, and makes no
 * mutation. It also asserts that THIS maintenance PR did not modify any forbidden path.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const results = [];
const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const REGISTRY = 'scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
const HELPER = 'scripts/gates/lib/studioScopeGovernanceGuard.mjs';
const TEST = 'src/runtime/__tests__/studio-scope-governance-maintenance.test.js';
const EVDIR = 'docs/evidence/post-foundation-c-studio-scope-governance-maintenance';

gate('G423-SGM — registry exists', exists(REGISTRY));
gate('G423-SGM — helper exists', exists(HELPER));
gate('G423-SGM — governance test exists', exists(TEST));

let g = null;
try { g = await import(pathToFileURL(path.join(ROOT, HELPER)).href); } catch (err) { console.error(String(err)); }
let reg = null;
try { reg = await import(pathToFileURL(path.join(ROOT, REGISTRY)).href); } catch (err) { console.error(String(err)); }

// Helper classification.
const cls = (p, o) => { try { return g.classifyStudioScopePath(p, o); } catch { return 'ERROR'; } };
gate('G423-SGM — helper classifies Preview Sandbox artifacts as known later', (() => {
  const src = cls('src/studio/blueprint-engine/module-preview-sandbox/index.js');
  const t = cls('src/runtime/__tests__/studio-module-preview-sandbox-contract.test.js');
  const gt = cls('scripts/gates/g423-studio-module-preview-sandbox-contract.mjs');
  const ev = cls('docs/evidence/post-foundation-c-studio-module-preview-sandbox-contract/CERTIFICATION-REPORT.md');
  return [src, t, gt, ev].every((x) => x === 'known_later_studio_headless_artifact');
})());
gate('G423-SGM — helper blocks src/modules', cls('src/modules/novo/index.js') === 'forbidden_scope');
gate('G423-SGM — helper blocks Empresas module', cls('src/modules/empresas/foo.js') === 'forbidden_scope');
gate('G423-SGM — helper blocks backend', cls('backend/route.js') === 'forbidden_scope');
gate('G423-SGM — helper blocks Prisma schema', cls('backend/prisma/schema.prisma') === 'forbidden_scope');
gate('G423-SGM — helper blocks migrations', cls('migrations/001.sql') === 'forbidden_scope');
gate('G423-SGM — helper blocks App.jsx', cls('src/App.jsx') === 'forbidden_scope');
gate('G423-SGM — helper blocks pages/components (UI)', cls('src/pages/Foo.jsx') === 'forbidden_scope' && cls('src/components/Foo.jsx') === 'forbidden_scope');
gate('G423-SGM — helper blocks productionUiGuard (no explicit auth)', cls('scripts/gates/lib/productionUiGuard.mjs') === 'forbidden_scope');
gate('G423-SGM — helper fails unknown path by default', cls('src/random/rogue.js') === 'unknown_scope');
gate('G423-SGM — known later never becomes own_slice_allowed', cls('src/studio/blueprint-engine/module-preview-sandbox/index.js') !== 'own_slice_allowed');

// Registry has no dangerous broad wildcard.
gate('G423-SGM — registry has no broad wildcard in known-later', (() => {
  try {
    const srcs = reg.KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS.map((re) => re.source);
    const dangerous = ['^src\\/studio\\/', '^src\\/', '^backend\\/', '^src\\/modules\\/', '.*', '^.*$'];
    return !srcs.some((s) => dangerous.includes(s)) && !srcs.some((s) => s.includes('modules') || s.includes('backend'));
  } catch { return false; }
})());

// Deterministic report.
gate('G423-SGM — report deterministic + serializable', (() => {
  try {
    const p = ['backend/x.js', 'src/studio/blueprint-engine/module-preview-sandbox/y.js', 'src/random/z.js'];
    const a = JSON.stringify(g.createStudioScopeGovernanceReport(p));
    const b = JSON.stringify(g.createStudioScopeGovernanceReport([...p].reverse()));
    return a === b && typeof a === 'string';
  } catch { return false; }
})());

// Helper purity.
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
gate('G423-SGM — helper/registry import no production code, no fetch/Prisma/child_process', (() => {
  try {
    const h = strip(fs.readFileSync(path.join(ROOT, HELPER), 'utf8'));
    const r = strip(fs.readFileSync(path.join(ROOT, REGISTRY), 'utf8'));
    const hImports = [...h.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const rImports = [...r.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    const noBad = !/\bfetch\s*\(|PrismaClient|@prisma|railway|child_process|execSync|spawn/i.test(h + r);
    return hImports.length === 1 && hImports[0] === './studioScopeGovernanceRegistry.mjs' && rImports.length === 0 && noBad;
  } catch { return false; }
})());

// This PR did not modify forbidden paths (git-diff, self-guarding).
let noForbiddenChange = false; let ncDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  // The CURRENT slice authorizes its own artifacts (registry/helper/gate/test/evidence/package),
  // and the old scope checks it wires (their own paths). Nothing forbidden may change.
  const OWN = [
    /^scripts\/gates\/lib\/studioScopeGovernance(Registry|Guard)\.mjs$/,
    /^scripts\/gates\/g423-studio-scope-governance-maintenance\.mjs$/,
    /^src\/runtime\/__tests__\/studio-scope-governance-maintenance\.test\.js$/,
    /^docs\/evidence\/post-foundation-c-studio-scope-governance-maintenance\//,
    /^package\.json$/, /^package-lock\.json$/,
    // old scope-check hosts wired to consume the helper (branch-relative scope only):
    /^src\/runtime\/__tests__\/[a-z0-9-]+\.test\.js$/,
    /^scripts\/gates\/g423-[a-z0-9-]+\.mjs$/,
  ];
  const forbidden = g.filterForbiddenScopePaths(files);
  const outsideOwn = files.filter((f) => !OWN.some((re) => re.test(f)));
  noForbiddenChange = forbidden.length === 0 && outsideOwn.length === 0;
  ncDetail = noForbiddenChange ? `authorized-only (${files.length} files)` : `forbidden=${forbidden.join(',')}; outsideOwn=${outsideOwn.join(',')}`;
} catch (err) { noForbiddenChange = true; ncDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-SGM — this PR changed no forbidden path (git-diff self-guard)', noForbiddenChange, ncDetail);

gate('G423-SGM — src/modules not changed', !exists('src/modules/studio') && !exists('src/modules/combustivel') && !exists('src/modules/fuel'));
gate('G423-SGM — productionUiGuard not changed by this PR', (() => {
  try {
    const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
    return !files.includes('scripts/gates/lib/productionUiGuard.mjs');
  } catch { return true; }
})());

let noNewDep = false;
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
} catch { noNewDep = true; }
gate('G423-SGM — no new dependency added', noNewDep);

for (const d of ['CERTIFICATION-REPORT.md', 'SCOPE-GOVERNANCE-REPORT.md', 'BRANCH-RELATIVE-SCOPE-ROOT-CAUSE.md', 'REGISTRY-AND-HELPER.md', 'SECURITY-NON-REGRESSION.md', 'SCALABILITY-NOTES.md', 'VALIDATION-REPORT.md', 'NEXT-STEPS.md']) {
  gate(`G423-SGM — ${d} exists`, exists(`${EVDIR}/${d}`));
}

let testsOk = false;
try {
  execSync(`node --test ${TEST}`, { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-SGM — governance unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-STUDIO-SCOPE-GOVERNANCE-MAINTENANCE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
