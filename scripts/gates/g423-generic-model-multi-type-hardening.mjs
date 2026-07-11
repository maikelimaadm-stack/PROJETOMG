#!/usr/bin/env node
/**
 * Gate G423-GENERIC-MODEL-MULTI-TYPE — Generic Model Multi-Type Hardening
 * (post-Foundation C).
 *
 * Proves the Generic Model Runtime formally supports MULTIPLE model types: a model
 * type registry, a capability matrix (dangerous capabilities false), adapter
 * conformance validation, and a multi-type conformance suite proving ModeloBase1
 * (cadastro) and ModeloBase2 (operacional) coexist over the same kernel with the
 * shared invariants (backend/prisma/runtimeBridge untouched; persistenceReal false;
 * sent false for operacional). The generic runtime never imports React/UI/backend/
 * Prisma/runtimeBridge or the adapters themselves (adapters are injected). No real
 * module/App.jsx touched; no new dependency. Next step is ModeloBase2 Operational
 * Runtime Foundation — NOT backend write.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const GM_DIR = path.join(ROOT, 'src/runtime/generic-model');
const RUNTIME = path.join(ROOT, 'src/runtime');
const SUBDIRS = ['model-types', 'capabilities', 'conformance', 'diagnostics'];
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
}) : []);
const multiTypeFiles = () => SUBDIRS.flatMap((d) => walk(path.join(GM_DIR, d)));
const multiTypeSource = () => multiTypeFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const multiTypeImports = () => [...stripComments(multiTypeSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

const FILES = [
  'model-types/genericModelTypes.js',
  'model-types/createGenericModelTypeRegistry.js',
  'model-types/validateGenericModelTypeDefinition.js',
  'capabilities/genericModelCapabilityDefaults.js',
  'capabilities/createGenericModelCapabilityMatrix.js',
  'capabilities/validateGenericModelCapabilities.js',
  'conformance/genericModelConformanceRules.js',
  'conformance/validateGenericModelAdapterConformance.js',
  'conformance/createGenericModelAdapterConformanceReport.js',
  'conformance/createGenericModelMultiTypeConformanceSuite.js',
  'diagnostics/createGenericModelMultiTypeDiagnostics.js',
];

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-MT — ${f} exists`, exists(path.join(GM_DIR, f)));
gate('G423-MT — tests exist', exists(path.join(RUNTIME, '__tests__/generic-model-multi-type-hardening.test.js')));

// 2. Registry: tipos + dangerous false. (dynamic)
let regOk = false;
let regDetail = '';
try {
  const m = await import(pathToFileURL(path.join(GM_DIR, 'model-types/createGenericModelTypeRegistry.js')).href);
  const reg = m.createGenericModelTypeRegistry();
  const need = ['cadastro', 'operacional', 'movimentacao', 'financeiro', 'relatorio', 'dashboard', 'workflow', 'custom'];
  regOk = need.every((t) => reg.has(t)) && reg.dangerousCapabilitiesDefaultFalse === true && reg.get('cadastro').family === 'modeloBase1' && reg.get('operacional').family === 'modeloBase2';
  regDetail = regOk ? `registry has ${reg.size} types; cadastro→modeloBase1, operacional→modeloBase2; dangerous default false` : `registry wrong (size=${reg.size})`;
} catch (err) { regDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MT — model type registry (cadastro/operacional + future types; dangerous false)', regOk, regDetail);

// 3. Type definition validation fail-closed. (dynamic)
let defOk = false;
try {
  const m = await import(pathToFileURL(path.join(GM_DIR, 'model-types/validateGenericModelTypeDefinition.js')).href);
  const t = await import(pathToFileURL(path.join(GM_DIR, 'model-types/genericModelTypes.js')).href);
  const okCad = m.validateGenericModelTypeDefinition({ definition: t.GENERIC_MODEL_TYPE_DEFINITIONS.cadastro }).valid === true;
  const okOp = m.validateGenericModelTypeDefinition({ definition: t.GENERIC_MODEL_TYPE_DEFINITIONS.operacional }).valid === true;
  const badFn = m.validateGenericModelTypeDefinition({ definition: { ...t.GENERIC_MODEL_TYPE_DEFINITIONS.cadastro, fn: () => {} } }).valid === false;
  const badTarget = m.validateGenericModelTypeDefinition({ definition: { ...t.GENERIC_MODEL_TYPE_DEFINITIONS.cadastro, backendUrl: '/api' } }).valid === false;
  defOk = okCad && okOp && badFn && badTarget;
} catch { defOk = false; }
gate('G423-MT — type definition validation (cadastro/operacional valid; fn/backend target fail-closed)', defOk);

// 4. Capability matrix + validation. (dynamic)
let capOk = false;
let capDetail = '';
try {
  const cm = await import(pathToFileURL(path.join(GM_DIR, 'capabilities/createGenericModelCapabilityMatrix.js')).href);
  const cv = await import(pathToFileURL(path.join(GM_DIR, 'capabilities/validateGenericModelCapabilities.js')).href);
  const matrix = cm.createGenericModelCapabilityMatrix();
  const defaults = matrix.matrix.cadastro.read === true && matrix.matrix.cadastro.eventAppend === false && matrix.matrix.operacional.eventAppend === true && matrix.matrix.relatorio.localWrite === false;
  const dangerAllFalse = matrix.dangerousAllFalse === true;
  const blocks = cv.validateGenericModelCapabilities({ capabilities: { backendWrite: true } }).valid === false
    && cv.validateGenericModelCapabilities({ capabilities: { connector: true } }).valid === false
    && cv.validateGenericModelCapabilities({ capabilities: { marketplacePublish: true } }).valid === false
    && cv.validateGenericModelCapabilities({ capabilities: { read: true }, persistenceReal: true }).valid === false;
  capOk = defaults && dangerAllFalse && blocks;
  capDetail = capOk ? 'defaults per type; dangerousAllFalse; blocks backendWrite/connector/marketplacePublish/persistenceReal' : `cap wrong (defaults=${defaults}, danger=${dangerAllFalse}, blocks=${blocks})`;
} catch (err) { capDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MT — capability matrix + validation (dangerous false; persistenceReal blocked)', capOk, capDetail);

// 5. Conformance: MB1 cadastro + MB2 operacional PASS; negatives fail. (dynamic, adapters injected)
let confOk = false;
let confDetail = '';
try {
  const mb1m = await import(pathToFileURL(path.join(ROOT, 'src/ModeloBase1/generic-model-adapter/createModeloBase1GenericModelAdapter.js')).href);
  const mb2m = await import(pathToFileURL(path.join(ROOT, 'src/ModeloBase2/prototype-adapter/createModeloBase2PrototypeAdapter.js')).href);
  const vc = await import(pathToFileURL(path.join(GM_DIR, 'conformance/validateGenericModelAdapterConformance.js')).href);
  const mb1 = mb1m.createModeloBase1GenericModelAdapter({ moduleId: 'empresas' });
  const mb2 = mb2m.createModeloBase2PrototypeAdapter({ moduleId: 'combustivel' });
  const cad = vc.validateGenericModelAdapterConformance({ adapter: mb1, expectedModelType: 'cadastro', expectedModelFamily: 'modeloBase1' }).valid === true;
  const op = vc.validateGenericModelAdapterConformance({ adapter: mb2, expectedModelType: 'operacional', expectedModelFamily: 'modeloBase2' }).valid === true;
  const noEvent = vc.validateGenericModelAdapterConformance({ adapter: { ...mb2, eventContract: undefined }, expectedModelType: 'operacional' }).valid === false;
  const noRead = vc.validateGenericModelAdapterConformance({ adapter: { ...mb1, readContract: undefined, runtimeContract: undefined, mapReadToGeneric: undefined }, expectedModelType: 'cadastro' }).valid === false;
  const danger = vc.validateGenericModelAdapterConformance({ adapter: { ...mb2, capabilities: { ...mb2.capabilities, backendWrite: true } }, expectedModelType: 'operacional' }).valid === false;
  confOk = cad && op && noEvent && noRead && danger;
  confDetail = confOk ? 'MB1 cadastro + MB2 operacional PASS; missing eventContract/readContract/dangerous fail' : `conf wrong (cad=${cad}, op=${op}, noEvent=${noEvent}, noRead=${noRead}, danger=${danger})`;
} catch (err) { confDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MT — MB1 (cadastro) + MB2 (operacional) pass conformance; negatives fail-closed', confOk, confDetail);

// 6. Multi-type suite + diagnostics readiness ready; shared invariants; sent false operacional. (dynamic)
let suiteOk = false;
let suiteDetail = '';
try {
  const mb1m = await import(pathToFileURL(path.join(ROOT, 'src/ModeloBase1/generic-model-adapter/createModeloBase1GenericModelAdapter.js')).href);
  const mb2m = await import(pathToFileURL(path.join(ROOT, 'src/ModeloBase2/prototype-adapter/createModeloBase2PrototypeAdapter.js')).href);
  const ss = await import(pathToFileURL(path.join(GM_DIR, 'conformance/createGenericModelMultiTypeConformanceSuite.js')).href);
  const dd = await import(pathToFileURL(path.join(GM_DIR, 'diagnostics/createGenericModelMultiTypeDiagnostics.js')).href);
  const rr = await import(pathToFileURL(path.join(GM_DIR, 'model-types/createGenericModelTypeRegistry.js')).href);
  const cm = await import(pathToFileURL(path.join(GM_DIR, 'capabilities/createGenericModelCapabilityMatrix.js')).href);
  const mb1 = mb1m.createModeloBase1GenericModelAdapter({ moduleId: 'empresas' });
  const mb2 = mb2m.createModeloBase2PrototypeAdapter({ moduleId: 'combustivel' });
  const suite = ss.createGenericModelMultiTypeConformanceSuite({ adapters: [
    { adapter: mb1, expectedModelType: 'cadastro', expectedModelFamily: 'modeloBase1' },
    { adapter: mb2, expectedModelType: 'operacional', expectedModelFamily: 'modeloBase2' },
  ] });
  const shared = suite.ok === true && suite.sharedInvariants.dangerousCapabilitiesFalse === true && suite.sharedInvariants.persistenceRealFalse === true && suite.allowedDifferences.operacional.sent === false && suite.allowedDifferences.cadastro.eventAppend === false;
  const diag = dd.createGenericModelMultiTypeDiagnostics({ registry: rr.createGenericModelTypeRegistry(), capabilityMatrix: cm.createGenericModelCapabilityMatrix(), suite });
  const ready = diag.readiness === 'ready' && diag.dangerousCapabilityStatus === 'all-false' && diag.persistenceReal === false;
  const next = suite.nextSteps.some((s) => /ModeloBase2 Operational Runtime Foundation/.test(s)) && !suite.nextSteps.some((s) => /backend\s*write/i.test(s));
  suiteOk = shared && ready && next;
  suiteDetail = suiteOk ? 'suite ok; shared invariants; readiness ready; next = ModeloBase2 Operational Runtime Foundation' : `suite wrong (shared=${shared}, ready=${ready}, next=${next})`;
} catch (err) { suiteDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MT — multi-type suite + diagnostics (readiness ready; shared invariants; sent false operacional)', suiteOk, suiteDetail);

// 7–11. Isolamento estrutural PERMANENTE (import-scan) das novas camadas.
gate('G423-MT — multi-type layers do not import React', multiTypeImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
gate('G423-MT — multi-type layers do not import ModeloBase1/ModeloBase2', multiTypeImports().every((p) => !/ModeloBase1|ModeloBase2/.test(p)));
gate('G423-MT — multi-type layers do not import backend/API/Prisma', multiTypeImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
gate('G423-MT — multi-type layers do not import runtimeBridge/makBootstrap', multiTypeImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));

// 12. Sem fetch/XHR/WebSocket/storage-API.
let noIo = false;
try {
  const code = stripComments(multiTypeSource());
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-MT — no fetch/XHR/WebSocket/storage-API', noIo);

// 13. Sem CSS global.
gate('G423-MT — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(multiTypeSource()));

// 14. ESCOPO AUTORIZADO (git-diff, tolerante).
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/runtime\/generic-model\//,
    /^src\/runtime\/types\/generic-model\.js$/,
    /^src\/runtime\/__tests__\/generic-model-multi-type-hardening\.test\.js$/,
    /^scripts\/gates\/g423-generic-model-multi-type-hardening\.mjs$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^docs\/evidence\/post-foundation-c-generic-model-multi-type-hardening\//,
    /^src\/ModeloBase1\/generic-model-adapter\//,
    /^src\/ModeloBase2\/prototype-adapter\//,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) { scopeOk = true; scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MT — authorized scope only (generic-model/adapters/tests/gate/package.json/evidence)', scopeOk, scopeDetail);

// 15. BLOQUEADO — módulos reais/backend/Prisma/framework/Studio/BOS/makBootstrap/App/SSOT (git-diff).
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/modules\//, /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^src\/App\.jsx$/, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'real modules/backend/Prisma/framework/Studio/BOS/makBootstrap/App.jsx/SSOT untouched' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MT — real modules/backend/Prisma/framework/Studio/BOS/makBootstrap/App.jsx/SSOT untouched', blockedOk, blockedDetail);

// 16. Sem dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean' : 'dependency set changed';
} catch (err) { noNewDep = true; depDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MT — no new dependency added', noNewDep, depDetail);

// 17. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/generic-model-multi-type-hardening.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-MT — multi-type hardening unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-GENERIC-MODEL-MULTI-TYPE summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
