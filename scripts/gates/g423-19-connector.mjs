#!/usr/bin/env node
/**
 * Gate G423-19 — M19 Connector Engine (Foundation C.14)
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

const connectorEnginePath = path.join(RUNTIME, 'core/connector/connectorEngine.js');

gate('G423-19 — ConnectorEngine module exists', exists(connectorEnginePath));
gate('G423-19 — ConnectorError module exists', exists(path.join(RUNTIME, 'core/connector/errors.js')));
gate('G423-19 — Connector types exist', exists(path.join(RUNTIME, 'types/connector.js')));
gate('G423-19 — Connector tests exist', exists(path.join(RUNTIME, '__tests__/connector/connector.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createConnectorEngine/.test(indexSource) && /ConnectorError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-19 — createConnectorEngine/ConnectorError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no direct Prisma/backend import in core/connector/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noEval = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  noEval = !/\beval\s*\(/.test(source);
  evalDetail = noEval ? 'clean' : 'eval() found';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no eval() in core/connector/', noEval, evalDetail);

let noNewFunction = false;
let newFunctionDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  noNewFunction = !/new\s+Function\s*\(/.test(source);
  newFunctionDetail = noNewFunction ? 'clean' : 'new Function() found';
} catch (err) {
  newFunctionDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no new Function() in core/connector/', noNewFunction, newFunctionDetail);

let noDynamicImport = false;
let dynamicImportDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  noDynamicImport = !/\bimport\s*\(/.test(codeOnly);
  dynamicImportDetail = noDynamicImport ? 'clean (JSDoc-only import() type references excluded)' : 'dynamic import() found in executable code';
} catch (err) {
  dynamicImportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no unsafe dynamic import() in core/connector/', noDynamicImport, dynamicImportDetail);

let noFetch = false;
let fetchDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  noFetch = !/\bfetch\s*\(/.test(codeOnly);
  fetchDetail = noFetch ? 'clean (JSDoc-only fetch() mentions excluded)' : 'direct fetch() call found';
} catch (err) {
  fetchDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no direct fetch() in core/connector/', noFetch, fetchDetail);

let noCacheOrEventBus = false;
let cacheDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  const hasCacheDir = exists(path.join(RUNTIME, 'core/cache'));
  const hasEventBusDir = exists(path.join(RUNTIME, 'core/event-bus'));
  const hasReference = /eventBus|EventBus|cacheEngine|CacheEngine/.test(source);
  noCacheOrEventBus = !hasCacheDir && !hasEventBusDir && !hasReference;
  cacheDetail = hasCacheDir
    ? 'core/cache directory exists'
    : hasEventBusDir
      ? 'core/event-bus directory exists'
      : hasReference
        ? 'Cache/EventBus reference found'
        : 'clean';
} catch (err) {
  cacheDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no Cache/Event Bus created', noCacheOrEventBus, cacheDetail);

let noTransactionEngine = false;
let txDetail = '';
try {
  const source = fs.readFileSync(connectorEnginePath, 'utf8');
  const hasDir = exists(path.join(RUNTIME, 'core/transaction'));
  const hasReference = /transactionEngine|TransactionEngine|TransactionManager/.test(source);
  noTransactionEngine = !hasDir && !hasReference;
  txDetail = hasDir ? 'core/transaction directory exists' : hasReference ? 'TransactionEngine/Manager reference found' : 'clean';
} catch (err) {
  txDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — no Transaction Engine created', noTransactionEngine, txDetail);

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
    const source = fs.readFileSync(connectorEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-19 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let unknownOperationFailsClosed = false;
let unknownOperationDetail = '';
try {
  const mod = await import(pathToFileURL(connectorEnginePath).href);
  const { createConnectorEngine } = mod;
  const registryModule = await import(pathToFileURL(path.join(RUNTIME, 'core/registry/registryManager.js')).href);
  const registry = registryModule.createRegistry();
  registry.freeze();
  const engine = createConnectorEngine({ registry });
  try {
    await engine.invoke('any-connector', { operation: 'unknown_operation_xyz', payload: {} }, { accessScope: { permissions: [] } });
    unknownOperationFailsClosed = false;
    unknownOperationDetail = 'unknown operation did not throw — silent pass risk';
  } catch (err) {
    unknownOperationFailsClosed = err && err.code === 'MAK-L3-CONNECTOR-004';
    unknownOperationDetail = unknownOperationFailsClosed
      ? 'unknown operation throws ConnectorError as expected'
      : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  unknownOperationDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-19 — unknown operation never silently executes', unknownOperationFailsClosed, unknownOperationDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/connector/connector.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-19 — Connector Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-19 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
