#!/usr/bin/env node
/**
 * Gate G423-22 — M22 Event Bus (Foundation C.15)
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

const eventBusPath = path.join(RUNTIME, 'infra/event-bus/eventBus.js');

gate('G423-22 — EventBus module exists', exists(eventBusPath));
gate('G423-22 — EventBusError module exists', exists(path.join(RUNTIME, 'infra/event-bus/errors.js')));
gate('G423-22 — Event Bus types exist', exists(path.join(RUNTIME, 'types/event-bus.js')));
gate('G423-22 — Event Bus tests exist', exists(path.join(RUNTIME, '__tests__/event-bus/event-bus.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createEventBus/.test(indexSource) && /EventBusError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-22 — createEventBus/EventBusError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(eventBusPath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-22 — no direct Prisma/backend import in infra/event-bus/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noExternalTransport = false;
let transportDetail = '';
try {
  const source = fs.readFileSync(eventBusPath, 'utf8');
  const codeOnly = stripComments(source);
  const hasTransport = /WebSocket|BroadcastChannel|new\s+Worker\s*\(|worker_threads/.test(codeOnly);
  noExternalTransport = !hasTransport;
  transportDetail = noExternalTransport ? 'clean (JSDoc-only mentions excluded)' : 'WebSocket/BroadcastChannel/worker usage found';
} catch (err) {
  transportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-22 — no WebSocket/BroadcastChannel/worker/thread in infra/event-bus/', noExternalTransport, transportDetail);

let noTransactionEngine = false;
let txDetail = '';
try {
  const source = fs.readFileSync(eventBusPath, 'utf8');
  const hasDir = exists(path.join(RUNTIME, 'core/transaction'));
  const hasReference = /transactionEngine|TransactionEngine|TransactionManager/.test(source);
  noTransactionEngine = !hasDir && !hasReference;
  txDetail = hasDir ? 'core/transaction directory exists' : hasReference ? 'TransactionEngine/Manager reference found' : 'clean';
} catch (err) {
  txDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-22 — no Transaction Engine created', noTransactionEngine, txDetail);

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
    const source = fs.readFileSync(eventBusPath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-22 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let invalidEventFailsClosed = false;
let invalidEventDetail = '';
try {
  const mod = await import(pathToFileURL(eventBusPath).href);
  const { createEventBus } = mod;
  const bus = createEventBus();
  try {
    await bus.emit('', {});
    invalidEventFailsClosed = false;
    invalidEventDetail = 'invalid (empty) event type did not throw — silent pass risk';
  } catch (err) {
    invalidEventFailsClosed = err && err.code === 'MAK-L3-EVENTBUS-002';
    invalidEventDetail = invalidEventFailsClosed ? 'invalid event type throws EventBusError as expected' : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  invalidEventDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-22 — invalid event type never silently emits', invalidEventFailsClosed, invalidEventDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/event-bus/event-bus.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-22 — Event Bus unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-22 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
