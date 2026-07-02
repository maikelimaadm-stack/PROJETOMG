#!/usr/bin/env node
/**
 * Gate G423-08 — M08 Runtime Router (Foundation C.4)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);

gate('G423-08 — RuntimeRouter module exists', exists(path.join(RUNTIME, 'core/router/runtimeRouter.js')));
gate('G423-08 — RouteMatcher module exists', exists(path.join(RUNTIME, 'core/router/RouteMatcher.js')));
gate('G423-08 — RouteRegistry module exists', exists(path.join(RUNTIME, 'core/router/RouteRegistry.js')));
gate('G423-08 — RouteError defined', exists(path.join(RUNTIME, 'core/router/errors.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/router/router.test.js src/runtime/__tests__/integration/runtime-bundle.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-08 — Router + integration tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-08 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
