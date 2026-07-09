#!/usr/bin/env node
/**
 * Gate G423-16 — M16 Execution Engine (Foundation C.11)
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

const executionEnginePath = path.join(RUNTIME, 'core/execution/executionEngine.js');

gate('G423-16 — ExecutionEngine module exists', exists(executionEnginePath));
gate('G423-16 — ExecutionError module exists', exists(path.join(RUNTIME, 'core/execution/errors.js')));
gate('G423-16 — Execution types exist', exists(path.join(RUNTIME, 'types/execution.js')));
gate('G423-16 — Execution tests exist', exists(path.join(RUNTIME, '__tests__/execution/execution.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createExecutionEngine/.test(indexSource) && /ExecutionError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-16 — createExecutionEngine/ExecutionError exported from runtime index', exportsOk);

let delegatesOk = false;
let delegatesDetail = '';
try {
  const source = fs.readFileSync(executionEnginePath, 'utf8');
  const hasActionDelegation = /_actionEngine/.test(source) && /dispatch/.test(source);
  const hasWorkflowDelegation = /_workflowEngine/.test(source) && /\.start\(/.test(source);
  delegatesOk = hasActionDelegation && hasWorkflowDelegation;
  delegatesDetail = delegatesOk ? 'delegates to Action Engine and Workflow Engine' : 'missing delegation to Action/Workflow Engine';
} catch (err) {
  delegatesDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — ExecutionEngine delegates to Action/Workflow Engine (no reimplementation)', delegatesOk, delegatesDetail);

let noEvalOrFunction = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(executionEnginePath, 'utf8');
  const hasEval = /\beval\s*\(/.test(source);
  const hasNewFunction = /new\s+Function\s*\(/.test(source);
  noEvalOrFunction = !hasEval && !hasNewFunction;
  evalDetail = hasEval ? 'eval() found' : hasNewFunction ? 'new Function() found' : 'clean';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — no eval()/new Function() in core/execution/', noEvalOrFunction, evalDetail);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(executionEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — no direct Prisma/backend import in core/execution/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noStateEngine = false;
let stateDetail = '';
try {
  // M17 State Engine legitimately exists as of C.12 — this check is scoped to "executionEngine.js
  // itself never references it" (permanently valid), not "core/state/ must not exist" (that was
  // only a scope-creep guard valid during C.11's own authoring).
  const source = fs.readFileSync(executionEnginePath, 'utf8');
  const hasReference = /stateEngine|StateEngine/.test(source);
  noStateEngine = !hasReference;
  stateDetail = hasReference ? 'StateEngine reference found' : 'clean';
} catch (err) {
  stateDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — executionEngine.js does not reference State Engine directly', noStateEngine, stateDetail);

let noTransactionEngine = false;
let txDetail = '';
try {
  const source = fs.readFileSync(executionEnginePath, 'utf8');
  const hasDir = exists(path.join(RUNTIME, 'core/transaction'));
  const hasReference = /transactionEngine|TransactionEngine|TransactionManager/.test(source);
  noTransactionEngine = !hasDir && !hasReference;
  txDetail = hasDir ? 'core/transaction directory exists' : hasReference ? 'TransactionEngine/Manager reference found' : 'clean';
} catch (err) {
  txDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — no Transaction Engine created', noTransactionEngine, txDetail);

let noPluginEngine = false;
let pluginDetail = '';
try {
  // M18 Plugin Engine legitimately exists as of C.13 — scoped to "executionEngine.js itself
  // never references it" (permanently valid), not "core/plugin/ must not exist" (that was only
  // a scope-creep guard valid during C.11's own authoring).
  const source = fs.readFileSync(executionEnginePath, 'utf8');
  const hasReference = /pluginEngine|PluginEngine/.test(source);
  noPluginEngine = !hasReference;
  pluginDetail = hasReference ? 'PluginEngine reference found' : 'clean';
} catch (err) {
  pluginDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — executionEngine.js does not reference Plugin Engine directly', noPluginEngine, pluginDetail);

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
  // No origin/main comparison available (e.g. shallow clone) — do not fail the gate on infra limitations,
  // but do not silently pass either: fall back to a static source check instead.
  try {
    const source = fs.readFileSync(executionEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-16 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let unknownTypeFailsClosed = false;
let unknownTypeDetail = '';
try {
  const mod = await import(pathToFileURL(executionEnginePath).href);
  const { createExecutionEngine } = mod;
  const registryModule = await import(pathToFileURL(path.join(RUNTIME, 'core/registry/registryManager.js')).href);
  const registry = registryModule.createRegistry();
  registry.freeze();
  const engine = createExecutionEngine({ registry });
  const response = await engine.execute({ type: 'render.something', payload: {} }, { accessScope: { permissions: [] } });
  unknownTypeFailsClosed = response.success === false && response.error?.code === 'MAK-L3-EXECUTION-003';
  unknownTypeDetail = unknownTypeFailsClosed
    ? 'unknown execution type returns MAK-L3-EXECUTION-003 as expected'
    : `unexpected response: ${JSON.stringify(response)}`;
} catch (err) {
  unknownTypeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-16 — unknown execution type never silently executes', unknownTypeFailsClosed, unknownTypeDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/execution/execution.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-16 — Execution Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-16 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
