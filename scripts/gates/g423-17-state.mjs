#!/usr/bin/env node
/**
 * Gate G423-17 — M17 State Engine (Foundation C.12)
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

const stateEnginePath = path.join(RUNTIME, 'core/state/stateEngine.js');

gate('G423-17 — StateEngine module exists', exists(stateEnginePath));
gate('G423-17 — StateError module exists', exists(path.join(RUNTIME, 'core/state/errors.js')));
gate('G423-17 — State types exist', exists(path.join(RUNTIME, 'types/state.js')));
gate('G423-17 — State tests exist', exists(path.join(RUNTIME, '__tests__/state/state.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createStateEngine/.test(indexSource) && /StateError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-17 — createStateEngine/StateError exported from runtime index', exportsOk);

let noEvalOrFunction = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(stateEnginePath, 'utf8');
  const hasEval = /\beval\s*\(/.test(source);
  const hasNewFunction = /new\s+Function\s*\(/.test(source);
  noEvalOrFunction = !hasEval && !hasNewFunction;
  evalDetail = hasEval ? 'eval() found' : hasNewFunction ? 'new Function() found' : 'clean';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-17 — no eval()/new Function() in core/state/', noEvalOrFunction, evalDetail);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(stateEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-17 — no direct Prisma/backend import in core/state/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noTransactionEngine = false;
let txDetail = '';
try {
  const source = fs.readFileSync(stateEnginePath, 'utf8');
  const hasDir = exists(path.join(RUNTIME, 'core/transaction'));
  const hasReference = /transactionEngine|TransactionEngine|TransactionManager/.test(source);
  noTransactionEngine = !hasDir && !hasReference;
  txDetail = hasDir ? 'core/transaction directory exists' : hasReference ? 'TransactionEngine/Manager reference found' : 'clean';
} catch (err) {
  txDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-17 — no Transaction Engine created', noTransactionEngine, txDetail);

let noCacheOrEventBus = false;
let cacheDetail = '';
try {
  const source = fs.readFileSync(stateEnginePath, 'utf8');
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
gate('G423-17 — no Cache/Event Bus created', noCacheOrEventBus, cacheDetail);

let noPluginOrConnector = false;
let pluginDetail = '';
try {
  // M18 Plugin Engine (C.13) and M19 Connector Engine (C.14) both legitimately exist — scoped to
  // "stateEngine.js itself never references them" (permanently valid), not "core/plugin|connector/
  // must not exist" (that was only a scope-creep guard valid during C.12's own authoring).
  const source = fs.readFileSync(stateEnginePath, 'utf8');
  const hasReference = /pluginEngine|PluginEngine|connectorEngine|ConnectorEngine/.test(source);
  noPluginOrConnector = !hasReference;
  pluginDetail = hasReference ? 'Plugin/Connector reference found' : 'clean';
} catch (err) {
  pluginDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-17 — no Plugin/Connector Engine created', noPluginOrConnector, pluginDetail);

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
    const source = fs.readFileSync(stateEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-17 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let unknownOpFailsClosed = false;
let unknownOpDetail = '';
try {
  const mod = await import(pathToFileURL(stateEnginePath).href);
  const { createStateEngine } = mod;
  const engine = createStateEngine();
  try {
    await engine.transition('entityA', { type: 'unknown_op_xyz' });
    unknownOpFailsClosed = false;
    unknownOpDetail = 'unknown transition operation did not throw — silent pass risk';
  } catch (err) {
    unknownOpFailsClosed = err && err.code === 'MAK-L3-STATE-005';
    unknownOpDetail = unknownOpFailsClosed ? 'unknown operation throws StateError as expected' : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  unknownOpDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-17 — unknown state transition operation never silently passes', unknownOpFailsClosed, unknownOpDetail);

let snapshotIsSafe = false;
let snapshotDetail = '';
try {
  const mod = await import(pathToFileURL(stateEnginePath).href);
  const { createStateEngine } = mod;
  const engine = createStateEngine({ initialState: { list: [1, 2] } });
  const snap = engine.snapshot();
  snap.list.push(3);
  snap.mutated = true;
  const stillClean = JSON.stringify(engine.get('list')) === JSON.stringify([1, 2]) && engine.get('mutated') === undefined;
  snapshotIsSafe = stillClean;
  snapshotDetail = stillClean ? 'mutating the snapshot does not affect internal state' : 'snapshot mutation leaked into internal state';
} catch (err) {
  snapshotDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-17 — snapshot() returns a safe copy (mutation does not leak)', snapshotIsSafe, snapshotDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/state/state.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-17 — State Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-17 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
