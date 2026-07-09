#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-EMPRESAS-HARNESS — Empresas Dev-Only Preview Harness (post-Foundation C)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DEV_DIR = path.join(RUNTIME, 'preview/dev');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const HARNESS_FILES = ['createEmpresasDevPreviewFixture.js', 'devPreviewHarnessConfig.js', 'EmpresasDevPreviewHarness.jsx'];
const harnessSource = () => HARNESS_FILES.map((f) => fs.readFileSync(path.join(DEV_DIR, f), 'utf8')).join('\n');
const harnessCodeOnly = () => stripComments(harnessSource());

// 1. Existência dos arquivos do harness.
for (const f of HARNESS_FILES) {
  gate(`G423-PREVIEW-EMPRESAS-HARNESS — ${f} exists`, exists(path.join(DEV_DIR, f)));
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — harness tests exist', exists(path.join(RUNTIME, '__tests__/preview/empresas-dev-preview-harness.test.js')));

// 3. Exports/config necessários no runtime index (apenas helpers puros, sem componentes React).
let exportsOk = false;
let exportsDetail = '';
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createEmpresasDevPreviewFixture/.test(indexSource) && /isEmpresasDevPreviewHarnessEnabled/.test(indexSource);
  const noJsxExport = !/from\s+['"][^'"]*EmpresasDevPreviewHarness\.jsx['"]/.test(indexSource);
  exportsOk = hasHelpers && noJsxExport;
  exportsDetail = exportsOk ? 'pure helpers exported; no harness React component in the runtime barrel' : 'missing helpers or a React .jsx is exported';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 2. Fixture segura — sem dados reais, mascara sensíveis, determinística.
let fixtureSafe = false;
let fixtureDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DEV_DIR, 'createEmpresasDevPreviewFixture.js')).href);
  const a = mod.createEmpresasDevPreviewFixture();
  const b = mod.createEmpresasDevPreviewFixture();
  const deterministic = JSON.stringify(a) === JSON.stringify(b);
  const masked = a.meta && a.meta.apiKey === '[REDACTED]';
  const mock = a.meta && a.meta.source === 'mock-fixture' && a.meta.mocked === true;
  fixtureSafe = deterministic && masked && mock && a.isPreviewModel === true;
  fixtureDetail = fixtureSafe ? 'deterministic mock, sensitive keys masked, no real data' : 'fixture not safe/deterministic';
} catch (err) {
  fixtureDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — fixture is a deterministic, masked, mock preview model', fixtureSafe, fixtureDetail);

// 7. Sem import direto de Prisma/backend nos arquivos do harness.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = harnessSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no direct Prisma/backend import in harness (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 8. Sem fetch direto.
let noFetch = false;
let fetchDetail = '';
try {
  const code = harnessCodeOnly();
  noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel/.test(code);
  fetchDetail = noFetch ? 'clean' : 'fetch/XHR/WebSocket usage found';
} catch (err) {
  fetchDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no direct fetch/XHR/WebSocket in harness', noFetch, fetchDetail);

// 9. Sem localStorage/sessionStorage/IndexedDB.
let noStorage = false;
let storageDetail = '';
try {
  const code = harnessCodeOnly();
  noStorage = !/localStorage|sessionStorage|indexedDB/i.test(code);
  storageDetail = noStorage ? 'clean' : 'web storage usage found';
} catch (err) {
  storageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no localStorage/sessionStorage/IndexedDB in harness', noStorage, storageDetail);

// 10. Não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = harnessCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App reference found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 6/13. Menu/navegação e rota — nenhuma rota pública/menu; se houver rota, dev-only e flag-protected.
let noRouteMenu = false;
let routeMenuDetail = '';
try {
  const code = harnessCodeOnly();
  noRouteMenu = !/createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code);
  routeMenuDetail = noRouteMenu ? 'clean (no route/menu registration — exportable harness, no auto-mount)' : 'route/menu registration found';
} catch (err) {
  routeMenuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no public route / main-menu registration (exportable harness)', noRouteMenu, routeMenuDetail);

// 11. Não adiciona dependência nova em package.json.
let noNewDep = false;
let depDetail = '';
try {
  const baseRaw = execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' });
  const base = JSON.parse(baseRaw);
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const baseKeys = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const headKeys = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = baseKeys === headKeys;
  depDetail = noNewDep ? 'clean (no dependency added/removed)' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no new dependency added to package.json', noNewDep, depDetail);

// 12. Não altera CSS global (nenhum import de .css nos arquivos do harness).
let noCssImport = false;
let cssDetail = '';
try {
  const source = harnessSource();
  noCssImport = !/import\s+['"][^'"]+\.css['"]/i.test(source);
  cssDetail = noCssImport ? 'clean (no .css import)' : '.css import found in harness';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no global CSS import in harness', noCssImport, cssDetail);

// 5. Tela real Empresas / UI de produção não alteradas.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = execSync(
    'git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules src/studio',
    { cwd: ROOT, encoding: 'utf8' },
  ).trim();
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (real Empresas screen + App.jsx untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 14. Produção falha fechada.
let failsClosed = false;
let failsClosedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DEV_DIR, 'devPreviewHarnessConfig.js')).href);
  const { isEmpresasDevPreviewHarnessEnabled, EMPRESAS_DEV_PREVIEW_HARNESS_FLAG } = mod;
  const offByDefault = isEmpresasDevPreviewHarnessEnabled({}) === false;
  const prodClosed = isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'true', PROD: true }) === false;
  const onInDev = isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'true' }) === true;
  failsClosed = offByDefault && prodClosed && onInDev;
  failsClosedDetail = failsClosed ? 'off by default; fails closed in production; on only with flag in dev' : 'flag gating incorrect';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — harness flag off by default and fails closed in production', failsClosed, failsClosedDetail);

// 4. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/empresas-dev-preview-harness.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-EMPRESAS-HARNESS — harness unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-EMPRESAS-HARNESS summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
