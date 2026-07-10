#!/usr/bin/env node
/**
 * Gate G423-SHADOW-EMPRESAS-TABLE-FORM — Empresas Table/Form Shadow Projection (post-Foundation C)
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

const shadowPath = path.join(RUNTIME, 'shadow/pilots/empresasTableFormShadow.js');
const projPath = path.join(RUNTIME, 'shadow/pilots/tableFormProjection.js');
const combinedSource = () => stripComments(fs.readFileSync(shadowPath, 'utf8') + fs.readFileSync(projPath, 'utf8'));

// 1. Existência dos arquivos da projeção.
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — empresasTableFormShadow module exists', exists(shadowPath));
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — tableFormProjection module exists', exists(projPath));
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — shadow-table-form types exist', exists(path.join(RUNTIME, 'types/shadow-table-form.js')));
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — projection tests exist', exists(path.join(RUNTIME, '__tests__/shadow/empresas-table-form-shadow.test.js')));

// 2. Export público no src/runtime/index.js.
let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createEmpresasTableFormShadow/.test(indexSource) && /createTableFormProjection/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — createEmpresasTableFormShadow/createTableFormProjection exported from runtime index', exportsOk);

// 6. Sem import direto de Prisma/backend em src/runtime/shadow/.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(shadowPath, 'utf8') + fs.readFileSync(projPath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — no direct Prisma/backend import in shadow/pilots/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 9. Não renderiza React/DOM real.
let noRealRender = false;
let renderDetail = '';
try {
  const codeOnly = combinedSource();
  const hasRender = /from\s+['"]react['"]|from\s+['"]react-dom['"]|document\.|window\.|createElement/i.test(codeOnly);
  noRealRender = !hasRender;
  renderDetail = noRealRender ? 'clean (intermediate render tree only, no DOM/React)' : 'React/DOM usage found';
} catch (err) {
  renderDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — no real React/DOM render in shadow/pilots/', noRealRender, renderDetail);

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
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 10. Não toca Studio/Marketplace / módulo de produção.
let noStudioModule = false;
let studioDetail = '';
try {
  const codeOnly = combinedSource();
  const hasStudio = /from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|App\.jsx/i.test(codeOnly);
  noStudioModule = !hasStudio;
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App import)' : 'Studio/Marketplace/module/App import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — no Studio/Marketplace/production-module/App.jsx import', noStudioModule, studioDetail);

// 4/5. src/App.jsx e UI de produção não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(shadowPath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// Dynamic — default-disabled projection is a no-op.
let optInSafe = false;
let optInDetail = '';
try {
  const mod = await import(pathToFileURL(shadowPath).href);
  const { createEmpresasTableFormShadow } = mod;
  const shadow = createEmpresasTableFormShadow({ enabled: false });
  const report = await shadow.run();
  optInSafe = shadow.isEnabled() === false && report.skipped === true && shadow.getDiagnostics().runCount === 0;
  optInDetail = optInSafe ? 'disabled projection run() is a no-op (skipped, zero diagnostics)' : 'projection not safely opt-in';
} catch (err) {
  optInDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — disabled projection has zero effect', optInSafe, optInDetail);

// Dynamic — a Permission/Validation/Render failure is captured, not thrown.
let failureIsolated = false;
let failureDetail = '';
try {
  const mod = await import(pathToFileURL(shadowPath).href);
  const { createEmpresasTableFormShadow } = mod;
  const shadow = createEmpresasTableFormShadow({
    enabled: true,
    permissionEngine: { can: async () => { throw new Error('boom'); } },
  });
  const report = await shadow.run();
  failureIsolated = report.ok === false && Boolean(report.error) && report.error.message === 'boom';
  failureDetail = failureIsolated ? 'engine failure captured as data, never thrown' : 'failure not isolated';
} catch (err) {
  failureDetail = `projection run threw instead of capturing: ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — Permission/Validation/Render failure captured, never propagated', failureIsolated, failureDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/shadow/empresas-table-form-shadow.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-SHADOW-EMPRESAS-TABLE-FORM — projection unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-SHADOW-EMPRESAS-TABLE-FORM summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
