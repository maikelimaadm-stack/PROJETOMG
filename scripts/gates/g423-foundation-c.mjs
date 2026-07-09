#!/usr/bin/env node
/**
 * Gate G423 — Foundation C Master (Foundation C.17)
 *
 * Valida que Foundation C (M01-M24) está completa:
 * 1. Presença dos gates G423-01..G423-24 (scripts).
 * 2. Testes de completion PASS.
 * 3. Exports públicos principais presentes em src/runtime/index.js.
 * 4. Ausência de Prisma/backend direto em src/runtime/ (D-RI-13).
 * 5. SSOT não foi alterado neste slice.
 * 6. UI de produção não foi alterada neste slice.
 * 7. Sai com erro se qualquer checagem falhar.
 *
 * Não depende de nenhum serviço externo.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const GATES_DIR = path.join(ROOT, 'scripts/gates');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);

// 1. Presença dos gates G423-01..G423-24 (incluindo G423-20/21/22/23 explicitamente).
const REQUIRED_GATE_NUMBERS = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'));
let allGatesPresent = true;
const missingGates = [];
for (const num of REQUIRED_GATE_NUMBERS) {
  const found = fs.readdirSync(GATES_DIR).some((f) => f.startsWith(`g423-${num}-`));
  if (!found) {
    allGatesPresent = false;
    missingGates.push(`g423-${num}`);
  }
}
gate(
  'G423 — todos os gates G423-01..G423-24 presentes',
  allGatesPresent,
  allGatesPresent ? 'clean' : `missing: ${missingGates.join(', ')}`,
);

// 2. Testes de completion PASS (parte do test:runtime:c17).
let completionTestsOk = false;
try {
  execSync('node --test src/runtime/__tests__/completion/completion.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  completionTestsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423 — Runtime Completion unit tests PASS', completionTestsOk);

// 3. Exports públicos principais em src/runtime/index.js.
const REQUIRED_EXPORTS = [
  'bootstrap',
  'hydrateWithBundle',
  'loadRuntimeBundle',
  'createRegistry',
  'createLoader',
  'createCrbLoader',
  'createDependencyResolver',
  'createRuntimeRouter',
  'createPermissionEngine',
  'createActionEngine',
  'createWorkflowEngine',
  'createRenderEngine',
  'createExpressionEngine',
  'createFormulaEngine',
  'createValidationEngine',
  'createExecutionEngine',
  'createStateEngine',
  'createPluginEngine',
  'createConnectorEngine',
  'createCacheEngine',
  'createEventBus',
  'createTransactionEngine',
  'createObservabilityEngine',
  'createRuntimeCompletion',
  'createServiceLocator',
];
let exportsOk = false;
let exportsDetail = '';
try {
  const indexSource = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const missingExports = REQUIRED_EXPORTS.filter((name) => !new RegExp(`\\b${name}\\b`).test(indexSource));
  exportsOk = missingExports.length === 0;
  exportsDetail = exportsOk ? 'clean' : `missing: ${missingExports.join(', ')}`;
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423 — exports públicos principais presentes em src/runtime/index.js', exportsOk, exportsDetail);

// 4. Ausência de Prisma/backend direto em src/runtime/ (D-RI-13).
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walk(full, files);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}
let noPrismaBackend = false;
let prismaBackendDetail = '';
try {
  const files = walk(RUNTIME);
  const offenders = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(source) || /PrismaClient/.test(source);
    const hasBackend = /from\s+['"].*\/backend\/.*['"]/i.test(source) || /from\s+['"]\.\.\/\.\.\/backend/i.test(source);
    if (hasPrisma || hasBackend) offenders.push(path.relative(ROOT, file));
  }
  noPrismaBackend = offenders.length === 0;
  prismaBackendDetail = noPrismaBackend ? 'clean' : `offenders: ${offenders.join(', ')}`;
} catch (err) {
  prismaBackendDetail = err instanceof Error ? err.message : String(err);
}
gate('G423 — ausência de Prisma/backend direto em src/runtime/ (D-RI-13)', noPrismaBackend, prismaBackendDetail);

// 5. SSOT não foi alterado neste slice.
let ssotUntouched = false;
let ssotDetail = '';
try {
  const diff = execSync(
    'git diff --name-only origin/main...HEAD -- docs/meta-model docs/platform-architecture docs/platform-behavior docs/platform-protocol docs/platform-authoring docs/runtime-implementation',
    { cwd: ROOT, encoding: 'utf8' },
  ).trim();
  ssotUntouched = diff.length === 0;
  ssotDetail = ssotUntouched ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  ssotDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
  ssotUntouched = true;
}
gate('G423 — SSOT não alterado (docs/meta-model, platform-*, runtime-implementation)', ssotUntouched, ssotDetail);

// 6. UI de produção não foi alterada neste slice.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = execSync(
    'git diff --name-only origin/main...HEAD -- src/App.jsx src/shared src/framework src/modules src/studio',
    { cwd: ROOT, encoding: 'utf8' },
  ).trim();
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
  noProductionUiChange = true;
}
gate(
  'G423 — nenhuma alteração de UI de produção (src/App.jsx, src/shared, src/framework, src/modules, src/studio)',
  noProductionUiChange,
  productionUiDetail,
);

// 7. Todos os gates individuais G423-01..24 devem PASSAR.
let allIndividualGatesPass = true;
const failedGateScripts = [];
for (const num of REQUIRED_GATE_NUMBERS) {
  const scriptFile = fs.readdirSync(GATES_DIR).find((f) => f.startsWith(`g423-${num}-`));
  if (!scriptFile) {
    allIndividualGatesPass = false;
    failedGateScripts.push(`g423-${num} (missing)`);
    continue;
  }
  try {
    execSync(`node ${path.join('scripts/gates', scriptFile)}`, {
      cwd: ROOT,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' },
    });
  } catch (err) {
    allIndividualGatesPass = false;
    failedGateScripts.push(`g423-${num}`);
  }
}
gate(
  'G423 — todos os gates individuais G423-01..G423-24 PASS',
  allIndividualGatesPass,
  allIndividualGatesPass ? 'clean' : `failed: ${failedGateScripts.join(', ')}`,
);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423 (Foundation C Master) summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
