#!/usr/bin/env node
/**
 * Gate G423-04 — M04 Universal Registry (Foundation C.2)
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

gate('G423-04 — RegistryManager module exists', exists(path.join(RUNTIME, 'core/registry/registryManager.js')));
gate('G423-04 — RegistryValidation module exists', exists(path.join(RUNTIME, 'core/registry/RegistryValidation.js')));
gate('G423-04 — RegistryTypes (12 types) defined', exists(path.join(RUNTIME, 'core/registry/registryTypes.js')));
gate('G423-04 — RegistryError defined', exists(path.join(RUNTIME, 'core/registry/errors.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/registry/registry.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  testsOk = false;
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-04 — Registry unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-04 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
