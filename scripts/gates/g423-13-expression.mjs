#!/usr/bin/env node
/**
 * Gate G423-13 — M13 Expression Engine (Foundation C.9)
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

const expressionEnginePath = path.join(RUNTIME, 'core/expression/expressionEngine.js');

gate('G423-13 — ExpressionEngine module exists', exists(expressionEnginePath));
gate('G423-13 — ExpressionError module exists', exists(path.join(RUNTIME, 'core/expression/errors.js')));
gate('G423-13 — Expression types exist', exists(path.join(RUNTIME, 'types/expression.js')));
gate('G423-13 — Expression tests exist', exists(path.join(RUNTIME, '__tests__/expression/expression.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createExpressionEngine/.test(indexSource) && /ExpressionError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-13 — createExpressionEngine/ExpressionError exported from runtime index', exportsOk);

let noEvalOrFunction = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(expressionEnginePath, 'utf8');
  const hasEval = /\beval\s*\(/.test(source);
  const hasNewFunction = /new\s+Function\s*\(/.test(source);
  noEvalOrFunction = !hasEval && !hasNewFunction;
  evalDetail = hasEval ? 'eval() found' : hasNewFunction ? 'new Function() found' : 'clean';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-13 — no eval()/new Function() in core/expression/', noEvalOrFunction, evalDetail);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(expressionEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-13 — no direct Prisma/backend import in core/expression/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noAutoExecute = false;
let autoExecuteDetail = '';
try {
  const source = fs.readFileSync(expressionEnginePath, 'utf8');
  const hasReference = /actionEngine|ActionEngine|workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source);
  noAutoExecute = !hasReference;
  autoExecuteDetail = hasReference ? 'action/workflow/render reference found' : 'clean';
} catch (err) {
  autoExecuteDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-13 — does not execute Action/Workflow/Render', noAutoExecute, autoExecuteDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/expression/expression.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-13 — Expression Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-13 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
