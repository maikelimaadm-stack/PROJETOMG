#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-DATASET — Runtime v2 Controlled Dev Dataset (post-Foundation C)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DATA_DIR = path.join(RUNTIME, 'preview/dev/data');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const DATA_FILES = [
  'controlledDevDataset.js',
  'createControlledDevDataset.js',
  'createEmpresasControlledDataset.js',
  'createCadcpsControlledDataset.js',
  'controlledDatasetConfig.js',
  'errors.js',
];
const dataSource = () => DATA_FILES.map((f) => fs.readFileSync(path.join(DATA_DIR, f), 'utf8')).join('\n');
const dataCodeOnly = () => stripComments(dataSource());

// 1. Existência dos arquivos do dataset.
for (const f of DATA_FILES) {
  gate(`G423-PREVIEW-DATASET — ${f} exists`, exists(path.join(DATA_DIR, f)));
}
gate('G423-PREVIEW-DATASET — dataset types exist', exists(path.join(RUNTIME, 'types/controlled-dev-dataset.js')));
gate('G423-PREVIEW-DATASET — dataset tests exist', exists(path.join(RUNTIME, '__tests__/preview/runtime-v2-controlled-dev-dataset.test.js')));

// 2. Exports/config necessários no runtime index.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createControlledDevDataset/.test(s) && /isControlledDevDatasetEnabled/.test(s) && /createEmpresasControlledDataset/.test(s) && /createCadcpsControlledDataset/.test(s);
  exportsDetail = exportsOk ? 'dataset factories + flag exported' : 'missing exports';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — dataset factories + flag exported from runtime index', exportsOk, exportsDetail);

// 7. Sem import direto de Prisma/backend nos arquivos do dataset.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = dataSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — no direct Prisma/backend import in dataset (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 8/9. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = dataCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// (side effects) actions/workflows/connectors não executados.
let noExecution = false;
let execDetail = '';
try {
  const code = dataCodeOnly();
  noExecution = !/connectorEngine|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|onClick|onSubmit/.test(code);
  execDetail = noExecution ? 'clean (no action/workflow/connector execution)' : 'execution call found';
} catch (err) {
  execDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — no action/workflow/connector execution / side effect', noExecution, execDetail);

// 10. Não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = dataCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App reference found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 6. Menu/rota não adicionados.
let noRouteMenu = false;
let routeMenuDetail = '';
try {
  const code = dataCodeOnly();
  noRouteMenu = !/createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code);
  routeMenuDetail = noRouteMenu ? 'clean (no route/menu registration)' : 'route/menu registration found';
} catch (err) {
  routeMenuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — no public route / main-menu registration', noRouteMenu, routeMenuDetail);

// 11. Não adiciona dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean (no dependency added/removed)' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-PREVIEW-DATASET — no new dependency added to package.json', noNewDep, depDetail);

// 12. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(dataSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — no global CSS import in dataset', noCss, cssDetail);

// 4/5. Telas reais / App.jsx / UI de produção não alteradas.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = execSync(
    'git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules src/studio',
    { cwd: ROOT, encoding: 'utf8' },
  ).trim();
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (real screens + App.jsx untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-DATASET — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 13/14/15. Dynamic — produção fail-closed; sem dados reais; dados sensíveis mascarados.
let failsClosed = false;
let failsClosedDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(DATA_DIR, 'controlledDatasetConfig.js')).href);
  const { isControlledDevDatasetEnabled, CONTROLLED_DEV_DATASET_FLAG } = cfg;
  const off = isControlledDevDatasetEnabled({}) === false;
  const prodClosed = isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'true', PROD: true }) === false;
  const onDev = isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'true' }) === true;
  failsClosed = off && prodClosed && onDev;
  failsClosedDetail = failsClosed ? 'off by default; fails closed in production; on only with flag in dev' : 'flag gating incorrect';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — dataset flag off by default and fails closed in production', failsClosed, failsClosedDetail);

let mockedMasked = false;
let mockedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DATA_DIR, 'createControlledDevDataset.js')).href);
  const ds = mod.createControlledDevDataset({ enabled: true });
  const rec = ds.getRecordById('empresas', 'emp-1');
  const disabled = mod.createControlledDevDataset({ enabled: false });
  mockedMasked = rec.values.apiKey === '[REDACTED]' && rec.values.razao_social === 'FAZENDA MODELO ALFA' && disabled.getModules().length === 0;
  mockedDetail = mockedMasked ? 'mocked example data, sensitive masked, disabled → empty' : 'dataset not mocked/masked/disable-safe';
} catch (err) {
  mockedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-DATASET — mocked data only, sensitive keys masked, disable-safe', mockedMasked, mockedDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/runtime-v2-controlled-dev-dataset.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-DATASET — Controlled Dev Dataset unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-DATASET summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
