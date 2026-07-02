#!/usr/bin/env node
/**
 * Gate G423-02 — M02 Universal Context (Foundation C.1)
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

gate('G423-02 — RuntimeContext module exists', exists(path.join(RUNTIME, 'core/context/RuntimeContext.js')));
gate('G423-02 — createContext factory exists', exists(path.join(RUNTIME, 'core/context/createContext.js')));
gate('G423-02 — ContextError defined', exists(path.join(RUNTIME, 'core/context/errors.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/context/context.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  testsOk = false;
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-02 — Context unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-02 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
