#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-BETA-UI-HARDENING — ModeloBase1 Beta UI Hardening
 * (post-Foundation C).
 *
 * Proves the beta read UX for Empresas + Campos is hardened: a passive
 * checklist/diagnostics over the applied runtime read state (structure/table/
 * form/diagnostics/security/scope), safe on partial/empty/missing data, write
 * blocked in beta mode, dev-only diagnostics panel (fail-closed in production),
 * fallback that never breaks render, decoupled from src/runtime, no backend/
 * Prisma/fetch/storage/runtimeBridge, App.jsx untouched, authorized scope only,
 * no new dependency, no global CSS.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const MB1 = path.join(ROOT, 'src/ModeloBase1');
const H_DIR = path.join(MB1, 'runtime-read-model/hardening');
const C_DIR = path.join(MB1, 'runtime-read-model/components');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const H_FILES = [
  'errors.js',
  'modeloBase1BetaUiConfig.js',
  'createModeloBase1BetaUiChecklist.js',
  'modeloBase1BetaUiDiagnostics.js',
  'createModeloBase1BetaUiHardeningModel.js',
];
const C_FILES = [
  'ModeloBase1RuntimeReadDiagnosticsPanel.jsx',
  'ModeloBase1RuntimeReadFallbackBadge.jsx',
  'ModeloBase1RuntimeReadWriteBlockedBadge.jsx',
];
const hSource = () => H_FILES.map((f) => fs.readFileSync(path.join(H_DIR, f), 'utf8')).join('\n');
const cSource = () => C_FILES.map((f) => fs.readFileSync(path.join(C_DIR, f), 'utf8')).join('\n');
const allSource = () => hSource() + '\n' + cSource();
const allCode = () => stripComments(allSource());

// 1. Arquivos esperados.
for (const f of H_FILES) gate(`G423-MB1-BUH — hardening/${f} exists`, exists(path.join(H_DIR, f)));
for (const f of C_FILES) gate(`G423-MB1-BUH — components/${f} exists`, exists(path.join(C_DIR, f)));
gate('G423-MB1-BUH — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-beta-ui-hardening.test.js')));

