#!/usr/bin/env node
/**
 * Gate G423-18 — M18 Plugin Engine (Foundation C.13)
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

const pluginEnginePath = path.join(RUNTIME, 'core/plugin/pluginEngine.js');

gate('G423-18 — PluginEngine module exists', exists(pluginEnginePath));
gate('G423-18 — PluginError module exists', exists(path.join(RUNTIME, 'core/plugin/errors.js')));
gate('G423-18 — Plugin types exist', exists(path.join(RUNTIME, 'types/plugin.js')));
gate('G423-18 — Plugin tests exist', exists(path.join(RUNTIME, '__tests__/plugin/plugin.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createPluginEngine/.test(indexSource) && /PluginError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-18 — createPluginEngine/PluginError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — no direct Prisma/backend import in core/plugin/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noEval = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
  noEval = !/\beval\s*\(/.test(source);
  evalDetail = noEval ? 'clean' : 'eval() found';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — no eval() in core/plugin/', noEval, evalDetail);

let noNewFunction = false;
let newFunctionDetail = '';
try {
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
  noNewFunction = !/new\s+Function\s*\(/.test(source);
  newFunctionDetail = noNewFunction ? 'clean' : 'new Function() found';
} catch (err) {
  newFunctionDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — no new Function() in core/plugin/', noNewFunction, newFunctionDetail);

let noDynamicImport = false;
let dynamicImportDetail = '';
try {
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  noDynamicImport = !/\bimport\s*\(/.test(codeOnly);
  dynamicImportDetail = noDynamicImport ? 'clean (JSDoc-only import() type references excluded)' : 'dynamic import() found in executable code';
} catch (err) {
  dynamicImportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — no unsafe dynamic import() in core/plugin/', noDynamicImport, dynamicImportDetail);

let noConnectorEngine = false;
let connectorDetail = '';
try {
  // M19 Connector Engine legitimately exists as of C.14 — scoped to "pluginEngine.js itself never
  // references it" (permanently valid), not "core/connector/ must not exist" (that was only a
  // scope-creep guard valid during C.13's own authoring).
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
  const hasReference = /connectorEngine|ConnectorEngine/.test(source);
  noConnectorEngine = !hasReference;
  connectorDetail = hasReference ? 'ConnectorEngine reference found' : 'clean';
} catch (err) {
  connectorDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — pluginEngine.js does not reference Connector Engine directly', noConnectorEngine, connectorDetail);

let noTransactionEngine = false;
let txDetail = '';
try {
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
  const hasDir = exists(path.join(RUNTIME, 'core/transaction'));
  const hasReference = /transactionEngine|TransactionEngine|TransactionManager/.test(source);
  noTransactionEngine = !hasDir && !hasReference;
  txDetail = hasDir ? 'core/transaction directory exists' : hasReference ? 'TransactionEngine/Manager reference found' : 'clean';
} catch (err) {
  txDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — no Transaction Engine created', noTransactionEngine, txDetail);

let noCacheOrEventBus = false;
let cacheDetail = '';
try {
  const source = fs.readFileSync(pluginEnginePath, 'utf8');
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
gate('G423-18 — no Cache/Event Bus created', noCacheOrEventBus, cacheDetail);

let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(pluginEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-18 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let unknownCapabilityFailsClosed = false;
let unknownCapabilityDetail = '';
try {
  const mod = await import(pathToFileURL(pluginEnginePath).href);
  const { createPluginEngine } = mod;
  const registryModule = await import(pathToFileURL(path.join(RUNTIME, 'core/registry/registryManager.js')).href);
  const registry = registryModule.createRegistry();
  registry.freeze();
  const engine = createPluginEngine({ registry });
  try {
    await engine.execute('any-plugin', 'unknown_capability_xyz', {}, { accessScope: { permissions: [] } });
    unknownCapabilityFailsClosed = false;
    unknownCapabilityDetail = 'unknown capability did not throw — silent pass risk';
  } catch (err) {
    unknownCapabilityFailsClosed = err && err.code === 'MAK-L3-PLUGIN-004';
    unknownCapabilityDetail = unknownCapabilityFailsClosed
      ? 'unknown capability throws PluginError as expected'
      : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  unknownCapabilityDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-18 — unknown capability never silently executes', unknownCapabilityFailsClosed, unknownCapabilityDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/plugin/plugin.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-18 — Plugin Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-18 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
