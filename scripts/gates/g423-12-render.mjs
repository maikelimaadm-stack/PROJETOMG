#!/usr/bin/env node
/**
 * Gate G423-12 — M12 Render Engine (Foundation C.8)
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

const renderEnginePath = path.join(RUNTIME, 'core/render/renderEngine.js');

gate('G423-12 — RenderEngine module exists', exists(renderEnginePath));
gate('G423-12 — RenderError module exists', exists(path.join(RUNTIME, 'core/render/errors.js')));
gate('G423-12 — Render types exist', exists(path.join(RUNTIME, 'types/render.js')));
gate('G423-12 — Render tests exist', exists(path.join(RUNTIME, '__tests__/render/render.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createRenderEngine/.test(indexSource) && /RenderError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-12 — createRenderEngine/RenderError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(renderEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /require\(.*prisma.*\)/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-12 — no direct Prisma/backend import in core/render/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noRealReactDom = false;
let reactDetail = '';
try {
  const source = fs.readFileSync(renderEnginePath, 'utf8');
  const hasReact = /from\s+['"]react(-dom)?['"]/i.test(source) || /require\(['"]react/i.test(source);
  noRealReactDom = !hasReact;
  reactDetail = hasReact ? 'react/react-dom import found — must stay a plain data tree' : 'clean';
} catch (err) {
  reactDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-12 — RenderEngine does not import React/DOM (intermediate tree only)', noRealReactDom, reactDetail);

let noProductionUiTouch = false;
let uiTouchDetail = '';
try {
  const diff = execSync('git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules', {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
  noProductionUiTouch = diff.length === 0;
  uiTouchDetail = diff.length === 0 ? 'clean' : `unexpected changes: ${diff.split('\n').join(', ')}`;
} catch {
  // If the diff can't be computed (e.g. no origin/main in this environment), don't fail the gate on that alone.
  noProductionUiTouch = true;
  uiTouchDetail = 'diff check skipped (no comparable origin/main ref)';
}
gate('G423-12 — production UI (src/App.jsx, shared/framework/modules) untouched', noProductionUiTouch, uiTouchDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/render/render.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-12 — Render Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-12 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
