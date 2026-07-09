#!/usr/bin/env node
/**
 * Gate G423-20 — M20 Service Locator (Foundation C.5)
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

gate('G423-20 — ServiceLocator module exists', exists(path.join(RUNTIME, 'infra/service-locator/serviceLocator.js')));
gate('G423-20 — ServiceLocatorError module exists', exists(path.join(RUNTIME, 'infra/service-locator/errors.js')));
gate('G423-20 — Service Locator types exist', exists(path.join(RUNTIME, 'types/service-locator.js')));
gate('G423-20 — Service Locator tests exist', exists(path.join(RUNTIME, '__tests__/service-locator/service-locator.test.js')));

let behaviorOk = false;
let behaviorDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(RUNTIME, 'infra/service-locator/serviceLocator.js')).href);
  const { createServiceLocator } = mod;

  // register() respects singleton lifetime.
  const locator = createServiceLocator();
  let calls = 0;
  locator.register('singletonSvc', () => ({ n: ++calls }));
  const singletonOk = locator.resolve('singletonSvc') === locator.resolve('singletonSvc') && calls === 1;

  // register() respects scoped lifetime — isolated per scope.
  locator.register('scopedSvc', () => ({ id: Math.random() }), { scope: 'scoped' });
  const scopeA = locator.createScope();
  const scopeB = locator.createScope();
  const scopedOk =
    scopeA.resolve('scopedSvc') === scopeA.resolve('scopedSvc') &&
    scopeA.resolve('scopedSvc') !== scopeB.resolve('scopedSvc');

  // createScope() inherits registrations from the parent.
  locator.register('parentOnly', () => 'from-parent');
  const inheritOk = locator.createScope().resolve('parentOnly') === 'from-parent';

  behaviorOk = singletonOk && scopedOk && inheritOk;
  behaviorDetail = `singleton=${singletonOk} scoped=${scopedOk} inherit=${inheritOk}`;
} catch (err) {
  behaviorDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-20 — register() respects lifetime + createScope() inherits from parent', behaviorOk, behaviorDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/service-locator/service-locator.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-20 — Service Locator unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-20 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
