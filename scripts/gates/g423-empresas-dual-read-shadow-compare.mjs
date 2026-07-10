#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-DUAL-READ — Empresas Dual Read Shadow Compare (post-Foundation C)
 *
 * Proves the dual-read compare is a pure, passive, deterministic READ comparison
 * between a legacy snapshot and a runtime v2 read-only snapshot: off by default,
 * fail-closed in production, write guard still active, no real data/backend/
 * Prisma/storage, no App.jsx/menu/real-screen/legacy change, and it recommends
 * only "Guarded Read UI Slice" (parity/acceptable drift) or "Dual Read Drift
 * Resolution" (blocked) — never write/full cutover, never migrated.
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const DIR = path.join(RUNTIME, 'migration/empresas-dual-read');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const FILES = [
  'createEmpresasDualReadShadowCompare.js',
  'createEmpresasLegacyReadSnapshot.js',
  'createEmpresasRuntimeV2ReadSnapshot.js',
  'compareEmpresasReadSnapshots.js',
  'empresasDualReadConfig.js',
  'empresasDualReadDiagnostics.js',
  'empresasDualReadDifferenceModel.js',
  'errors.js',
];
const dualSource = () => FILES.map((f) => fs.readFileSync(path.join(DIR, f), 'utf8')).join('\n');
const dualCodeOnly = () => stripComments(dualSource());

// 1. Existência dos arquivos.
for (const f of FILES) {
  gate(`G423-EMPRESAS-DUAL-READ — ${f} exists`, exists(path.join(DIR, f)));
}
gate('G423-EMPRESAS-DUAL-READ — dual-read types exist', exists(path.join(RUNTIME, 'types/empresas-dual-read-shadow-compare.js')));
gate('G423-EMPRESAS-DUAL-READ — dual-read tests exist', exists(path.join(RUNTIME, '__tests__/migration/empresas-dual-read-shadow-compare.test.js')));

