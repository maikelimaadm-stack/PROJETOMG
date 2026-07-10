#!/usr/bin/env node
/**
 * Gate G423-23 — M23 Transaction Engine (Foundation C.16)
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

const transactionEnginePath = path.join(RUNTIME, 'infra/transaction/transactionEngine.js');

gate('G423-23 — TransactionEngine module exists', exists(transactionEnginePath));
gate('G423-23 — TransactionError module exists', exists(path.join(RUNTIME, 'infra/transaction/errors.js')));
gate('G423-23 — Transaction types exist', exists(path.join(RUNTIME, 'types/transaction.js')));
gate('G423-23 — Transaction tests exist', exists(path.join(RUNTIME, '__tests__/transaction/transaction.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createTransactionEngine/.test(indexSource) && /TransactionError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-23 — createTransactionEngine/TransactionError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(transactionEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-23 — no direct Prisma/backend import in infra/transaction/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noWebStorage = false;
let webStorageDetail = '';
try {
  const source = fs.readFileSync(transactionEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  const hasStorage = /localStorage|sessionStorage|indexedDB/i.test(codeOnly);
  noWebStorage = !hasStorage;
  webStorageDetail = noWebStorage ? 'clean (JSDoc-only mentions excluded)' : 'localStorage/sessionStorage/IndexedDB usage found';
} catch (err) {
  webStorageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-23 — no localStorage/sessionStorage/IndexedDB in infra/transaction/', noWebStorage, webStorageDetail);

let noExternalTransport = false;
let transportDetail = '';
try {
  const source = fs.readFileSync(transactionEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  const hasTransport = /WebSocket|BroadcastChannel|new\s+Worker\s*\(|worker_threads/.test(codeOnly);
  noExternalTransport = !hasTransport;
  transportDetail = noExternalTransport ? 'clean (JSDoc-only mentions excluded)' : 'WebSocket/BroadcastChannel/worker usage found';
} catch (err) {
  transportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-23 — no WebSocket/BroadcastChannel/worker/thread in infra/transaction/', noExternalTransport, transportDetail);

let noObservabilityEngine = false;
let obsDetail = '';
try {
  // M24 Observability Engine legitimately exists as of C.17 — scoped to "transactionEngine.js itself
  // never references it" (permanently valid), not "observabilityEngine.js must not exist" (that was
  // only a scope-creep guard valid during C.16's own authoring).
  const source = fs.readFileSync(transactionEnginePath, 'utf8');
  const hasReference = /observabilityEngine|ObservabilityEngine/.test(source);
  noObservabilityEngine = !hasReference;
  obsDetail = hasReference ? 'ObservabilityEngine reference found' : 'clean';
} catch (err) {
  obsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-23 — transactionEngine.js does not reference Observability Engine directly', noObservabilityEngine, obsDetail);

let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(transactionEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-23 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let unknownTxFailsClosed = false;
let unknownTxDetail = '';
try {
  const mod = await import(pathToFileURL(transactionEnginePath).href);
  const { createTransactionEngine } = mod;
  const engine = createTransactionEngine();
  try {
    await engine.commit('unknown-tx-xyz');
    unknownTxFailsClosed = false;
    unknownTxDetail = 'commit() on unknown transaction did not throw — silent pass risk';
  } catch (err) {
    unknownTxFailsClosed = err && err.code === 'MAK-L3-TRANSACTION-004';
    unknownTxDetail = unknownTxFailsClosed ? 'unknown transaction throws TransactionError as expected' : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  unknownTxDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-23 — commit() on unknown transaction never silently succeeds', unknownTxFailsClosed, unknownTxDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/transaction/transaction.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-23 — Transaction Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-23 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
