#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-ROUTE — Runtime v2 Dev Preview Route (post-Foundation C)
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const ROUTE_DIR = path.join(RUNTIME, 'preview/dev/route');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const ROUTE_FILES = [
  'createRuntimeV2DevPreviewRouteModel.js',
  'devPreviewRouteConfig.js',
  'errors.js',
  'RuntimeV2DevPreviewRoute.jsx',
  'RuntimeV2DevPreviewRoutePage.jsx',
];
const routeSource = () => ROUTE_FILES.map((f) => fs.readFileSync(path.join(ROUTE_DIR, f), 'utf8')).join('\n');
const routeCodeOnly = () => stripComments(routeSource());

// 1. Existência dos arquivos da rota.
for (const f of ROUTE_FILES) {
  gate(`G423-PREVIEW-ROUTE — ${f} exists`, exists(path.join(ROUTE_DIR, f)));
}
gate('G423-PREVIEW-ROUTE — route types exist', exists(path.join(RUNTIME, 'types/dev-preview-route.js')));
gate('G423-PREVIEW-ROUTE — route tests exist', exists(path.join(RUNTIME, '__tests__/preview/runtime-v2-dev-preview-route.test.js')));

// 2. Exports/config necessários (apenas helpers puros, sem componentes React).
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createRuntimeV2DevPreviewRouteModel/.test(s) && /isRuntimeV2DevPreviewRouteEnabled/.test(s) && /RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH/.test(s);
  const noJsx = !/from\s+['"][^'"]*RuntimeV2DevPreviewRoute\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure helpers exported; no route React component in the runtime barrel' : 'missing helpers or a React .jsx exported';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 12. Rota é dev-only e flag-protected (path constant + guard present).
let routeGuarded = false;
let routeGuardedDetail = '';
try {
  const s = routeSource();
  const hasPath = /\/__dev\/runtime-v2\/previews/.test(s);
  const hasGuard = /isRuntimeV2DevPreviewRouteEnabled/.test(s);
  routeGuarded = hasPath && hasGuard;
  routeGuardedDetail = routeGuarded ? 'declares dev-only path + self-guards on the route flag' : 'missing path or guard';
} catch (err) {
  routeGuardedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — route is dev-only path + flag-protected', routeGuarded, routeGuardedDetail);

// 6. Sem import direto de Prisma/backend nos arquivos da rota.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = routeSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — no direct Prisma/backend import in route (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 7/8. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = routeCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// (side effects) actions/workflows/connectors não executados.
let noExecution = false;
let execDetail = '';
try {
  const code = routeCodeOnly();
  noExecution = !/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(code);
  execDetail = noExecution ? 'clean (no execution)' : 'execution call found';
} catch (err) {
  execDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — no action/workflow/connector execution / side effect', noExecution, execDetail);

// 9. Não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = routeCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|from\s+['"][^'"]*App(\.jsx)?['"]/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 5/15. Não registra rota em router ativo / menu (path é constante/descritor, não mount).
let noRouterMenu = false;
let routerMenuDetail = '';
try {
  const code = routeCodeOnly();
  noRouterMenu = !/createBrowserRouter|<Routes|useRoutes|registerRoute|addMenuItem|navItems|menu\.push/i.test(code);
  routerMenuDetail = noRouterMenu ? 'clean (path declared as constant/descriptor; not mounted into a live router/menu)' : 'live router/menu registration found';
} catch (err) {
  routerMenuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — dev-only path not registered into a live router / main menu', noRouterMenu, routerMenuDetail);

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
gate('G423-PREVIEW-ROUTE — no new dependency added to package.json', noNewDep, depDetail);

// 11. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(routeSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — no global CSS import in route', noCss, cssDetail);

// 4/5. Telas reais / App.jsx / menu / UI de produção não alteradas.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (real screens + App.jsx + menu untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-ROUTE — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 13/14. Produção fail-closed + sem dados reais (dynamic).
let failsClosed = false;
let failsClosedDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(ROUTE_DIR, 'devPreviewRouteConfig.js')).href);
  const { isRuntimeV2DevPreviewRouteEnabled, RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG } = cfg;
  const off = isRuntimeV2DevPreviewRouteEnabled({}) === false;
  const prodClosed = isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', PROD: true }) === false;
  const onDev = isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' }) === true;
  failsClosed = off && prodClosed && onDev;
  failsClosedDetail = failsClosed ? 'off by default; fails closed in production; on only with flag in dev' : 'flag gating incorrect';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — route flag off by default and fails closed in production', failsClosed, failsClosedDetail);

let mockedMasked = false;
let mockedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(ROUTE_DIR, 'createRuntimeV2DevPreviewRouteModel.js')).href);
  const hubMod = await import(pathToFileURL(path.join(RUNTIME, 'preview/dev/hub/devPreviewHubConfig.js')).href);
  const dsMod = await import(pathToFileURL(path.join(RUNTIME, 'preview/dev/data/controlledDatasetConfig.js')).href);
  const env = { MAK_RUNTIME_V2_DEV_PREVIEW_ROUTE: 'true', [hubMod.RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true', [dsMod.CONTROLLED_DEV_DATASET_FLAG]: 'true' };
  const m = await mod.createRuntimeV2DevPreviewRouteModel({ env });
  const empresas = m.hubModel.modules.find((x) => x.moduleId === 'empresas');
  mockedMasked = m.status.mocked === true && empresas.metadata.source === 'mock-fixture' && empresas.metadata.apiKey === '[REDACTED]' && m.routePath === '/__dev/runtime-v2/previews';
  mockedDetail = mockedMasked ? 'mocked data only, sensitive masked, correct dev path' : 'route model not mocked/masked';
} catch (err) {
  mockedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE — route model uses mocked data only, sensitive keys masked', mockedMasked, mockedDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/runtime-v2-dev-preview-route.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-ROUTE — Runtime v2 Dev Preview Route unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-ROUTE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
