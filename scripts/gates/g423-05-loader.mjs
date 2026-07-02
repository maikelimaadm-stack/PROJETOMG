#!/usr/bin/env node
/**
 * Gate G423-05 — M05 Universal Loader (Foundation C.3)
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

gate('G423-05 — LoaderManager module exists', exists(path.join(RUNTIME, 'core/loader/loaderManager.js')));
gate('G423-05 — LoaderPipeline module exists', exists(path.join(RUNTIME, 'core/loader/LoaderPipeline.js')));
gate('G423-05 — LoaderValidation module exists', exists(path.join(RUNTIME, 'core/loader/LoaderValidation.js')));
gate('G423-05 — LoaderError defined', exists(path.join(RUNTIME, 'core/loader/errors.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/loader/loader.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-05 — Loader unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-05 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
