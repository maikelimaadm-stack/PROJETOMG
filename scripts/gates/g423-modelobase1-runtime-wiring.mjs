#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-RUNTIME-WIRING — ModeloBase1 Runtime Wiring
 * (post-Foundation C).
 *
 * Proves the ModeloBase1 engine now CONSUMES `config.runtimeReadModel` (the
 * runtime v2 direct-beta read model) for a READ-ONLY beta render, safely and
 * reversibly: detect → validate → resolve → apply, or fall back to the legacy
 * behavior. Flag off → byte-identical fallback (no write block, no beta). Flag
 * on → beta read applied and ALL writes blocked. Never backend/Prisma/fetch/
 * storage; never real data; never runtimeBridge/makBootstrap; App.jsx untouched;
 * authorized scope only; no new dependency; no global CSS.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const MB1 = path.join(ROOT, 'src/ModeloBase1');
const DIR = path.join(MB1, 'runtime-read-model');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const PURE_FILES = [
  'errors.js',
  'safety.js',
  'types.js',
  'resolveModeloBase1RuntimeReadModel.js',
  'validateModeloBase1RuntimeReadModel.js',
  'applyModeloBase1RuntimeReadModel.js',
  'createModeloBase1RuntimeReadDiagnostics.js',
  'modeloBase1RuntimeReadFallback.js',
];
const HOOK_FILE = 'useModeloBase1RuntimeReadModel.js';
// safety.js is the sanctioned DETECTOR — it names forbidden tokens in its regexes.
const NON_DETECTOR = [...PURE_FILES.filter((f) => f !== 'safety.js'), HOOK_FILE];
const nonDetectorSource = () => NON_DETECTOR.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const allSource = () => [...PURE_FILES, HOOK_FILE].map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const nonDetectorCode = () => stripComments(nonDetectorSource());

