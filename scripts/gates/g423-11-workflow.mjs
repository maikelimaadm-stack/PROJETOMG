#!/usr/bin/env node
/**
 * Gate G423-11 — M11 Workflow Engine (Foundation C.7)
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

const workflowEnginePath = path.join(RUNTIME, 'core/workflow/workflowEngine.js');

gate('G423-11 — WorkflowEngine module exists', exists(workflowEnginePath));
gate('G423-11 — WorkflowError module exists', exists(path.join(RUNTIME, 'core/workflow/errors.js')));
gate('G423-11 — Workflow types exist', exists(path.join(RUNTIME, 'types/workflow.js')));
gate('G423-11 — Workflow tests exist', exists(path.join(RUNTIME, '__tests__/workflow/workflow.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createWorkflowEngine/.test(indexSource) && /WorkflowError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-11 — createWorkflowEngine/WorkflowError exported from runtime index', exportsOk);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(workflowEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /require\(.*prisma.*\)/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-11 — no direct Prisma/backend import in core/workflow/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noRenderEngine = false;
let renderDetail = '';
try {
  const source = fs.readFileSync(workflowEnginePath, 'utf8');
  const hasRender = /renderEngine|RenderEngine|studio|Studio|marketplace|Marketplace/.test(source);
  const renderEngineCreated = exists(path.join(RUNTIME, 'core/render'));
  noRenderEngine = !hasRender && !renderEngineCreated;
  renderDetail = hasRender ? 'render/studio/marketplace reference found in workflowEngine.js' : renderEngineCreated ? 'core/render/ directory was created' : 'clean';
} catch (err) {
  renderDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-11 — no Render Engine (M12) created or referenced', noRenderEngine, renderDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/workflow/workflow.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-11 — Workflow Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-11 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
