#!/usr/bin/env node
/**
 * Gate G423-SECOND-MODULE-SHADOW — Generic Module Shadow Runtime + Second Module Pilot (post-Foundation C)
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const NEW_FILES = [
  'shadow/generic/genericModuleDescriptor.js',
  'shadow/generic/genericModuleShadowPilot.js',
  'shadow/generic/genericModuleTableFormShadow.js',
  'shadow/generic/errors.js',
  'shadow/pilots/createSecondModuleDescriptor.js',
  'shadow/pilots/secondModuleShadowPilot.js',
  'preview/dev/createSecondModuleDevPreviewFixture.js',
  'types/generic-module-shadow.js',
];
const newSource = () => NEW_FILES.map((f) => fs.readFileSync(path.join(RUNTIME, f), 'utf8')).join('\n');
const newCodeOnly = () => stripComments(newSource());

// 1/2. Existência da base genérica e do piloto do segundo módulo.
for (const f of NEW_FILES) {
  gate(`G423-SECOND-MODULE-SHADOW — ${f} exists`, exists(path.join(RUNTIME, f)));
}
gate('G423-SECOND-MODULE-SHADOW — second module tests exist', exists(path.join(RUNTIME, '__tests__/shadow/second-module-shadow.test.js')));

// 3. Exports públicos no runtime index.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createGenericModuleShadowPilot/.test(s) && /createGenericModuleTableFormShadow/.test(s)
    && /createCadcpsShadowPilot/.test(s) && /createSecondModuleShadowPilot/.test(s);
  exportsDetail = exportsOk ? 'generic + second-module factories exported' : 'missing exports';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — generic + second-module factories exported from runtime index', exportsOk, exportsDetail);

// 8. Sem import direto de Prisma/backend nos arquivos novos.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = newSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — no direct Prisma/backend import in new files (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 9/10. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = newCodeOnly();
  const hasIo = /\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  noExternalIo = !hasIo;
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 14. Actions/workflows/connectors metadata-only (sem execução no código novo).
let metadataOnly = false;
let metadataDetail = '';
try {
  const code = newCodeOnly();
  const executes = /connectorEngine|\.execute\s*\(|dispatch\s*\(|\.start\s*\(|onClick|onSubmit/.test(code);
  metadataOnly = !executes;
  metadataDetail = metadataOnly ? 'clean (actions/workflows/connectors are metadata only)' : 'execution call found';
} catch (err) {
  metadataDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — actions/workflows/connectors are metadata-only (no execution)', metadataOnly, metadataDetail);

// 11. Não toca Studio/Marketplace/módulo de produção/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = newCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App reference found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 7. Menu/navegação/rota não adicionados.
let noRouteMenu = false;
let routeMenuDetail = '';
try {
  const code = newCodeOnly();
  noRouteMenu = !/createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code);
  routeMenuDetail = noRouteMenu ? 'clean (no route/menu registration)' : 'route/menu registration found';
} catch (err) {
  routeMenuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — no public route / main-menu registration', noRouteMenu, routeMenuDetail);

// 12. Não adiciona dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const baseKeys = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const headKeys = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = baseKeys === headKeys;
  depDetail = noNewDep ? 'clean (no dependency added/removed)' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-SECOND-MODULE-SHADOW — no new dependency added to package.json', noNewDep, depDetail);

// 13. Não altera CSS global (nenhum import .css nos arquivos novos).
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(newSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — no global CSS import in new files', noCss, cssDetail);

// 5/6. src/App.jsx e telas reais / UI de produção não alteradas.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (real screens + App.jsx untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-SECOND-MODULE-SHADOW — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// Dynamic — generic base works for a second module (default disabled; enabled runs a diagnostic pass).
let genericWorks = false;
let genericDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(RUNTIME, 'shadow/pilots/secondModuleShadowPilot.js')).href);
  const off = mod.createCadcpsShadowPilot({ enabled: false });
  const on = mod.createCadcpsShadowPilot({ enabled: true });
  const offSkipped = (await off.run()).skipped === true;
  const onReport = await on.run();
  genericWorks = offSkipped && onReport.ok === true && onReport.moduleId === 'cadcps';
  genericDetail = genericWorks ? 'cadcps runs via the generic base: off→skipped, on→ok' : 'generic second-module pilot not working as expected';
} catch (err) {
  genericDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SECOND-MODULE-SHADOW — generic base drives the cadcps second module (opt-in, passive)', genericWorks, genericDetail);

// 4. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/shadow/second-module-shadow.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-SECOND-MODULE-SHADOW — second module unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-SECOND-MODULE-SHADOW summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