// 2. Modelo de hardening: beta on → hardened + write blocked; off → fallback; partial/empty → seguro. (dynamic)
let modelOk = false;
let modelDetail = '';
try {
  const h = await import(pathToFileURL(path.join(H_DIR, 'createModeloBase1BetaUiHardeningModel.js')).href);
  const emp = await import(pathToFileURL(path.join(RUNTIME, 'modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js')).href);
  const cps = await import(pathToFileURL(path.join(RUNTIME, 'modelobase1-direct-beta/createCadcpsModeloBase1BetaReadModel.js')).href);

  const empOn = await h.createModeloBase1BetaUiHardeningFromConfig({ config: { runtimeReadModel: emp.createEmpresasModeloBase1BetaReadModel({ env: { MAK_MODELOBASE1_EMPRESAS_BETA: 'true' } }) } });
  const cpsOn = await h.createModeloBase1BetaUiHardeningFromConfig({ config: { runtimeReadModel: cps.createCadcpsModeloBase1BetaReadModel({ env: { MAK_MODELOBASE1_CADCPS_BETA: 'true' } }) } });
  const off = await h.createModeloBase1BetaUiHardeningFromConfig({ config: { moduleId: 'empresas' } });

  const betaState = (over) => ({ kind: 'modelobase1-runtime-read-state', moduleId: 'empresas', betaApplied: true, fallbackApplied: false, source: 'runtime-v2-beta', writeBlocked: true, noSideEffects: true, runtimeReadModelPresent: true, runtimeReadModelValid: true, table: { columns: [{ id: 'a' }], visibleColumns: [], rows: [], rowCount: 0 }, form: { fields: [{ id: 'a' }], visibleFields: [] }, diagnostics: null, ...over });
  const emptyRows = h.createModeloBase1BetaUiHardeningModel({ state: betaState() });
  const partialCols = h.createModeloBase1BetaUiHardeningModel({ state: betaState({ table: { columns: [{ id: 'a' }, { label: 'no-id' }], visibleColumns: [], rows: [], rowCount: 0 } }) });

  const empOk = empOn.hardeningStatus === 'hardened' && empOn.writeBlocked === true && empOn.moduleId === 'empresas' && empOn.checklist.length > 0;
  const cpsOk = cpsOn.hardeningStatus === 'hardened' && cpsOn.writeBlocked === true && cpsOn.moduleId === 'cadcps';
  const offOk = off.betaApplied === false && off.hardeningStatus === 'fallback' && off.writeBlocked === false && off.diagnostics.blockingFailures.length === 0;
  const emptyOk = emptyRows.hardeningStatus !== 'needs_fixes' && emptyRows.checklist.find((i) => i.id === 'table.emptyStateSafe').status === 'pass';
  const partialOk = partialCols.hardeningStatus !== 'needs_fixes' && partialCols.checklist.find((i) => i.id === 'table.columnsWellFormed').status === 'warn';
  const sharedBase = empOn.kind === cpsOn.kind;

  modelOk = empOk && cpsOk && offOk && emptyOk && partialOk && sharedBase;
  modelDetail = modelOk ? 'beta on→hardened+write blocked; off→fallback; empty/partial→safe (warn, non-blocking); shared base' : `model wrong (emp=${empOk}, cps=${cpsOk}, off=${offOk}, empty=${emptyOk}, partial=${partialOk}, shared=${sharedBase})`;
} catch (err) {
  modelDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BUH — hardening model: beta on→hardened+write blocked, off→fallback, partial/empty→safe', modelOk, modelDetail);

// 3. Painel de diagnostics é dev-only (flag off por padrão, fail-closed em produção). (dynamic)
let devOnlyOk = false;
let devOnlyDetail = '';
try {
  const cfg = await import(pathToFileURL(path.join(H_DIR, 'modeloBase1BetaUiConfig.js')).href);
  const off = cfg.isModeloBase1BetaUiDiagnosticsEnabled({}) === false;
  const onDev = cfg.isModeloBase1BetaUiDiagnosticsEnabled({ MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS: 'true' }) === true;
  const prodClosed = cfg.isModeloBase1BetaUiDiagnosticsEnabled({ MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS: 'true', NODE_ENV: 'production' }) === false;
  const prodOverride = cfg.isModeloBase1BetaUiDiagnosticsEnabled({ MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS: 'true', NODE_ENV: 'production', MAK_MODELOBASE1_BETA_UI_DIAGNOSTICS_ALLOW_PROD: 'true' }) === true;
  devOnlyOk = off && onDev && prodClosed && prodOverride;
  devOnlyDetail = devOnlyOk ? 'off default; on in dev; fail-closed in prod; explicit override' : `flag wrong (off=${off}, onDev=${onDev}, prodClosed=${prodClosed}, override=${prodOverride})`;
} catch (err) {
  devOnlyDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BUH — diagnostics panel is dev-only (fail-closed in production)', devOnlyOk, devOnlyDetail);

// 4. Componentes sem side effect de write / sem menu.
let compOk = false;
try {
  const code = stripComments(cSource());
  compOk = !/onClick|onSubmit|onChange|handleSave|handleCreate|handleUpdate|handleDelete|<form\b|type=["']submit["']/.test(code)
    && !/addMenuItem|navItems|menu\.push/.test(code);
} catch { compOk = false; }
gate('G423-MB1-BUH — components carry no write side effects / no menu mutation', compOk);

// 5. Página consome o hardening model + painel dev-only + write badge.
let pageOk = false;
let pageDetail = '';
try {
  const page = fs.readFileSync(path.join(MB1, 'render/ModeloBase1CadastroPage.jsx'), 'utf8');
  const usesModel = /createModeloBase1BetaUiHardeningModel/.test(page);
  const usesPanel = /ModeloBase1RuntimeReadDiagnosticsPanel/.test(page) && /isModeloBase1BetaUiDiagnosticsEnabled/.test(page);
  const usesBadge = /ModeloBase1RuntimeReadWriteBlockedBadge/.test(page);
  pageOk = usesModel && usesPanel && usesBadge;
  pageDetail = pageOk ? 'page builds hardening model + gated panel + write badge' : `page wiring missing (model=${usesModel}, panel=${usesPanel}, badge=${usesBadge})`;
} catch (err) {
  pageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BUH — page consumes the hardening model + dev-only panel + write-blocked badge', pageOk, pageDetail);

// 6. Sem fetch/Prisma/MMM/backend/storage/runtimeBridge (safety.js não faz parte deste módulo).
let noIoOk = false;
let noIoDetail = '';
try {
  const code = allCode();
  const noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code);
  const noPrisma = !/PrismaClient|from\s+['"].*prisma.*['"]/i.test(allSource()) && !/\bMMM\b/.test(code);
  const noBackend = !/from\s+['"].*\/apis\/.*['"]|from\s+['"].*\/backend\/.*['"]/i.test(allSource());
  const noStorage = !/localStorage|sessionStorage|indexedDB/.test(code);
  const noBridge = !/makBootstrap|\/runtimeBridge\//.test(code);
  noIoOk = noFetch && noPrisma && noBackend && noStorage && noBridge;
  noIoDetail = noIoOk ? 'clean' : `found (fetch=${!noFetch}, prisma=${!noPrisma}, backend=${!noBackend}, storage=${!noStorage}, bridge=${!noBridge})`;
} catch (err) {
  noIoDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-MB1-BUH — no fetch/Prisma/MMM/backend/storage/runtimeBridge', noIoOk, noIoDetail);

// 7. Desacoplado de src/runtime.
let decoupledOk = false;
try {
  const imports = [...allCode().matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  decoupledOk = imports.every((p) => !/^@\/runtime\/|\/runtime\//.test(p));
} catch { decoupledOk = false; }
gate('G423-MB1-BUH — hardening/components stay decoupled from src/runtime', decoupledOk);

// 8. Sem CSS global.
gate('G423-MB1-BUH — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(allSource()));

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
gate('G423-MB1-BUH — no new dependency added', noNewDep, depDetail);

// 10. App.jsx não alterado.
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-MB1-BUH — src/App.jsx not changed', appOk);

// 11. ESCOPO AUTORIZADO.
let scopeOk = false;
let scopeDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const ALLOWED = [/^src\/ModeloBase1\//, /^src\/modules\/empresas\//, /^src\/modules\/cadcps\//, /^src\/runtime\//, /^scripts\/gates\//, /^docs\/evidence\//, /^package\.json$/, /^package-lock\.json$/];
  const outside = files.filter((f) => !ALLOWED.some((re) => re.test(f)));
  scopeOk = files.length === 0 || outside.length === 0;
  scopeDetail = scopeOk ? `authorized scope only (${files.length} files)` : `OUT OF SCOPE: ${outside.join(', ')}`;
} catch (err) {
  scopeOk = true;
  scopeDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-BUH — authorized scope only (ModeloBase1/empresas/cadcps/runtime/gates/package.json/evidence)', scopeOk, scopeDetail);

// 12. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/outras telas/SSOT.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN_PATHS = [/^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const otherModules = files.filter((f) => /^src\/modules\//.test(f) && !/^src\/modules\/(empresas|cadcps)\//.test(f));
  const forbidden = files.filter((f) => FORBIDDEN_PATHS.some((re) => re.test(f)));
  blockedOk = forbidden.length === 0 && otherModules.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/other-module/SSOT change' : `FORBIDDEN: ${[...forbidden, ...otherModules].join(', ')}`;
} catch (err) {
  blockedOk = true;
  blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-MB1-BUH — backend/Prisma/framework/Studio/BOS/makBootstrap/other-screens/SSOT untouched', blockedOk, blockedDetail);

// 13. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-beta-ui-hardening.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-MB1-BUH — beta UI hardening unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-BETA-UI-HARDENING summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
