#!/usr/bin/env node
/**
 * Gate G423-24 — M24 Observability Engine (Foundation C.17)
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

const observabilityEnginePath = path.join(RUNTIME, 'infra/observability/observabilityEngine.js');

gate('G423-24 — ObservabilityEngine module exists', exists(observabilityEnginePath));
gate('G423-24 — ObservabilityError module exists', exists(path.join(RUNTIME, 'infra/observability/errors.js')));
gate('G423-24 — Observability types exist', exists(path.join(RUNTIME, 'types/observability.js')));
gate('G423-24 — Observability tests exist', exists(path.join(RUNTIME, '__tests__/observability/observability.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createObservabilityEngine/.test(indexSource) && /ObservabilityError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-24 — createObservabilityEngine/ObservabilityError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(observabilityEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-24 — no direct Prisma/backend import in infra/observability/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noWebStorage = false;
let webStorageDetail = '';
try {
  const source = fs.readFileSync(observabilityEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  const hasStorage = /localStorage|sessionStorage|indexedDB/i.test(codeOnly);
  noWebStorage = !hasStorage;
  webStorageDetail = noWebStorage ? 'clean (JSDoc-only mentions excluded)' : 'localStorage/sessionStorage/IndexedDB usage found';
} catch (err) {
  webStorageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-24 — no localStorage/sessionStorage/IndexedDB in infra/observability/', noWebStorage, webStorageDetail);

let noExternalTransport = false;
let transportDetail = '';
try {
  const source = fs.readFileSync(observabilityEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  const hasTransport = /WebSocket|BroadcastChannel|new\s+Worker\s*\(|worker_threads/.test(codeOnly);
  noExternalTransport = !hasTransport;
  transportDetail = noExternalTransport ? 'clean (JSDoc-only mentions excluded)' : 'WebSocket/BroadcastChannel/worker usage found';
} catch (err) {
  transportDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-24 — no WebSocket/BroadcastChannel/worker/thread in infra/observability/', noExternalTransport, transportDetail);

let noExternalTelemetry = false;
let telemetryDetail = '';
try {
  const source = fs.readFileSync(observabilityEnginePath, 'utf8');
  const codeOnly = stripComments(source);
  const hasTelemetry = /\bfetch\s*\(|sentry|datadog|segment\.io|newrelic|XMLHttpRequest/i.test(codeOnly);
  noExternalTelemetry = !hasTelemetry;
  telemetryDetail = noExternalTelemetry ? 'clean' : 'external telemetry call found';
} catch (err) {
  telemetryDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-24 — no external telemetry call in infra/observability/', noExternalTelemetry, telemetryDetail);

let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  try {
    const source = fs.readFileSync(observabilityEnginePath, 'utf8');
    noProductionUiChange = !/from\s+['"]react['"]/i.test(source) && !/from\s+['"]react-dom['"]/i.test(source);
    productionUiDetail = noProductionUiChange
      ? 'git diff unavailable — fallback static check clean (no react/react-dom import)'
      : 'fallback static check found react/react-dom import';
  } catch (fallbackErr) {
    productionUiDetail = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
  }
}
gate('G423-24 — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

let limitEnforced = false;
let limitDetail = '';
try {
  const mod = await import(pathToFileURL(observabilityEnginePath).href);
  const { createObservabilityEngine } = mod;
  const engine = createObservabilityEngine();
  try {
    engine.recordEvent('e', JSON.parse('{"__proto__": {"polluted": true}}'));
    limitEnforced = false;
    limitDetail = 'prototype-pollution payload was accepted — silent risk';
  } catch (err) {
    limitEnforced = err && err.code === 'MAK-L3-OBSERVABILITY-001';
    limitDetail = limitEnforced ? 'forbidden key rejected as expected' : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  limitDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-24 — prototype-pollution payload never silently accepted', limitEnforced, limitDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/observability/observability.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-24 — Observability Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-24 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