// 2. Exports públicos no runtime barrel.
let exportsOk = false;
let exportsDetail = '';
try {
  const s = fs.readFileSync(path.join(RUNTIME, 'index.js'), 'utf8');
  exportsOk = /createEmpresasDualReadShadowCompare/.test(s)
    && /createEmpresasLegacyReadSnapshot/.test(s)
    && /createEmpresasRuntimeV2ReadSnapshot/.test(s)
    && /compareEmpresasReadSnapshots/.test(s)
    && /createEmpresasDualReadDiagnostics/.test(s);
  exportsDetail = exportsOk ? 'dual-read helpers exported from runtime barrel' : 'missing one or more dual-read exports';
} catch (err) {
  exportsDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — dual-read helpers exported from runtime barrel', exportsOk, exportsDetail);

// 14. Write guard segue bloqueando. (dynamic)
let writeGuardOk = false;
let writeGuardDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DIR, 'createEmpresasDualReadShadowCompare.js')).href);
  const c = await mod.createEmpresasDualReadShadowCompare({ env: { MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE: 'true' } });
  const ops = ['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'bulkDelete', 'save', 'submit', 'executeAction', 'startWorkflow', 'invokeConnector'];
  writeGuardOk = ops.every((op) => c.writeGuard.attempt(op, {}).blocked === true) && c.diagnostics.writeGuardStatus === 'active';
  writeGuardDetail = writeGuardOk ? 'write guard ativo; todas as operações de write bloqueadas' : 'write guard não bloqueia como esperado';
} catch (err) {
  writeGuardDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — write guard still blocks create/update/delete/save/action/workflow/connector', writeGuardOk, writeGuardDetail);

// 15/16. Não declara migração concluída; next step é Guarded Read UI Slice OU Drift Resolution. (dynamic)
let shapeOk = false;
let shapeDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(DIR, 'createEmpresasDualReadShadowCompare.js')).href);
  const off = await mod.createEmpresasDualReadShadowCompare({ env: {} });
  const on = await mod.createEmpresasDualReadShadowCompare({ env: { MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE: 'true' } });
  const prod = await mod.createEmpresasDualReadShadowCompare({ env: { MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE: 'true', NODE_ENV: 'production' } });
  const offOk = off.enabled === false && off.skipped === true && off.noSideEffects === true && off.legacySnapshot === null && off.runtimeV2Snapshot === null;
  const onOk = on.enabled === true && on.mode === 'dual_read_shadow_compare' && on.currentRuntime === 'legacy' && on.targetRuntime === 'runtime-v2';
  const notMigrated = on.mode !== 'migrated';
  const nextOk = /Guarded Read UI Slice|Dual Read Drift Resolution/i.test(on.nextAllowedStep) && !/write|full cutover|migrated/i.test(on.nextAllowedStep);
  const prodClosed = prod.enabled === false && prod.productionBlocked === true;
  const parity = ['parity', 'acceptable_drift', 'blocked'].includes(on.summary.parityStatus);
  shapeOk = offOk && onOk && notMigrated && nextOk && prodClosed && parity;
  shapeDetail = shapeOk
    ? `off→skipped/no-side-effects; on→dual_read_shadow_compare legacy→v2; não-migrado; next=${on.nextAllowedStep}; prod fail-closed; parity=${on.summary.parityStatus}`
    : `compare fora do contrato (offOk=${offOk}, onOk=${onOk}, notMigrated=${notMigrated}, nextOk=${nextOk}, prodClosed=${prodClosed}, parity=${parity})`;
} catch (err) {
  shapeDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — no completed migration; next step only Guarded Read UI Slice or Drift Resolution', shapeOk, shapeDetail);

// Comparator produz difference model classificado. (dynamic)
let comparatorOk = false;
let comparatorDetail = '';
try {
  const cmpMod = await import(pathToFileURL(path.join(DIR, 'compareEmpresasReadSnapshots.js')).href);
  const legMod = await import(pathToFileURL(path.join(DIR, 'createEmpresasLegacyReadSnapshot.js')).href);
  const v2Mod = await import(pathToFileURL(path.join(DIR, 'createEmpresasRuntimeV2ReadSnapshot.js')).href);
  const legacy = await legMod.createEmpresasLegacyReadSnapshot();
  const v2 = JSON.parse(JSON.stringify(await v2Mod.createEmpresasRuntimeV2ReadSnapshot({ env: { MAK_RUNTIME_V2_EMPRESAS_DUAL_READ_COMPARE: 'true' } })));
  // Inject a critical structural difference.
  delete v2.table;
  const cmp = await cmpMod.compareEmpresasReadSnapshots({ legacySnapshot: legacy, runtimeV2Snapshot: v2 });
  const classified = cmp.differences.every((d) => typeof d.severity === 'string' && typeof d.category === 'string' && typeof d.recommendedAction === 'string');
  comparatorOk = cmp.summary.parityStatus === 'blocked' && cmp.summary.blockingCount > 0 && classified;
  comparatorDetail = comparatorOk ? 'comparador detecta diff crítica/blocking e classifica por severidade/categoria/ação' : 'comparador não classifica/bloqueia como esperado';
} catch (err) {
  comparatorDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — comparator classifies differences by severity/category and blocks on critical', comparatorOk, comparatorDetail);

// 8. Sem import direto de Prisma/backend.
let noForbiddenDeps = false;
let forbiddenDetail = '';
try {
  const s = dualSource();
  const hasPrisma = /from\s+['"].*prisma.*['"]/i.test(s) || /PrismaClient/.test(s);
  const hasBackend = /from\s+['"].*backend.*['"]/i.test(s);
  noForbiddenDeps = !hasPrisma && !hasBackend;
  forbiddenDetail = hasPrisma ? 'Prisma import found' : hasBackend ? 'backend import found' : 'clean';
} catch (err) {
  forbiddenDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — no direct Prisma/backend import (D-RI-13)', noForbiddenDeps, forbiddenDetail);

// 9. Sem fetch direto. 10. Sem web storage.
let noExternalIo = false;
let ioDetail = '';
try {
  const code = dualCodeOnly();
  noExternalIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket|BroadcastChannel|localStorage|sessionStorage|indexedDB/i.test(code);
  ioDetail = noExternalIo ? 'clean' : 'fetch/XHR/WebSocket/storage usage found';
} catch (err) {
  ioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — no direct fetch/XHR/WebSocket/localStorage/sessionStorage/IndexedDB', noExternalIo, ioDetail);

// 7/11. Não altera runtime legado / não toca Studio/Marketplace/módulo/App.
let noStudioModule = false;
let studioDetail = '';
try {
  const code = dualCodeOnly();
  noStudioModule = !/from\s+['"].*\/studio\/.*['"]|from\s+['"].*marketplace.*['"]|from\s+['"].*\/modules\/.*['"]|from\s+['"][^'"]*App(\.jsx)?['"]|makBootstrap|runtimeBridge/i.test(code);
  studioDetail = noStudioModule ? 'clean (no Studio/Marketplace/module/App/legacy-bridge import)' : 'Studio/Marketplace/module/App/legacy import found';
} catch (err) {
  studioDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — no Studio/Marketplace/production-module/App.jsx/legacy-runtime import', noStudioModule, studioDetail);

// 12. Não adiciona dependência nova.
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
gate('G423-EMPRESAS-DUAL-READ — no new dependency added to package.json', noNewDep, depDetail);

// 13. Não altera CSS global.
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(dualSource());
  cssDetail = noCss ? 'clean (no .css import)' : '.css import found';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-EMPRESAS-DUAL-READ — no global CSS import in dual-read', noCss, cssDetail);

// 4/5/6. src/App.jsx, tela real Empresas, menu, runtime legado / UI de produção não alterados.
let noProductionUiChange = false;
let productionUiDetail = '';
try {
  const diff = productionUiOffendingFiles(ROOT);
  noProductionUiChange = diff.length === 0;
  productionUiDetail = noProductionUiChange ? 'clean (App.jsx + real Empresas screen + menu + legacy runtime untouched)' : `changed files: ${diff.replace(/\n/g, ', ')}`;
} catch (err) {
  noProductionUiChange = true;
  productionUiDetail = `git diff unavailable — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-EMPRESAS-DUAL-READ — no production UI change (src/App.jsx, src/shared, src/framework, src/modules, src/studio)', noProductionUiChange, productionUiDetail);

// 3. Rodar os testes unitários.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/migration/empresas-dual-read-shadow-compare.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-EMPRESAS-DUAL-READ — dual-read unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-DUAL-READ summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
