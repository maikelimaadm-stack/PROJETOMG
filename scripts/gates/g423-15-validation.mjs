#!/usr/bin/env node
/**
 * Gate G423-15 — M15 Validation Engine (Foundation C.10)
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

const validationEnginePath = path.join(RUNTIME, 'core/validation/validationEngine.js');

gate('G423-15 — ValidationEngine module exists', exists(validationEnginePath));
gate('G423-15 — ValidationError module exists', exists(path.join(RUNTIME, 'core/validation/errors.js')));
gate('G423-15 — Validation types exist', exists(path.join(RUNTIME, 'types/validation.js')));
gate('G423-15 — Validation tests exist', exists(path.join(RUNTIME, '__tests__/validation/validation.test.js')));

let exportsOk = false;
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createValidationEngine/.test(indexSource) && /ValidationError/.test(indexSource);
} catch {
  exportsOk = false;
}
gate('G423-15 — createValidationEngine/ValidationError exported from runtime index', exportsOk);

let usesExpressionEngine = false;
let usesDetail = '';
try {
  const source = fs.readFileSync(validationEnginePath, 'utf8');
  usesExpressionEngine = /expression\/expressionEngine\.js/.test(source) && /_expressionEngine/.test(source);
  usesDetail = usesExpressionEngine ? 'delegates custom-rule evaluation to ExpressionEngine' : 'no ExpressionEngine delegation found';
} catch (err) {
  usesDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-15 — ValidationEngine uses ExpressionEngine for custom rules (no reimplementation)', usesExpressionEngine, usesDetail);

let noEvalOrFunction = false;
let evalDetail = '';
try {
  const source = fs.readFileSync(validationEnginePath, 'utf8');
  const hasEval = /\beval\s*\(/.test(source);
  const hasNewFunction = /new\s+Function\s*\(/.test(source);
  noEvalOrFunction = !hasEval && !hasNewFunction;
  evalDetail = hasEval ? 'eval() found' : hasNewFunction ? 'new Function() found' : 'clean';
} catch (err) {
  evalDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-15 — no eval()/new Function() in core/validation/', noEvalOrFunction, evalDetail);

let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const source = fs.readFileSync(validationEnginePath, 'utf8');
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(source);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-15 — no direct Prisma/backend import in core/validation/ (D-RI-13)', noForbiddenDeps, forbiddenDetail);

let noAutoExecute = false;
let autoExecuteDetail = '';
try {
  const source = fs.readFileSync(validationEnginePath, 'utf8');
  const hasReference = /actionEngine|ActionEngine|workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source);
  noAutoExecute = !hasReference;
  autoExecuteDetail = hasReference ? 'action/workflow/render reference found' : 'clean';
} catch (err) {
  autoExecuteDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-15 — does not execute Action/Workflow/Render', noAutoExecute, autoExecuteDetail);

let unknownRuleFailsClosed = false;
let unknownRuleDetail = '';
try {
  const mod = await import(pathToFileURL(validationEnginePath).href);
  const { createValidationEngine } = mod;
  const registryModule = await import(pathToFileURL(path.join(RUNTIME, 'core/registry/registryManager.js')).href);
  const registry = registryModule.createRegistry();
  registry.freeze();
  const engine = createValidationEngine({ registry });
  try {
    engine.validateSync([{ rule: 'unknown_rule_xyz' }], 'x');
    unknownRuleFailsClosed = false;
    unknownRuleDetail = 'unknown rule did not throw — silent pass risk';
  } catch (err) {
    unknownRuleFailsClosed = err && err.code === 'MAK-L3-VALIDATION-003';
    unknownRuleDetail = unknownRuleFailsClosed ? 'unknown rule throws ValidationError as expected' : `unexpected error: ${err && err.message}`;
  }
} catch (err) {
  unknownRuleDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-15 — unknown rule never silently passes', unknownRuleFailsClosed, unknownRuleDetail);

let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/validation/validation.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-15 — Validation Engine unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-15 summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
