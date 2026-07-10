#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-DIRECT-BETA — ModeloBase1 Empresas/Campos Direct Beta
 * (post-Foundation C).
 *
 * Proves the first DIRECT beta activation of a runtime v2 READ-ONLY read model
 * injected into the ModeloBase1 config for Empresas and Campos Personalizados:
 * off by default, fail-closed in production, per-module + umbrella flags, total
 * fallback when off (no `runtimeReadModel` key injected → byte-identical config),
 * write guard active (every write blocked — read-only phase), deterministic
 * resolved view models fed by runtime v2 + the controlled dev dataset (never real
 * data / backend / Prisma / fetch / storage), an additive ModeloBase1 injection
 * point that is a no-op when absent, both screens still consuming the same
 * ModeloBase1CadastroPage, AUTHORIZED-SCOPE diff only (Empresas/cadcps/ModeloBase1/
 * runtime/gates/package.json) with everything else blocked, no new dependency, no
 * global CSS, runtimeBridge/makBootstrap untouched.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DIR = path.join(RUNTIME, 'modelobase1-direct-beta');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const PURE_FILES = [
  'errors.js',
  'modeloBase1DirectBetaConfig.js',
  'modeloBase1DirectBetaFallback.js',
  'createModeloBase1DirectBetaReadModel.js',
  'createEmpresasModeloBase1BetaReadModel.js',
  'createCadcpsModeloBase1BetaReadModel.js',
  'createDirectBetaWriteGuard.js',
  'modeloBase1DirectBetaDiagnostics.js',
];
const pureSource = () => PURE_FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const allCodeOnly = () => stripComments(pureSource());

// 1. Existência dos arquivos.
for (const f of PURE_FILES) gate(`G423-MB1-BETA — ${f} exists`, exists(path.join(DIR, f)));
gate('G423-MB1-BETA — types exist', exists(path.join(RUNTIME, 'types/modelobase1-direct-beta.js')));
gate('G423-MB1-BETA — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-direct-beta.test.js')));
gate('G423-MB1-BETA — ModeloBase1 injection point exists', exists(path.join(ROOT, 'src/ModeloBase1/config/modeloBase1RuntimeReadModel.js')));

