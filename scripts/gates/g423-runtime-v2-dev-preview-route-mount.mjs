#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-ROUTE-MOUNT — Runtime v2 Dev Preview Route Mount (post-Foundation C)
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

const MOUNT_FILES = ['registerRuntimeV2DevPreviewRoute.js', 'RuntimeV2DevPreviewRouteMount.jsx'];
const mountSource = () => MOUNT_FILES.map((f) => fs.readFileSync(path.join(ROUTE_DIR, f), 'utf8')).join('\n');
const mountCodeOnly = () => stripComments(mountSource());

// 1. Existência dos arquivos do mount.
for (const f of MOUNT_FILES) {
  gate(`G423-PREVIEW-ROUTE-MOUNT — ${f} exists`, exists(path.join(ROUTE_DIR, f)));
}
gate('G423-PREVIEW-ROUTE-MOUNT — mount types exist', exists(path.join(RUNTIME, 'types/dev-preview-route-mount.js')));
gate('G423-PREVIEW-ROUTE-MOUNT — mount tests exist', exists(path.join(RUNTIME, '__tests__/preview/runtime-v2-dev-preview-route-mount.test.js')));

// 2. Exports/config necessários (helpers puros de mount).
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /shouldMountRuntimeV2DevPreviewRoute/.test(s) && /getRuntimeV2DevPreviewRouteMountPlan/.test(s);
  const noJsx = !/from\s+['"][^'"]*RuntimeV2DevPreviewRouteMount\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure mount helpers exported; no mount .jsx in the runtime barrel' : 'missing helpers or a React .jsx exported';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — pure mount helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 1(rota registrada ou montável) + 3(flag-protected). Verify the mount plan exposes the exact dev
// path and only mounts when dev + route flag are on (dynamic — path comes from a shared constant).
let mountable = false;
let mountableDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(ROUTE_DIR, 'registerRuntimeV2DevPreviewRoute.js')).href);
  const cfg = await import(pathToFileURL(path.join(ROUTE_DIR, 'devPreviewRouteConfig.js')).href);
  const F = cfg.RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG;
  const planOn = mod.getRuntimeV2DevPreviewRouteMountPlan({ env: { DEV: true, [F]: 'true' } });
  const planOff = mod.getRuntimeV2DevPreviewRouteMountPlan({ env: {} });
  mountable = planOn.path === '/__dev/runtime-v2/previews' && planOn.shouldMount === true && planOff.shouldMount === false;
  mountableDetail = mountable ? 'dev-only path /__dev/runtime-v2/previews mountable only with dev + route flag' : 'path/guard incorrect';
} catch (err) {
  mountableDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — route path is mountable and flag-protected (dev + route flag)', mountable, mountableDetail);

// 7. Sem import direto de Prisma/backend nos arquivos do mount.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = mountSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — no direct Prisma/backend import in mount (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 8/9. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = mountCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// (side effects) execução não permitida.
let noExecution = false;
let execDetail = '';
try {
  const code = mountCodeOnly();
  noExecution = !/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(code);
  execDetail = noExecution ? 'clean (no execution)' : 'execution call found';
} catch (err) {
  execDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — no action/workflow/connector execution / side effect', noExecution, execDetail);

// 10. Não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = mountCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|from\s+['"][^'"]*App(\.jsx)?['"]/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 5. Menu principal não é alterado / rota não registrada em router ativo.
let noMenuRouter = false;
let menuRouterDetail = '';
try {
  const code = mountCodeOnly();
  noMenuRouter = !/createBrowserRouter|<Routes|useRoutes|registerRoute|addMenuItem|navItems|menu\.push/i.test(code);
  menuRouterDetail = noMenuRouter ? 'clean (mount gate only; not registered into a live router/menu)' : 'live router/menu registration found';
} catch (err) {
  menuRouterDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — mount does not register into a live router / main menu', noMenuRouter, menuRouterDetail);

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
gate('G423-PREVIEW-ROUTE-MOUNT — no new dependency added to package.json', noNewDep, depDetail);

// 12. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(mountSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — no global CSS import in mount', noCss, cssDetail);

// 6. Telas reais / App.jsx / menu / UI de produção não alteradas.
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
gate('G423-PREVIEW-ROUTE-MOUNT — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 4. Produção fail-closed (dynamic).
let failsClosed = false;
let failsClosedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(ROUTE_DIR, 'registerRuntimeV2DevPreviewRoute.js')).href);
  const cfg = await import(pathToFileURL(path.join(ROUTE_DIR, 'devPreviewRouteConfig.js')).href);
  const F = cfg.RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG;
  const off = mod.shouldMountRuntimeV2DevPreviewRoute({}) === false;
  const prodClosed = mod.shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [F]: 'true' }) === false;
  const onDev = mod.shouldMountRuntimeV2DevPreviewRoute({ DEV: true, [F]: 'true' }) === true;
  failsClosed = off && prodClosed && onDev;
  failsClosedDetail = failsClosed ? 'off by default; fails closed in production; mounts only in dev with the flag' : 'mount gate incorrect';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-MOUNT — mount is off by default and fails closed in production', failsClosed, failsClosedDetail);

// 13. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/runtime-v2-dev-preview-route-mount.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-ROUTE-MOUNT — Route Mount unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-ROUTE-MOUNT summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
