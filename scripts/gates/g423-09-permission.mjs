#!/usr/bin/env node
/**
 * Gate G423-09 — M09 Permission Engine (Foundation C.5)
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

gate('G423-09 — PermissionEngine module exists', exists(path.join(RUNTIME, 'core/permission/permissionEngine.js')));
gate('G423-09 — PermissionMatrix module exists', exists(path.join(RUNTIME, 'core/permission/PermissionMatrix.js')));
gate('G423-09 — PermissionError module exists', exists(path.join(RUNTIME, 'core/permission/errors.js')));
gate('G423-09 — Permission types exist', exists(path.join(RUNTIME, 'types/permission.js')));
gate('G423-09 — Permission tests exist', exists(path.join(RUNTIME, '__tests__/permission/permission.test.js')));

const routerPath = path.join(RUNTIME, 'core/router/runtimeRouter.js');
gate('G423-09 — RuntimeRouter module exists', exists(routerPath));

let stubRemoved = false;
let stubDetail = '';
try {
  const routerSource = fs.readFileSync(routerPath, 'utf8');
  const hasOldStub = /canActivate\s*\([^)]*\)\s*\{\s*return true;\s*\}/.test(routerSource);
  const delegatesToEngine = /this\._permissionEngine/.test(routerSource);
  stubRemoved = !hasOldStub && delegatesToEngine;
  stubDetail = hasOldStub ? 'old "return true" stub still present' : 'delegates to _permissionEngine';
} catch (err) {
  stubDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-09 — canActivate() no longer stub, delegates to Permission Engine', stubRemoved, stubDetail);

let testsOk = false;
try {
  execSync(
    'node --test src/runtime/__tests__/permission/permission.test.js src/runtime/__tests__/router/router.test.js',
    {
      cwd: ROOT,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' },
    },
  );
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-09 — Permission + Router tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-09 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
