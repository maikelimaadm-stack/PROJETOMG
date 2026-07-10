#!/usr/bin/env node
/**
 * Gate G423-SHADOW-EMPRESAS — Empresas Runtime v2 Shadow Pilot (post-Foundation C)
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

const pilotPath = path.join(RUNTIME, 'shadow/pilots/empresasShadowPilot.js');

// 1. Existência dos arquivos do piloto.
gate('G423-SHADOW-EMPRESAS — empresasShadowPilot module exists', exists(pilotPath));
gate('G423-SHADOW-EMPRESAS — pilot errors module exists', exists(path.join(RUNTIME, 'shadow/pilots/errors.js')));
gate('G423-SHADOW-EMPRESAS — pilot types exist', exists(path.join(RUNTIME, 'types/shadow-pilot.js')));
gate('G423-SHADOW-EMPRESAS — pilot tests exist', exists(path.join(RUNTIME, '__tests__/shadow/empresas-shadow-pilot.test.js')));

// 2. Export público no src/runtime/index.js.
let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createEmpresasShadowPilot/.test(indexSource) && /EmpresasShadowPilotError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-SHADOW-EMPRESAS — createEmpresasShadowPilot/EmpresasShadowPilotError exported from runtime index', exportsOk);

// 6. Sem import direto de Prisma/backend em src/runtime/shadow/pilots/.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(pilotPath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS — no direct Prisma/backend import in shadow/pilots/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// Decoupling — runtime must not import the production Empresas UI module.
let noModuleImport = false;
let moduleImportDetail = '';
try {
  const codeOnly = stripComments(fs.readFileSync(pilotPath, 'utf8'));
  const hasModuleImport = /from\s+['"].*\/modules\/.*['"]/i.test(codeOnly) || /App\.jsx/i.test(codeOnly);
  noModuleImport = !hasModuleImport;
  moduleImportDetail = noModuleImport ? 'clean (no runtime→module import, no App.jsx reference)' : 'production module/App import found';
} catch (err) {
  moduleImportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS — no import of production Empresas UI module / App.jsx', noModuleImport, moduleImportDetail);

// 7/8. Sem fetch direto e sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const codeOnly = stripComments(fs.readFileSync(pilotPath, 'utf8'));
  const hasIo = /\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(codeOnly);
  noExternalIo = !hasIo;
  ioDetail = noExternalIo ? 'clean (JSDoc-only mentions excluded)' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 9. Não toca Studio/Marketplace.
let noStudioMarketplace = false;
let studioDetail = '';
try {
  const codeOnly = stripComments(fs.readFileSync(pilotPath, 'utf8'));
  const hasStudio = /from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]/i.test(codeOnly);
  noStudioMarketplace = !hasStudio;
  studioDetail = noStudioMarketplace ? 'clean' : 'Studio/Marketplace import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS — no Studio/Marketplace import in shadow/pilots/', noStudioMarketplace, studioDetail);

// 4/5. Sem alteração visual/UI de produção — App.jsx incluído.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(pilotPath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-SHADOW-EMPRESAS — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// Dynamic behavioral check — default-disabled pilot is a no-op.
let optInSafe = false;
let optInDetail = '';
try {
  const mod = await import(pathToFileURL(pilotPath).href);
  const { createEmpresasShadowPilot } = mod;
  const pilot = createEmpresasShadowPilot({ enabled: false });
  const report = await pilot.run();
  optInSafe = pilot.isEnabled() === false && report.skipped === true && pilot.getDiagnostics().runCount === 0;
  optInDetail = optInSafe ? 'disabled pilot run() is a no-op (skipped, zero diagnostics)' : 'pilot not safely opt-in';
} catch (err) {
  optInDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW-EMPRESAS — disabled pilot has zero effect', optInSafe, optInDetail);

// Dynamic behavioral check — a shadow failure is captured, not thrown.
let failureIsolated = false;
let failureDetail = '';
try {
  const mod = await import(pathToFileURL(pilotPath).href);
  const { createEmpresasShadowPilot } = mod;
  const pilot = createEmpresasShadowPilot({
    enabled: true,
    shadowMode: { compareWithLegacy: () => { throw new Error('boom'); }, runShadowPass: async () => ({}) },
  });
  const report = await pilot.run();
  failureIsolated = report.ok === false && Boolean(report.error) && report.error.message === 'boom';
  failureDetail = failureIsolated ? 'shadow failure captured as data, never thrown' : 'failure not isolated';
} catch (err) {
  failureDetail = `pilot run threw instead of capturing: ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-SHADOW-EMPRESAS — shadow failure captured, never propagated to UI', failureIsolated, failureDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/shadow/empresas-shadow-pilot.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-SHADOW-EMPRESAS — Empresas Shadow Pilot unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-SHADOW-EMPRESAS summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