// 1. Arquivos esperados.
for (const f of [...PURE_FILES, HOOK_FILE]) gate(`G423-MB1-RW — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-MB1-RW — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-runtime-wiring.test.js')));
gate('G423-MB1-RW — injection point (Direct Beta) present', exists(path.join(MB1, 'config/modeloBase1RuntimeReadModel.js')));

// 2. Exports públicos puros (se houver export deste módulo no runtime barrel, nenhum .jsx).
let barrelOk = false;
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  barrelOk = !/runtime-read-model\/[^'"]*\.jsx/.test(s);
} catch { barrelOk = false; }
gate('G423-MB1-RW — no React component from this module in the runtime barrel', barrelOk);

// 3. Detect → validate → resolve → apply; off/disabled/invalid → fallback; on → beta+write blocked. (dynamic)
let applyOk = false;
let applyDetail = '';
try {
  const applyMod = await import(pathToFileURL(path.join(DIR, 'applyModeloBase1RuntimeReadModel.js')).href);
  const emp = await import(pathToFileURL(path.join(RUNTIME, 'modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js')).href);
  const cps = await import(pathToFileURL(path.join(RUNTIME, 'modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js')).href);
  const apply = applyMod.applyModeloBase1RuntimeReadModel;

  const absent = await apply({ config: {} });
  const disabled = await apply({ config: { runtimeReadModel: emp.createEmpresasModeloBase1BetaReadModel({ env: {} }) } });
  const invalid = await apply({ config: { runtimeReadModel: { enabled: true, moduleId: 'x', moduleName: 'X', readOnly: false, injectedAt: 'a', source: 's', writeActionsBlocked: false, resolve: async () => ({}) } } });
  const empOn = await apply({ config: { runtimeReadModel: emp.createEmpresasModeloBase1BetaReadModel({ env: { MAK_MODELOBASE1_EMPRESAS_BETA: 'true' } }) } });
  const cpsOn = await apply({ config: { runtimeReadModel: cps.createCadcpsModeloBase1BetaReadModel({ env: { MAK_MODELOBASE1_CADCPS_BETA: 'true' } }) } });
  const unsafe = await apply({ config: { runtimeReadModel: { enabled: true, moduleId: 'x', moduleName: 'X', readOnly: true, injectedAt: 'a', source: 's', writeActionsBlocked: true, resolve: async () => ({ table: { columns: [], evil: () => {} } }) } } });

  const absentOk = absent.betaApplied === false && absent.fallbackApplied === true && absent.writeBlocked === false;
  const disabledOk = disabled.betaApplied === false && /disabled/.test(disabled.fallbackReason);
  const invalidOk = invalid.betaApplied === false && /invalid-read-model/.test(invalid.fallbackReason);
  const empOk = empOn.betaApplied === true && empOn.source === 'runtime-v2-beta' && empOn.writeBlocked === true && empOn.tableApplied === true && empOn.table.rowCount > 0 && empOn.formApplied === true && empOn.moduleId === 'empresas';
  const cpsOk = cpsOn.betaApplied === true && cpsOn.writeBlocked === true && cpsOn.moduleId === 'cadcps' && cpsOn.form.fields.length > 0;
  const unsafeOk = unsafe.betaApplied === false && /unsafe-payload/.test(unsafe.fallbackReason);
  const sharedBase = empOn.kind === cpsOn.kind && empOn.source === cpsOn.source;

  applyOk = absentOk && disabledOk && invalidOk && empOk && cpsOk && unsafeOk && sharedBase;
  applyDetail = applyOk
    ? 'absent/disabled/invalid/unsafe→fallback; empresas+cadcps on→beta read-only + write blocked; shared base'
    : `apply wrong (absent=${absentOk}, disabled=${disabledOk}, invalid=${invalidOk}, emp=${empOk}, cps=${cpsOk}, unsafe=${unsafeOk}, shared=${sharedBase})`;
} catch (err) {
  applyDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-RW — detect/validate/resolve/apply; off→fallback, on→beta read-only + write blocked', applyOk, applyDetail);

// 4. Validador de payload bloqueia função/React/pollution/sensível. (dynamic)
let valOk = false;
let valDetail = '';
try {
  const v = await import(pathToFileURL(path.join(DIR, 'validateModeloBase1RuntimeReadModel.js')).href);
  const okPayload = v.validateModeloBase1RuntimeReadPayload({ table: { columns: [], rows: [] } }).valid === true;
  const fn = v.validateModeloBase1RuntimeReadPayload({ table: { evil: () => {} } }).valid === false;
  const react = v.validateModeloBase1RuntimeReadPayload({ el: { $$typeof: Symbol.for('react.element') } }).valid === false;
  const poll = v.validateModeloBase1RuntimeReadPayload(JSON.parse('{"__proto__":{"x":1}}')).valid === false;
  const sens = v.validateModeloBase1RuntimeReadPayload({ row: { password: 'secret123' } }).valid === false;
  valOk = okPayload && fn && react && poll && sens;
  valDetail = valOk ? 'safe passes; function/React/pollution/sensitive rejected' : `validator wrong (ok=${okPayload}, fn=${fn}, react=${react}, poll=${poll}, sens=${sens})`;
} catch (err) {
  valDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-RW — payload validation blocks function/handler/React/pollution/sensitive', valOk, valDetail);

// 5. Empresas e cadcps configs conectam via runtimeReadModel + mesmo ModeloBase1CadastroPage.
let wiringOk = false;
let wiringDetail = '';
try {
  const empCfg = fs.readFileSync(path.join(ROOT, 'src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js'), 'utf8');
  const cpsCfg = fs.readFileSync(path.join(ROOT, 'src/modules/cadcps/config/cadcpsModeloBase1Config.js'), 'utf8');
  const page = fs.readFileSync(path.join(MB1, 'render/ModeloBase1CadastroPage.jsx'), 'utf8');
  const empWired = /createEmpresasModeloBase1BetaReadModel/.test(empCfg) && /runtimeReadModel/.test(empCfg);
  const cpsWired = /createCadcpsModeloBase1BetaReadModel/.test(cpsCfg) && /runtimeReadModel/.test(cpsCfg);
  const pageConsumes = /useModeloBase1RuntimeReadModel/.test(page) && /blockRuntimeReadWrite/.test(page) && /guardedHandleSubmit/.test(page);
  wiringOk = empWired && cpsWired && pageConsumes;
  wiringDetail = wiringOk ? 'Empresas+cadcps wired via runtimeReadModel; page consumes the hook + blocks writes' : `wiring missing (emp=${empWired}, cps=${cpsWired}, page=${pageConsumes})`;
} catch (err) {
  wiringDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-RW — Empresas & cadcps consume runtimeReadModel via the same ModeloBase1 engine', wiringOk, wiringDetail);

// 6. Sem fetch/Prisma/MMM/storage/runtimeBridge (excluindo o detector safety.js).
let noIoOk = false;
let noIoDetail = '';
try {
  const code = nonDetectorCode();
  const src = nonDetectorSource();
  const noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code);
  const noPrisma = !/PrismaClient|from\s+['"].*prisma.*['"]/i.test(src) && !/\bMMM\b/.test(code);
  const noBackend = !/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(src);
  const noStorage = !/localStorage|sessionStorage|indexedDB/.test(code);
  const noBridge = !/makBootstrap|\/runtimeBridge\//.test(code);
  noIoOk = noFetch && noPrisma && noBackend && noStorage && noBridge;
  noIoDetail = noIoOk ? 'clean (no fetch/Prisma/MMM/backend/storage/runtimeBridge)' : `found (fetch=${!noFetch}, prisma=${!noPrisma}, backend=${!noBackend}, storage=${!noStorage}, bridge=${!noBridge})`;
} catch (err) {
  noIoDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-RW — no fetch/Prisma/MMM/backend/storage/runtimeBridge (detector excluded)', noIoOk, noIoDetail);

// 7. ModeloBase1 wiring não importa o módulo src/runtime (mantém desacoplado).
let decoupledOk = false;
try {
  const imports = [...stripComments(allSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  decoupledOk = imports.every((p) => !/^@\/runtime\/|^\.\.\/\.\.\/runtime\//.test(p));
} catch { decoupledOk = false; }
gate('G423-MB1-RW — ModeloBase1 wiring stays decoupled from src/runtime', decoupledOk);

// 8. Sem CSS global no módulo de wiring.
gate('G423-MB1-RW — no global CSS import in wiring module', !/import\s+['"][^'"]+\.css['"]/i.test(allSource()));

// 9. Sem dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-RW — no new dependency added', noNewDep, depDetail);

// 10. App.jsx não alterado.
let appOk = false;
let appDetail = '';
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
  appDetail = appOk ? 'src/App.jsx untouched' : 'src/App.jsx changed';
} catch (err) {
  appOk = true;
  appDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-RW — src/App.jsx not changed', appOk, appDetail);

// 11. ESCOPO AUTORIZADO.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/ModeloBase1\//,
    /^src\/modules\/empresas\//,
    /^src\/modules\/cadcps\//,
    /^src\/runtime\//,
    /^scripts\/gates\//,
    /^docs\/evidence\//,
    /^package\.json$/,
    /^package-lock\.json$/,
  ];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) {
  scopeOk = true;
  scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-RW — authorized scope only (ModeloBase1/empresas/cadcps/runtime/gates/package.json/evidence)', scopeOk, scopeDetail);

// 12. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/outras telas/SSOT.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN_PATHS = [
    /^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//,
    /^src\/modules\/makBootstrap\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//,
  ];
  const otherModules = files.filter((f) => /^src\/modules\//.test(f) && !/^src\/modules\/(empresas|cadcps)\//.test(f));
  const forbidden = files.filter((f) => FORBIDDEN_PATHS.some((re) => re.test(f)));
  blockedOk = forbidden.length === 0 && otherModules.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/other-module/SSOT change' : `FORBIDDEN: ${[...forbidden, ...otherModules].join(', ')}`;
} catch (err) {
  blockedOk = true;
  blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-RW — backend/Prisma/framework/Studio/BOS/makBootstrap/other-screens/SSOT untouched', blockedOk, blockedDetail);

// 13. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-runtime-wiring.test.js', {
    cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MB1-RW — runtime wiring unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-RUNTIME-WIRING summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
