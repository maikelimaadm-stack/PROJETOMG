#!/usr/bin/env node
/**
 * Gate G423-03 — M03 Runtime Session (Foundation C.2)
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

gate('G423-03 — RuntimeSession module exists', exists(path.join(RUNTIME, 'core/session/RuntimeSession.js')));
gate('G423-03 — SessionFactory module exists', exists(path.join(RUNTIME, 'core/session/SessionFactory.js')));
gate('G423-03 — WebSessionManager (mock L1) exists', exists(path.join(RUNTIME, 'core/session/webSession.js')));
gate('G423-03 — SessionError defined', exists(path.join(RUNTIME, 'core/session/errors.js')));

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/session/session.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  testsOk = false;
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-03 — Session unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-03 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
