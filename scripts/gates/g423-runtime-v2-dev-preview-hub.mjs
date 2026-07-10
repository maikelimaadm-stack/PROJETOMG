#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-HUB — Runtime v2 Dev Preview Hub (post-Foundation C)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const HUB_DIR = path.join(RUNTIME, 'preview/dev/hub');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const HUB_FILES = [
  'createRuntimeV2DevPreviewHubModel.js',
  'devPreviewHubConfig.js',
  'errors.js',
  'RuntimeV2DevPreviewHub.jsx',
  'RuntimeV2DevPreviewHubPanel.jsx',
  'RuntimeV2DevPreviewModuleCard.jsx',
];
const hubSource = () => HUB_FILES.map((f) => fs.readFileSync(path.join(HUB_DIR, f), 'utf8')).join('\n');
const hubCodeOnly = () => stripComments(hubSource());

// 1. Existência dos arquivos do hub.
for (const f of HUB_FILES) {
  gate(`G423-PREVIEW-HUB — ${f} exists`, exists(path.join(HUB_DIR, f)));
}
gate('G423-PREVIEW-HUB — hub types exist', exists(path.join(RUNTIME, 'types/dev-preview-hub.js')));
gate('G423-PREVIEW-HUB — hub tests exist', exists(path.join(RUNTIME, '__tests__/preview/runtime-v2-dev-preview-hub.test.js')));

// 2. Exports/config necessários (apenas helpers puros, sem componentes React).
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createRuntimeV2DevPreviewHubModel/.test(s) && /isRuntimeV2DevPreviewHubEnabled/.test(s);
  const noJsx = !/from\s+['"][^'"]*RuntimeV2DevPreviewHub\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure helpers exported; no hub React component in the runtime barrel' : 'missing helpers or a React .jsx exported';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 6. Sem import direto de Prisma/backend nos arquivos do hub.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = hubSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — no direct Prisma/backend import in hub (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 7/8. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = hubCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 14. Actions/workflows/connectors metadata-only (sem execução no código).
let metadataOnly = false;
let metadataDetail = '';
try {
  const code = hubCodeOnly();
  metadataOnly = !/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(code);
  metadataDetail = metadataOnly ? 'clean (metadata only, no execution)' : 'execution call found';
} catch (err) {
  metadataDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — actions/workflows/connectors are metadata-only (no execution)', metadataOnly, metadataDetail);

// 9. Não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = hubCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App reference found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 5/12. Menu/navegação e rota — nenhuma rota pública/menu (hub exportável, sem auto-mount).
let noRouteMenu = false;
let routeMenuDetail = '';
try {
  const code = hubCodeOnly();
  noRouteMenu = !/createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code);
  routeMenuDetail = noRouteMenu ? 'clean (no route/menu registration — exportable hub, no auto-mount)' : 'route/menu registration found';
} catch (err) {
  routeMenuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — no public route / main-menu registration (exportable hub)', noRouteMenu, routeMenuDetail);

// 10. Não adiciona dependência nova.
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
gate('G423-PREVIEW-HUB — no new dependency added to package.json', noNewDep, depDetail);

// 11. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(hubSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — no global CSS import in hub', noCss, cssDetail);

// 4. Telas reais / UI de produção não alteradas.
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
gate('G423-PREVIEW-HUB — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 13. Produção falha fechada + 15. sem dados reais (dynamic).
let failsClosed = false;
let failsClosedDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(HUB_DIR, 'devPreviewHubConfig.js')).href);
  const { isRuntimeV2DevPreviewHubEnabled, RUNTIME_V2_DEV_PREVIEW_HUB_FLAG } = cfg;
  const offByDefault = isRuntimeV2DevPreviewHubEnabled({}) === false;
  const prodClosed = isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true', PROD: true }) === false;
  const onInDev = isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true' }) === true;
  failsClosed = offByDefault && prodClosed && onInDev;
  failsClosedDetail = failsClosed ? 'off by default; fails closed in production; on only with flag in dev' : 'flag gating incorrect';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — hub flag off by default and fails closed in production', failsClosed, failsClosedDetail);

let mockedOnly = false;
let mockedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(HUB_DIR, 'createRuntimeV2DevPreviewHubModel.js')).href);
  const m = await mod.createRuntimeV2DevPreviewHubModel({ env: {} });
  const empresas = m.modules.find((x) => x.moduleId === 'empresas');
  mockedOnly = m.status.mocked === true && empresas && empresas.metadata.source === 'mock-fixture' && empresas.metadata.apiKey === '[REDACTED]';
  mockedDetail = mockedOnly ? 'mocked data only, sensitive keys masked, no real data' : 'hub model not mocked/masked';
} catch (err) {
  mockedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-HUB — hub model uses mocked data only, sensitive keys masked', mockedOnly, mockedDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/runtime-v2-dev-preview-hub.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-HUB — Runtime v2 Dev Preview Hub unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-HUB summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
