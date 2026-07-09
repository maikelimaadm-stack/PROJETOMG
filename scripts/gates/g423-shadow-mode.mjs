#!/usr/bin/env node
/**
 * Gate G423-SHADOW — Runtime v2 Shadow Mode (post-Foundation C)
 */
import { execSync } from 'node:child_process';
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

const shadowPath = path.join(RUNTIME, 'shadow/runtimeShadowMode.js');

// 1. Existência dos arquivos de shadow mode.
gate('G423-SHADOW — runtimeShadowMode module exists', exists(shadowPath));
gate('G423-SHADOW — shadow errors module exists', exists(path.join(RUNTIME, 'shadow/errors.js')));
gate('G423-SHADOW — shadow types exist', exists(path.join(RUNTIME, 'types/shadow.js')));
gate('G423-SHADOW — shadow tests exist', exists(path.join(RUNTIME, '__tests__/shadow/runtime-shadow.test.js')));

// 2. Export público no src/runtime/index.js.
let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createRuntimeShadowMode/.test(indexSource) && /RuntimeShadowModeError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-SHADOW — createRuntimeShadowMode/RuntimeShadowModeError exported from runtime index', exportsOk);

// 5. Sem import direto de Prisma/backend em src/runtime/shadow/ (D-RI-13).
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(shadowPath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW — no direct Prisma/backend import in src/runtime/shadow/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 6. Sem localStorage/sessionStorage/IndexedDB.
let noWebStorage = false;
let webStorageDetail = '';
try {
  const codeOnly = stripComments(fs.readFileSync(shadowPath, 'utf8'));
  const hasStorage = /localStorage|sessionStorage|indexedDB/i.test(codeOnly);
  noWebStorage = !hasStorage;
  webStorageDetail = noWebStorage ? 'clean (JSDoc-only mentions excluded)' : 'web storage usage found';
} catch (err) {
  webStorageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW — no localStorage/sessionStorage/IndexedDB in src/runtime/shadow/', noWebStorage, webStorageDetail);

// 7. Sem fetch direto / transporte externo.
let noExternalTransport = false;
let transportDetail = '';
try {
  const codeOnly = stripComments(fs.readFileSync(shadowPath, 'utf8'));
  const hasTransport = /\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|new\s+Worker\s*\(/.test(codeOnly);
  noExternalTransport = !hasTransport;
  transportDetail = noExternalTransport ? 'clean (JSDoc-only mentions excluded)' : 'fetch/XHR/WebSocket/worker usage found';
} catch (err) {
  transportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW — no direct fetch/XHR/WebSocket/worker in src/runtime/shadow/', noExternalTransport, transportDetail);

// 8. Não toca Studio/Marketplace (sem referência no código-fonte).
let noStudioMarketplace = false;
let studioDetail = '';
try {
  const codeOnly = stripComments(fs.readFileSync(shadowPath, 'utf8'));
  const hasStudio = /from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]/i.test(codeOnly);
  noStudioMarketplace = !hasStudio;
  studioDetail = noStudioMarketplace ? 'clean' : 'Studio/Marketplace import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW — no Studio/Marketplace import in src/runtime/shadow/', noStudioMarketplace, studioDetail);

// 4. Sem alteração em UI de produção.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = execSync(
    'git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules src/studio',
    { cwd: ROOT, encoding: 'utf8' },
  ).trim();
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
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
gate('G423-SHADOW — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// Dynamic behavioral check — disabled by default (opt-in), pass short-circuits to skipped.
let optInSafe = false;
let optInDetail = '';
try {
  const mod = await import(pathToFileURL(shadowPath).href);
  const { createRuntimeShadowMode } = mod;
  const shadow = createRuntimeShadowMode();
  const result = await shadow.runShadowPass({ moduleId: 'empresas' });
  optInSafe = shadow.isEnabled() === false && result.skipped === true;
  optInDetail = optInSafe ? 'default-disabled pass short-circuits to skipped' : 'shadow mode not safely opt-in by default';
} catch (err) {
  optInDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-SHADOW — default-disabled (opt-in) shadow pass never runs', optInSafe, optInDetail);

// Dynamic behavioral check — a runtime v2 failure is captured, not thrown.
let failureIsolated = false;
let failureDetail = '';
try {
  const mod = await import(pathToFileURL(shadowPath).href);
  const { createRuntimeShadowMode } = mod;
  const shadow = createRuntimeShadowMode({ enabled: true, loadRuntime: () => { throw new Error('boom'); } });
  const result = await shadow.runShadowPass({});
  failureIsolated = result.success === false && Boolean(result.error) && result.error.message === 'boom';
  failureDetail = failureIsolated ? 'runtime v2 failure captured as data, never thrown' : 'failure not isolated';
} catch (err) {
  failureDetail = `shadow pass threw instead of capturing: ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-SHADOW — runtime v2 failure is captured, never propagated', failureIsolated, failureDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/shadow/runtime-shadow.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-SHADOW — Shadow Mode unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-SHADOW summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
