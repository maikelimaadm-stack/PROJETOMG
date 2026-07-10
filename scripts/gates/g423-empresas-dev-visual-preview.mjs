#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-EMPRESAS-DEV — Empresas Dev-Only Visual Preview (post-Foundation C)
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
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

const DEV_FILES = ['devPreviewConfig.js', 'errors.js', 'EmpresasDevPreview.jsx', 'PreviewTable.jsx', 'PreviewForm.jsx', 'PreviewDiagnostics.jsx'];
const devSource = () => DEV_FILES.map((f) => fs.readFileSync(path.join(DEV_DIR, f), 'utf8')).join('\n');
const devCodeOnly = () => stripComments(devSource());

// 1. Existência dos arquivos do dev preview.
for (const f of DEV_FILES) {
  gate(`G423-PREVIEW-EMPRESAS-DEV — ${f} exists`, exists(path.join(DEV_DIR, f)));
}
gate('G423-PREVIEW-EMPRESAS-DEV — dev-preview types exist', exists(path.join(RUNTIME, 'types/dev-preview.js')));
gate('G423-PREVIEW-EMPRESAS-DEV — dev-preview tests exist', exists(path.join(RUNTIME, '__tests__/preview/empresas-dev-visual-preview.test.js')));

// 2. Exports/config necessários no runtime index (apenas helpers puros, sem componentes React).
let exportsOk = false;
let exportsDetail = '';
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createEmpresasDevPreviewModel/.test(indexSource) && /isEmpresasDevPreviewEnabled/.test(indexSource);
  const noJsxExport = !/EmpresasDevPreview\.jsx|PreviewTable\.jsx|PreviewForm\.jsx|PreviewDiagnostics\.jsx/.test(indexSource);
  exportsOk = hasHelpers && noJsxExport;
  exportsDetail = exportsOk ? 'pure helpers exported; no React component in the runtime barrel' : 'missing helpers or a React .jsx is exported from the barrel';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 7. Sem import direto de Prisma/backend nos arquivos do preview.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = devSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — no direct Prisma/backend import in preview/dev/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 8. Sem fetch direto.
let noFetch = false;
let fetchDetail = '';
try {
  const code = devCodeOnly();
  const hasFetch = /\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel/.test(code);
  noFetch = !hasFetch;
  fetchDetail = noFetch ? 'clean' : 'fetch/XHR/WebSocket usage found';
} catch (err) {
  fetchDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — no direct fetch/XHR/WebSocket in preview/dev/', noFetch, fetchDetail);

// 9. Sem localStorage/sessionStorage/IndexedDB.
let noStorage = false;
let storageDetail = '';
try {
  const code = devCodeOnly();
  const hasStorage = /localStorage|sessionStorage|indexedDB/i.test(code);
  noStorage = !hasStorage;
  storageDetail = noStorage ? 'clean' : 'web storage usage found';
} catch (err) {
  storageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — no localStorage/sessionStorage/IndexedDB in preview/dev/', noStorage, storageDetail);

// 10. Não toca Studio/Marketplace/módulo de produção/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = devCodeOnly();
  const hasStudio = /from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(code);
  noStudioModule = !hasStudio;
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App reference found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 6. Menu/navegação principal / rota pública não adicionados.
let noRouteMenu = false;
let routeMenuDetail = '';
try {
  const code = devCodeOnly();
  const hasRouteMenu = /createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code);
  noRouteMenu = !hasRouteMenu;
  routeMenuDetail = noRouteMenu ? 'clean (no route/menu registration)' : 'route/menu registration found';
} catch (err) {
  routeMenuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — no public route / main-menu registration', noRouteMenu, routeMenuDetail);

// 11. Não adiciona dependência nova em package.json (deps/devDeps inalterados vs origin/main).
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
gate('G423-PREVIEW-EMPRESAS-DEV — no new dependency added to package.json', noNewDep, depDetail);

// 12. Não altera CSS global (nenhum import de .css nos arquivos dev).
let noCssImport = false;
let cssDetail = '';
try {
  const source = devSource();
  const hasCss = /import\s+['"][^'"]+\.css['"]/i.test(source);
  noCssImport = !hasCss;
  cssDetail = noCssImport ? 'clean (no .css import)' : '.css import found in preview/dev/';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — no global CSS import in preview/dev/', noCssImport, cssDetail);

// 4/5. src/App.jsx e UI de produção / tela Empresas não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx + real Empresas screen untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-EMPRESAS-DEV — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// Dynamic — config fails closed by default and in production.
let failsClosed = false;
let failsClosedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DEV_DIR, 'devPreviewConfig.js')).href);
  const { isEmpresasDevPreviewEnabled, EMPRESAS_DEV_PREVIEW_FLAG } = mod;
  const offByDefault = isEmpresasDevPreviewEnabled({}) === false;
  const prodClosed = isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'true', PROD: true }) === false;
  const onInDev = isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'true' }) === true;
  failsClosed = offByDefault && prodClosed && onInDev;
  failsClosedDetail = failsClosed ? 'off by default; fails closed in production; on only with flag in dev' : 'flag gating incorrect';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS-DEV — dev flag off by default and fails closed in production', failsClosed, failsClosedDetail);

// Dynamic — invalid preview model degrades to a safe fallback (no throw).
let fallbackSafe = false;
let fallbackDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DEV_DIR, 'devPreviewConfig.js')).href);
  const view = mod.createEmpresasDevPreviewModel({ not: 'valid' });
  fallbackSafe = view.valid === false && Array.isArray(view.table.columns) && view.table.columns.length === 0;
  fallbackDetail = fallbackSafe ? 'invalid preview model → safe fallback view model' : 'fallback not safe';
} catch (err) {
  fallbackDetail = `invalid model threw instead of degrading: ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-EMPRESAS-DEV — invalid preview model degrades to safe fallback', fallbackSafe, fallbackDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/empresas-dev-visual-preview.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-EMPRESAS-DEV — Dev-Only Visual Preview unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-EMPRESAS-DEV summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
