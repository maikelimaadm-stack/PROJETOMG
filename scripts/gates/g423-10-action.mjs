#!/usr/bin/env node
/**
 * Gate G423-10 — M10 Action Engine (Foundation C.6)
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

const actionEnginePath = path.join(RUNTIME, 'core/action/actionEngine.js');

gate('G423-10 — ActionEngine module exists', exists(actionEnginePath));
gate('G423-10 — ActionError module exists', exists(path.join(RUNTIME, 'core/action/errors.js')));
gate('G423-10 — Action types exist', exists(path.join(RUNTIME, 'types/action.js')));
gate('G423-10 — Action tests exist', exists(path.join(RUNTIME, '__tests__/action/action.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createActionEngine/.test(indexSource) && /ActionError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-10 — createActionEngine/ActionError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(actionEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /require\(.*prisma.*\)/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-10 — no direct Prisma/backend import in core/action/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/action/action.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-10 — Action Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-10 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
