#!/usr/bin/env node
/**
 * Gate G423-21 — M21 Cache Engine (Foundation C.15)
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

const cacheEnginePath = path.join(RUNTIME, 'infra/cache/cacheEngine.js');

gate('G423-21 — CacheEngine module exists', exists(cacheEnginePath));
gate('G423-21 — CacheError module exists', exists(path.join(RUNTIME, 'infra/cache/errors.js')));
gate('G423-21 — Cache types exist', exists(path.join(RUNTIME, 'types/cache.js')));
gate('G423-21 — Cache tests exist', exists(path.join(RUNTIME, '__tests__/cache/cache.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createCacheEngine/.test(indexSource) && /CacheError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-21 — createCacheEngine/CacheError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(cacheEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-21 — no direct Prisma/backend import in infra/cache/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noWebStorage = false;
let webStorageDetail = '';
try {
  const source = fs.readFileSync(cacheEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  const hasStorage = /localStorage|sessionStorage|indexedDB/i.test(codeOnly);
  noWebStorage = !hasStorage;
  webStorageDetail = noWebStorage ? 'clean (JSDoc-only mentions excluded)' : 'localStorage/sessionStorage/IndexedDB usage found';
} catch (err) {
  webStorageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-21 — no localStorage/sessionStorage/IndexedDB in infra/cache/', noWebStorage, webStorageDetail);

let noTransactionEngine = false;
let txDetail = '';
try {
  const source = fs.readFileSync(cacheEnginePath, 'utf8');
  const hasDir = exists(path.join(RUNTIME, 'core/transaction'));
  const hasReference = /transactionEngine|TransactionEngine|TransactionManager/.test(source);
  noTransactionEngine = !hasDir && !hasReference;
  txDetail = hasDir ? 'core/transaction directory exists' : hasReference ? 'TransactionEngine/Manager reference found' : 'clean';
} catch (err) {
  txDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-21 — no Transaction Engine created', noTransactionEngine, txDetail);

let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(cacheEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-21 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let limitEnforced = false;
let limitDetail = '';
try {
  const mod = await import(pathToFileURL(cacheEnginePath).href);
  const { createCacheEngine } = mod;
  const engine = createCacheEngine();
  try {
    await engine.set('__proto__', { polluted: true });
    limitEnforced = false;
    limitDetail = 'prototype-pollution key was accepted — silent risk';
  } catch (err) {
    limitEnforced = err && err.code === 'MAK-L3-CACHE-002';
    limitDetail = limitEnforced ? 'forbidden key rejected as expected' : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  limitDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-21 — prototype-pollution key never silently accepted', limitEnforced, limitDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/cache/cache.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-21 — Cache Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-21 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