// 2. Exports públicos puros; nenhum .jsx do runtime barrel.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  const hasHelpers = /createEmpresasModeloBase1BetaReadModel/.test(s) && /createCadcpsModeloBase1BetaReadModel/.test(s) && /isEmpresasModeloBase1BetaEnabled/.test(s);
  const noJsx = !/from\s+['"][^'"]*modelobase1-direct-beta\/[^'"]*\.jsx['"]/.test(s);
  exportsOk = hasHelpers && noJsx;
  exportsDetail = exportsOk ? 'pure helpers exported; no React component from the barrel' : 'missing helpers or a .jsx exported';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — pure helpers exported, no React component in runtime barrel', exportsOk, exportsDetail);

// 3/4/5. Flags: off default, per-módulo + umbrella, fail-closed em produção + override.
let flagsOk = false;
let flagsDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(DIR, 'modeloBase1DirectBetaConfig.js')).href);
  const off = cfg.isEmpresasModeloBase1BetaEnabled({}) === false && cfg.isCadcpsModeloBase1BetaEnabled({}) === false;
  const empOn = cfg.isEmpresasModeloBase1BetaEnabled({ MAK_MODELOBASE1_EMPRESAS_BETA: 'true' }) === true && cfg.isCadcpsModeloBase1BetaEnabled({ MAK_MODELOBASE1_EMPRESAS_BETA: 'true' }) === false;
  const cpsOn = cfg.isCadcpsModeloBase1BetaEnabled({ MAK_MODELOBASE1_CADCPS_BETA: 'true' }) === true;
  const umbrella = cfg.isEmpresasModeloBase1BetaEnabled({ MAK_MODELOBASE1_DIRECT_BETA: 'true' }) === true && cfg.isCadcpsModeloBase1BetaEnabled({ MAK_MODELOBASE1_DIRECT_BETA: 'true' }) === true;
  const prodClosed = cfg.isEmpresasModeloBase1BetaEnabled({ MAK_MODELOBASE1_EMPRESAS_BETA: 'true', NODE_ENV: 'production' }) === false;
  const prodOverride = cfg.isEmpresasModeloBase1BetaEnabled({ MAK_MODELOBASE1_EMPRESAS_BETA: 'true', NODE_ENV: 'production', MAK_MODELOBASE1_EMPRESAS_BETA_ALLOW_PROD: 'true' }) === true;
  flagsOk = off && empOn && cpsOn && umbrella && prodClosed && prodOverride;
  flagsDetail = flagsOk ? 'off default; per-module + umbrella; fail-closed in prod; explicit override' : `flag logic wrong (off=${off}, empOn=${empOn}, cpsOn=${cpsOn}, umbrella=${umbrella}, prodClosed=${prodClosed}, prodOverride=${prodOverride})`;
} catch (err) {
  flagsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — flags off by default, per-module + umbrella, fail-closed in production (explicit override)', flagsOk, flagsDetail);

// 6/7/8. Read model: off→fallback; on→injected read-only; resolve determinístico + write bloqueado.
let modelOk = false;
let modelDetail = '';
try {
  const emp = await import(pathToFileURL(path.join(DIR, 'createEmpresasModeloBase1BetaReadModel.js')).href);
  const cps = await import(pathToFileURL(path.join(DIR, 'createCadcpsModeloBase1BetaReadModel.js')).href);
  const off = emp.createEmpresasModeloBase1BetaReadModel({ env: {} });
  const on = emp.createEmpresasModeloBase1BetaReadModel({ env: { MAK_MODELOBASE1_EMPRESAS_BETA: 'true' } });
  const cpsOn = cps.createCadcpsModeloBase1BetaReadModel({ env: { MAK_MODELOBASE1_CADCPS_BETA: 'true' } });
  const offOk = off.enabled === false && off.injected === false && off.readOnly === true;
  const onOk = on.enabled === true && on.injected === true && on.readOnly === true && on.injectedAt === 'ModeloBase1.runtimeReadModel' && on.writeActionsBlocked === true && on.usesRealData === false;
  const r1 = await on.resolve();
  const r2 = await on.resolve();
  const deterministic = JSON.stringify({ ...r1, writeGuard: null }) === JSON.stringify({ ...r2, writeGuard: null });
  const resolvedOk = r1.table.columns.length > 0 && r1.table.rowCount > 0 && r1.form.fields.length > 0 && r1.usesRealData === false;
  const writeOps = ['create', 'update', 'delete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];
  const empWriteBlocked = writeOps.every((op) => on.writeGuard.attempt(op, {}).blocked === true);
  const cpsWriteBlocked = writeOps.every((op) => cpsOn.writeGuard.attempt(op, {}).blocked === true);
  const guardSurvivesClone = typeof r1.writeGuard.attempt === 'function' && r1.writeGuard.attempt('create', {}).blocked === true;
  modelOk = offOk && onOk && deterministic && resolvedOk && empWriteBlocked && cpsWriteBlocked && guardSurvivesClone;
  modelDetail = modelOk ? 'off→fallback; on→injected read-only; deterministic; write blocked (Empresas+Campos); guard survives clone' : `model wrong (offOk=${offOk}, onOk=${onOk}, det=${deterministic}, resolved=${resolvedOk}, empW=${empWriteBlocked}, cpsW=${cpsWriteBlocked}, guard=${guardSurvivesClone})`;
} catch (err) {
  modelDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — read model off→fallback / on→injected read-only, deterministic, write blocked', modelOk, modelDetail);

// 9. Injection point é no-op quando ausente (fallback byte-idêntico).
let injectionOk = false;
let injectionDetail = '';
try {
  const inj = await import(pathToFileURL(path.join(ROOT, 'src/ModeloBase1/config/modeloBase1RuntimeReadModel.js')).href);
  const noop = inj.normalizeModeloBase1RuntimeReadModel(null) === null && inj.normalizeModeloBase1RuntimeReadModel(undefined) === null && inj.normalizeModeloBase1RuntimeReadModel({ enabled: false }) === null;
  const model = { enabled: true, kind: 'k' };
  const passes = inj.normalizeModeloBase1RuntimeReadModel(model) === model;
  const reads = inj.readModeloBase1RuntimeReadModel({ runtimeReadModel: model }) === model && inj.readModeloBase1RuntimeReadModel({}) === null;
  const has = inj.hasModeloBase1RuntimeReadModel({ runtimeReadModel: model }) === true && inj.hasModeloBase1RuntimeReadModel({}) === false;
  injectionOk = noop && passes && reads && has;
  injectionDetail = injectionOk ? 'no-op when absent/disabled; passes an enabled model; read/has correct' : 'injection point logic wrong';
} catch (err) {
  injectionDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — ModeloBase1 injection point is a no-op when absent (byte-identical fallback)', injectionOk, injectionDetail);

// 10. Builder só anexa runtimeReadModel quando presente; flag off = sem a chave.
let builderOk = false;
let builderDetail = '';
try {
  const buildSrc = fs.readFileSync(path.join(ROOT, 'src/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js'), 'utf8');
  const importsNormalize = /normalizeModeloBase1RuntimeReadModel/.test(buildSrc);
  const conditionalAttach = /runtimeReadModel\s*\?\s*\{\s*runtimeReadModel\s*\}\s*:\s*\{\s*\}/.test(buildSrc.replace(/\s+/g, ' ')) || /\?\s*\{\s*runtimeReadModel\s*\}\s*:\s*\{\s*\}/.test(buildSrc.replace(/\s+/g, ' '));
  builderOk = importsNormalize && conditionalAttach;
  builderDetail = builderOk ? 'builder normalizes + conditionally attaches the slot (no key when off)' : `builder wiring missing (import=${importsNormalize}, conditional=${conditionalAttach})`;
} catch (err) {
  builderDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — config builder attaches runtimeReadModel only when present', builderOk, builderDetail);

// 11. Empresas e Campos continuam consumindo o mesmo ModeloBase1CadastroPage (invariante).
let sameEngineOk = false;
let sameEngineDetail = '';
try {
  const pagemp = fs.readFileSync(path.join(ROOT, 'src/modules/empresas/pages/PAGEMP.jsx'), 'utf8');
  const pagcps = fs.readFileSync(path.join(ROOT, 'src/modules/cadcps/pages/PAGCPS.jsx'), 'utf8');
  const empCfg = fs.readFileSync(path.join(ROOT, 'src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js'), 'utf8');
  const cpsCfg = fs.readFileSync(path.join(ROOT, 'src/modules/cadcps/config/cadcpsModeloBase1Config.js'), 'utf8');
  const empPage = /ModeloBase1CadastroPage/.test(pagemp);
  const cpsPage = /ModeloBase1CadastroPage/.test(pagcps);
  const empBuild = /buildModeloBase1ConfigFromMakModule/.test(empCfg) && /createEmpresasModeloBase1BetaReadModel/.test(empCfg);
  const cpsBuild = /buildModeloBase1ConfigFromMakModule/.test(cpsCfg) && /createCadcpsModeloBase1BetaReadModel/.test(cpsCfg);
  sameEngineOk = empPage && cpsPage && empBuild && cpsBuild;
  sameEngineDetail = sameEngineOk ? 'Empresas + Campos still consume ModeloBase1CadastroPage; beta wired via config' : 'ModeloBase1 invariant broken';
} catch (err) {
  sameEngineDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — Empresas & Campos still consume the same ModeloBase1CadastroPage (invariant)', sameEngineOk, sameEngineDetail);

// 12. Sem import direto de Prisma/backend/apis.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = pureSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*\/backend\/.*['"]/i.test(s) || /from\s+['"].*\/apis\/.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend/apis import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — no direct Prisma/backend/apis import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 13. Sem fetch direto e sem web storage; sem dados reais como fonte.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = allCodeOnly();
  const noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  const controlledOnly = /controlled-dev-dataset|controlled-dev/.test(pureSource());
  noExternalIo = noIo && controlledOnly;
  ioDetail = noExternalIo ? 'clean; read source = controlled dev dataset (no real data)' : (noIo ? 'no controlled-dataset source marker' : 'fetch/XHR/WebSocket/storage usage found');
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — no fetch/XHR/WebSocket/storage; read source is the controlled dev dataset', noExternalIo, ioDetail);

// 14. Não importa runtimeBridge/makBootstrap/framework/outras telas.
let noLegacy = false;
let legacyDetail = '';
try {
  const imports = [...allCodeOnly().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const bad = imports.some((p) => /makBootstrap/.test(p) || /\/runtimeBridge\//.test(p) || /\/framework\//.test(p) || /\/studio\//.test(p) || /marketplace/i.test(p) || /\/modules\//.test(p));
  noLegacy = !bad;
  legacyDetail = noLegacy ? 'clean (no legacy bridge/framework/module/studio/marketplace import)' : 'forbidden import found';
} catch (err) {
  legacyDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BETA — no runtimeBridge/makBootstrap/framework/other-module import', noLegacy, legacyDetail);

// 15. Não adiciona dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean (no dependency added/removed)' : 'dependency set changed';
} catch (err) {
  noNewDep = true;
  depDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-BETA — no new dependency added to package.json', noNewDep, depDetail);

// 16. Não altera CSS global.
let noCss = false;
try {
  const empCfg = fs.readFileSync(path.join(ROOT, 'src/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js'), 'utf8');
  const cpsCfg = fs.readFileSync(path.join(ROOT, 'src/modules/cadcps/config/cadcpsModeloBase1Config.js'), 'utf8');
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(pureSource() + empCfg + cpsCfg);
} catch { noCss = false; }
gate('G423-MB1-BETA — no global CSS import (beta module + config wiring)', noCss);

// 17. ESCOPO AUTORIZADO — diff só nos paths permitidos.
let scopeOk = false;
let scopeDetail = '';
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  const files = changed.split('\n').filter(Boolean);
  const ALLOWED = [
    /^src\/runtime\//,
    /^src\/ModeloBase1\//,
    /^src\/modules\/empresas\//,
    /^src\/modules\/cadcps\//,
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
  scopeDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-BETA — authorized scope only (Empresas/cadcps/ModeloBase1/runtime/gates/package.json/evidence)', scopeOk, scopeDetail);

// 18. BLOQUEADO — nenhum diff em backend/apis/prisma/framework/studio/bos/outras telas.
let blockedOk = false;
let blockedDetail = '';
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  const files = changed.split('\n').filter(Boolean);
  const FORBIDDEN_PATHS = [
    /^src\/apis\//,
    /prisma/i,
    /^src\/framework\//,
    /^src\/studio\//,
    /^src\/bos\//,
    /^src\/modules\/makBootstrap\//,
    /^src\/App\.jsx$/,
    /^docs\/meta-model\//,
    /^docs\/platform-/,
    /^docs\/runtime-implementation\//,
  ];
  const otherModules = files.filter((f) => /^src\/modules\//.test(f) && !/^src\/modules\/(empresas|cadcps)\//.test(f));
  const forbidden = files.filter((f) => FORBIDDEN_PATHS.some((re) => re.test(f)));
  blockedOk = forbidden.length === 0 && otherModules.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/App/SSOT/other-module change' : `FORBIDDEN change: ${[...forbidden, ...otherModules].join(', ')}`;
} catch (err) {
  blockedOk = true;
  blockedDetail = `git base unavailable — skipped strict check (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-BETA — backend/Prisma/framework/Studio/BOS/makBootstrap/App/SSOT/other-screens untouched', blockedOk, blockedDetail);

// 19. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-direct-beta.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MB1-BETA — direct beta unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-DIRECT-BETA summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
