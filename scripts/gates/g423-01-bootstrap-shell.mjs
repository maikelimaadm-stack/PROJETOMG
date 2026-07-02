#!/usr/bin/env node
/**
 * Gate G423-01 — M01 Bootstrap Shell RT-0 (Foundation C.1 partial)
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

gate('G423-01 — bootstrap module exists', exists(path.join(RUNTIME, 'core/bootstrap/bootstrap.js')));
gate('G423-01 — RT-0 phase handler exists', exists(path.join(RUNTIME, 'core/bootstrap/phases/rt0-shell.js')));
gate('G423-01 — public runtime barrel exists', exists(path.join(RUNTIME, 'index.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/bootstrap/bootstrap.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  testsOk = false;
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-01 — Bootstrap RT-0 unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-01 summary (C.1 partial) ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
