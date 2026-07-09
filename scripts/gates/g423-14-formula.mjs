#!/usr/bin/env node
/**
 * Gate G423-14 — M14 Formula Engine (Foundation C.9)
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

const formulaEnginePath = path.join(RUNTIME, 'core/formula/formulaEngine.js');

gate('G423-14 — FormulaEngine module exists', exists(formulaEnginePath));
gate('G423-14 — FormulaError module exists', exists(path.join(RUNTIME, 'core/formula/errors.js')));
gate('G423-14 — Formula types exist', exists(path.join(RUNTIME, 'types/formula.js')));
gate('G423-14 — Formula tests exist', exists(path.join(RUNTIME, '__tests__/formula/formula.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createFormulaEngine/.test(indexSource) && /FormulaError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-14 — createFormulaEngine/FormulaError exported from runtime index', exportsOk);

let usesExpressionEngine = false;
let usesDetail = '';
try {
  const source = fs.readFileSync(formulaEnginePath, 'utf8');
  usesExpressionEngine = /expression\/expressionEngine\.js/.test(source) && /_expressionEngine/.test(source);
  usesDetail = usesExpressionEngine ? 'delegates evaluation to ExpressionEngine' : 'no ExpressionEngine delegation found';
} catch (err) {
  usesDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-14 — FormulaEngine uses ExpressionEngine (no reimplementation)', usesExpressionEngine, usesDetail);

let detectsCycles = false;
let cycleDetail = '';
try {
  const source = fs.readFileSync(formulaEnginePath, 'utf8');
  detectsCycles = /inProgress/.test(source) && /MAK-L3-FORMULA-004/.test(source);
  cycleDetail = detectsCycles ? 'cycle guard present' : 'no cycle guard found';
} catch (err) {
  cycleDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-14 — detects cycles between formulas', detectsCycles, cycleDetail);

let noEvalOrFunction = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(formulaEnginePath, 'utf8');
  const hasEval = /\beval\s*\(/.test(source);
  const hasNewFunction = /new\s+Function\s*\(/.test(source);
  noEvalOrFunction = !hasEval && !hasNewFunction;
  evalDetail = hasEval ? 'eval() found' : hasNewFunction ? 'new Function() found' : 'clean';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-14 — no eval()/new Function() in core/formula/', noEvalOrFunction, evalDetail);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(formulaEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-14 — no direct Prisma/backend import in core/formula/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noAutoExecute = false;
let autoExecuteDetail = '';
try {
  const source = fs.readFileSync(formulaEnginePath, 'utf8');
  const hasReference = /actionEngine|ActionEngine|workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source);
  noAutoExecute = !hasReference;
  autoExecuteDetail = hasReference ? 'action/workflow/render reference found' : 'clean';
} catch (err) {
  autoExecuteDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-14 — does not execute Action/Workflow/Render', noAutoExecute, autoExecuteDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/formula/formula.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-14 — Formula Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-14 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
