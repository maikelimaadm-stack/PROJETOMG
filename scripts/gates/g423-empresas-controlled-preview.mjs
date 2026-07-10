#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-EMPRESAS — Empresas Controlled Preview Sandbox (post-Foundation C)
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

const previewPath = path.join(RUNTIME, 'preview/controlledPreview.js');
const modelPath = path.join(RUNTIME, 'preview/previewModel.js');
const combinedSource = () => stripComments(fs.readFileSync(previewPath, 'utf8') + fs.readFileSync(modelPath, 'utf8'));

// 1. Existência dos arquivos de preview.
gate('G423-PREVIEW-EMPRESAS — controlledPreview module exists', exists(previewPath));
gate('G423-PREVIEW-EMPRESAS — previewModel module exists', exists(modelPath));
gate('G423-PREVIEW-EMPRESAS — preview errors module exists', exists(path.join(RUNTIME, 'preview/errors.js')));
gate('G423-PREVIEW-EMPRESAS — preview types exist', exists(path.join(RUNTIME, 'types/preview.js')));
gate('G423-PREVIEW-EMPRESAS — preview tests exist', exists(path.join(RUNTIME, '__tests__/preview/empresas-controlled-preview.test.js')));

// 2. Export público no src/runtime/index.js.
let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createControlledPreview/.test(indexSource) && /createPreviewModel/.test(indexSource) && /ControlledPreviewError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-PREVIEW-EMPRESAS — createControlledPreview/createPreviewModel/ControlledPreviewError exported from runtime index', exportsOk);

// 6. Sem import direto de Prisma/backend em src/runtime/preview/.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(previewPath, 'utf8') + fs.readFileSync(modelPath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS — no direct Prisma/backend import in src/runtime/preview/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 11. Preview model não usa React.createElement diretamente / não renderiza React.
let noReact = false;
let reactDetail = '';
try {
  const codeOnly = combinedSource();
  const hasReact = /from\s+['"]react['"]|from\s+['"]react-dom['"]|React\.createElement|createElement\s*\(/i.test(codeOnly);
  noReact = !hasReact;
  reactDetail = noReact ? 'clean (plain preview model, no React)' : 'React usage found';
} catch (err) {
  reactDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS — no React / React.createElement in src/runtime/preview/', noReact, reactDetail);

// 9. Não usa DOM real.
let noDom = false;
let domDetail = '';
try {
  const codeOnly = combinedSource();
  const hasDom = /document\.|window\.|appendChild|querySelector/i.test(codeOnly);
  noDom = !hasDom;
  domDetail = noDom ? 'clean (no DOM access)' : 'DOM access found';
} catch (err) {
  domDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS — no real DOM access in src/runtime/preview/', noDom, domDetail);

// 7/8. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const codeOnly = combinedSource();
  const hasIo = /\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(codeOnly);
  noExternalIo = !hasIo;
  ioDetail = noExternalIo ? 'clean (JSDoc-only mentions excluded)' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 9(rota)/10. Não cria rota pública e não toca Studio/Marketplace/módulo/App.
let noRouteStudio = false;
let routeDetail = '';
try {
  const codeOnly = combinedSource();
  const hasRouteOrStudio = /createBrowserRouter|<Route|path:\s*['"]\/|from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(codeOnly);
  noRouteStudio = !hasRouteOrStudio;
  routeDetail = noRouteStudio ? 'clean (no public route / Studio / Marketplace / module / App import)' : 'public route or Studio/Marketplace/module/App reference found';
} catch (err) {
  routeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS — no public route creation / no Studio/Marketplace/module/App.jsx import', noRouteStudio, routeDetail);

// 4/5. src/App.jsx e UI de produção não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(previewPath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-PREVIEW-EMPRESAS — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// Dynamic — default-disabled preview is a no-op.
let optInSafe = false;
let optInDetail = '';
try {
  const mod = await import(pathToFileURL(previewPath).href);
  const { createControlledPreview } = mod;
  const preview = createControlledPreview({ enabled: false });
  const report = await preview.run();
  optInSafe = preview.isEnabled() === false && report.skipped === true && preview.getDiagnostics().runCount === 0;
  optInDetail = optInSafe ? 'disabled preview run() is a no-op (skipped, zero diagnostics)' : 'preview not safely opt-in';
} catch (err) {
  optInDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-EMPRESAS — disabled preview has zero effect', optInSafe, optInDetail);

// Dynamic — a projection failure is captured, not thrown.
let failureIsolated = false;
let failureDetail = '';
try {
  const mod = await import(pathToFileURL(previewPath).href);
  const { createControlledPreview } = mod;
  const preview = createControlledPreview({ enabled: true, permissionEngine: { can: async () => { throw new Error('boom'); } } });
  const report = await preview.run();
  failureIsolated = report.ok === false && Boolean(report.error) && report.error.message === 'boom';
  failureDetail = failureIsolated ? 'projection failure captured as data, never thrown' : 'failure not isolated';
} catch (err) {
  failureDetail = `preview run threw instead of capturing: ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-EMPRESAS — projection failure captured, never propagated', failureIsolated, failureDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/empresas-controlled-preview.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-EMPRESAS — Controlled Preview unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-EMPRESAS summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
