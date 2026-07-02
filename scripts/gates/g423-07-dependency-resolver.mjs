#!/usr/bin/env node
/**
 * Gate G423-07 — M07 Dependency Resolver (Foundation C.4)
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

gate('G423-07 — DependencyResolver module exists', exists(path.join(RUNTIME, 'core/dependency/dependencyResolver.js')));
gate('G423-07 — DependencyGraph module exists', exists(path.join(RUNTIME, 'core/dependency/DependencyGraph.js')));
gate('G423-07 — DependencySorter module exists', exists(path.join(RUNTIME, 'core/dependency/DependencySorter.js')));
gate('G423-07 — DependencyError defined', exists(path.join(RUNTIME, 'core/dependency/errors.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/dependency/dependency.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-07 — Dependency unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-07 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
