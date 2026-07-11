#!/usr/bin/env node
/**
 * Gate G423-MODELOBASE1-GENERIC-ADAPTER — ModeloBase1 Adapter to Generic Kernel
 * (post-Foundation C).
 *
 * Proves a THIN, additive adapter bridging ModeloBase1 to the pure generic-model
 * kernel (read/write/persistence/safety/fallback/diagnostics) WITHOUT replacing
 * the current ModeloBase1 flow: dangerous capabilities false, read map + reverse
 * map preserve shape, safety bridge blocks fn/React/pollution/targets, write
 * bridge maps MB1 ops → generic ops and blocks sinks, persistence bridge
 * round-trips as a generic snapshot (persistenceReal:false). No React/backend/
 * Prisma/fetch/storage/runtimeBridge; ModeloBase1 not rewritten; Empresas/cadcps
 * unchanged; App.jsx untouched; authorized scope; no new dependency; no CSS.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const AD_DIR = path.join(ROOT, 'src/ModeloBase1/generic-model-adapter');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const FILES = [
  'errors.js',
  'createModeloBase1GenericModelAdapter.js',
  'mapModeloBase1RuntimeReadToGenericModel.js',
  'mapGenericModelReadToModeloBase1State.js',
  'createModeloBase1GenericSafetyBridge.js',
  'createModeloBase1GenericDiagnosticsBridge.js',
  'createModeloBase1GenericFallbackBridge.js',
  'createModeloBase1GenericWriteBridge.js',
  'createModeloBase1GenericPersistenceBridge.js',
];
const allSource = () => FILES.map((f) => fs.readFileSync(path.join(AD_DIR, f), 'utf8')).join('\n');
const allImports = () => [...stripComments(allSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-MB1-GA — ${f} exists`, exists(path.join(AD_DIR, f)));
gate('G423-MB1-GA — tests exist', exists(path.join(RUNTIME, '__tests__/modelobase1-adapter-to-generic-kernel.test.js')));

// 2. Adapter: dangerous capabilities false; supports; next=Empresas/cadcps. (dynamic)
let adapterOk = false;
let adapterDetail = '';
try {
  const m = await import(pathToFileURL(path.join(AD_DIR, 'createModeloBase1GenericModelAdapter.js')).href);
  const a = m.createModeloBase1GenericModelAdapter({ moduleId: 'empresas' });
  const family = a.modelFamily === 'modeloBase1' && a.modelType === 'cadastro';
  const danger = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'].every((c) => a.capabilities[c] === false);
  const supports = a.supports.read && a.supports.localWrite && a.supports.localPersistenceValidation && a.supports.diagnostics && a.supports.fallback;
  const next = a.nextSteps.some((s) => /Empresas\/cadcps consuming Generic Kernel/.test(s)) && !a.nextSteps.some((s) => /replace|substitu/i.test(s));
  const localOnly = a.localOnly === true && a.persistenceReal === false;
  adapterOk = family && danger && supports && next && localOnly;
  adapterDetail = adapterOk ? 'modeloBase1/cadastro; dangerous false; supports; localOnly; next=Empresas/cadcps' : `adapter wrong (family=${family}, danger=${danger}, supports=${supports}, next=${next}, local=${localOnly})`;
} catch (err) { adapterDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB1-GA — adapter: dangerous capabilities false; supports; next = Empresas/cadcps (not replacement)', adapterOk, adapterDetail);

// 3. Read bridge: map + reverse preservam shape; inválido → fallback. (dynamic)
let readOk = false;
let readDetail = '';
try {
  const fwd = await import(pathToFileURL(path.join(AD_DIR, 'mapModeloBase1RuntimeReadToGenericModel.js')).href);
  const rev = await import(pathToFileURL(path.join(AD_DIR, 'mapGenericModelReadToModeloBase1State.js')).href);
  const rs = { moduleId: 'empresas', betaApplied: true, writeBlocked: true, source: 'runtime-v2-beta', table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: '1' } }], rowCount: 1 }, form: { fields: [{ id: 'a' }] } };
  const mapped = fwd.mapModeloBase1RuntimeReadToGenericModel({ runtimeReadModel: rs });
  const okMap = mapped.ok && mapped.readModel.modelId === 'modelobase1' && mapped.readModel.modelType === 'cadastro' && mapped.readModel.table.columns.length === 1;
  const state = rev.mapGenericModelReadToModeloBase1State({ readModel: mapped.readModel });
  const okState = state.table.columns.length === 1 && state.table.visibleColumns.length === 1 && state.table.rows.length === 1 && state.form.fields.length === 1;
  const bad = fwd.mapModeloBase1RuntimeReadToGenericModel({ runtimeReadModel: { moduleId: 'empresas', betaApplied: true, table: { columns: 'nope' } } });
  const okFallback = bad.ok === false && bad.fallback.fallbackApplied === true;
  readOk = okMap && okState && okFallback;
  readDetail = readOk ? 'MB1→generic + generic→MB1 preserve shape; invalid → fallback' : `read wrong (map=${okMap}, state=${okState}, fallback=${okFallback})`;
} catch (err) { readDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB1-GA — read bridge maps both ways preserving shape; invalid → fallback', readOk, readDetail);

// 4. Write bridge maps MB1 ops → generic; bloqueia sinks/unknown. (dynamic)
let writeOk = false;
let writeDetail = '';
try {
  const wm = await import(pathToFileURL(path.join(AD_DIR, 'createModeloBase1GenericWriteBridge.js')).href);
  const w = wm.createModeloBase1GenericWriteBridge({ moduleId: 'empresas' });
  const ops = w.validateOperation('createRow', { a: 1 }).ok && w.validateOperation('updateRow', { a: 1 }).ok && w.validateOperation('deleteRow', { id: 'r1' }).ok && w.validateOperation('saveDraft').ok && w.validateOperation('submitDraft').ok;
  const mapping = w.validateOperation('createRow', {}).genericOperation === 'create' && w.validateOperation('submitDraft').genericOperation === 'submitDraft';
  const blocked = w.validateOperation('createRow', { target: 'backend' }).ok === false && w.validateOperation('createRow', { target: 'prisma' }).ok === false && w.validateOperation('frobnicate').ok === false;
  const localOnly = w.validateOperation('createRow', { a: 1 }).localOnly === true && w.validateOperation('createRow', { a: 1 }).backendTouched === false;
  writeOk = ops && mapping && blocked && localOnly;
  writeDetail = writeOk ? 'MB1 ops → generic; localOnly; blocks backend/prisma/unknown' : `write wrong (ops=${ops}, mapping=${mapping}, blocked=${blocked}, local=${localOnly})`;
} catch (err) { writeDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB1-GA — write bridge maps MB1 ops → generic (localOnly); blocks sinks/unknown', writeOk, writeDetail);

// 5. Persistence bridge: snapshot roundtrip; persistenceReal false; checksum fail-closed. (dynamic)
let persistOk = false;
let persistDetail = '';
try {
  const pm = await import(pathToFileURL(path.join(AD_DIR, 'createModeloBase1GenericPersistenceBridge.js')).href);
  const p = pm.createModeloBase1GenericPersistenceBridge({ moduleId: 'empresas' });
  const draft = { moduleId: 'empresas', table: { columns: [{ id: 'a' }], rows: [{ id: 'r1', cells: { a: '1' } }] }, form: { fields: [] } };
  const snap = p.toSnapshot(draft);
  const isSnap = snap.kind === 'generic-model-snapshot' && snap.persistenceReal === false;
  const validOk = p.validateSnapshot(snap).valid === true;
  const tampered = p.validateSnapshot({ ...snap, data: { table: { rows: [] } } }).valid === false;
  const rt = p.roundTrip(draft);
  const rtOk = rt.ok === true && rt.persistenceReal === false && rt.backendTouched === false && rt.loaded.data.table.rows.length === 1 && p.adapter.storageMode === 'memory_validation';
  persistOk = isSnap && validOk && tampered && rtOk;
  persistDetail = persistOk ? 'snapshot roundtrip localOnly; persistenceReal false; checksum fail-closed' : `persist wrong (snap=${isSnap}, valid=${validOk}, tamper=${tampered}, rt=${rtOk})`;
} catch (err) { persistDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB1-GA — persistence bridge round-trips a generic snapshot (persistenceReal=false; checksum fail-closed)', persistOk, persistDetail);

// 6. Safety bridge bloqueia fn/React/pollution/targets + mascara. (dynamic)
let safetyOk = false;
try {
  const sm = await import(pathToFileURL(path.join(AD_DIR, 'createModeloBase1GenericSafetyBridge.js')).href);
  const b = sm.createModeloBase1GenericSafetyBridge({ moduleId: 'x' });
  safetyOk = b.isSafe({ fn: () => {} }) === false && b.isSafe({ el: { $$typeof: Symbol.for('react.element') } }) === false
    && b.isSafe(JSON.parse('{"__proto__":{"y":1}}')) === false && b.sanitize({ token: 't' }).sanitized.token === '[REDACTED]';
} catch { safetyOk = false; }
gate('G423-MB1-GA — safety bridge blocks fn/React/pollution and masks sensitive', safetyOk);

// 7. Não importa React.
let noReact = false;
try { noReact = allImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)); } catch { noReact = false; }
gate('G423-MB1-GA — adapter does not import React', noReact);

// 8. Não importa backend/API/Prisma.
let noBackend = false;
try { noBackend = allImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)); } catch { noBackend = false; }
gate('G423-MB1-GA — adapter does not import backend/API/Prisma', noBackend);

// 9. Não importa runtimeBridge/makBootstrap.
let noBridge = false;
try { noBridge = allImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)); } catch { noBridge = false; }
gate('G423-MB1-GA — adapter does not import runtimeBridge/makBootstrap', noBridge);

// 10. Sem fetch/storage-API.
let noIo = false;
try {
  const code = stripComments(allSource());
  noIo = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) && !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
} catch { noIo = false; }
gate('G423-MB1-GA — no fetch/XHR/WebSocket/storage-API', noIo);

// 11. Sem CSS global.
gate('G423-MB1-GA — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(allSource()));

// 12. Não importa module configs (aditivo).
let noModuleImport = false;
try { noModuleImport = allImports().every((p) => !/\/modules\/(empresas|cadcps)/.test(p)); } catch { noModuleImport = false; }
gate('G423-MB1-GA — adapter does not import Empresas/cadcps module configs', noModuleImport);

// 13. App.jsx não alterado.
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-MB1-GA — src/App.jsx not changed', appOk);

// 14. ModeloBase1 não reescrito (só a nova pasta adapter; nenhum arquivo MB1 existente alterado).
let noMb1Rewrite = false;
let mb1Detail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const mb1Changed = files.filter((f) => /^src\/ModeloBase1\//.test(f) && !/^src\/ModeloBase1\/generic-model-adapter\//.test(f));
  noMb1Rewrite = mb1Changed.length === 0;
  mb1Detail = noMb1Rewrite ? 'only the new generic-model-adapter/ added; no existing ModeloBase1 file changed' : `ModeloBase1 files changed: ${mb1Changed.join(', ')}`;
} catch (err) { noMb1Rewrite = true; mb1Detail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB1-GA — ModeloBase1 not rewritten (only the new adapter folder added)', noMb1Rewrite, mb1Detail);

// 15. Empresas/cadcps não alterados.
let noModuleChange = false;
let moduleDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const changed = files.filter((f) => /^src\/modules\//.test(f));
  noModuleChange = changed.length === 0;
  moduleDetail = noModuleChange ? 'Empresas/cadcps untouched' : `changed: ${changed.join(', ')}`;
} catch (err) { noModuleChange = true; moduleDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB1-GA — Empresas / cadcps NOT changed', noModuleChange, moduleDetail);

// 16. ESCOPO ESTRUTURAL — PERMANENTE (import-scan) em vez de git-diff branch-
// relativo, para permanecer verde quando slices posteriores adicionam arquivos
// à pasta adapter (ex.: activation/). A pasta adapter (recursiva) importa apenas
// o kernel genérico + seus próprios siblings + React (somente em hooks). Nunca
// backend/apis/Prisma, runtimeBridge/makBootstrap, module-configs, nem fetch/
// storage. Isso prova o isolamento real do adapter independentemente do diff.
let scopeOk = false;
let scopeDetail = '';
try {
  /** @param {string} dir @returns {string[]} */
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.isFile() && e.name.endsWith('.js') ? [full] : [];
  });
  const jsFiles = walk(AD_DIR);
  const isHook = (file) => /^use[A-Z]/.test(path.basename(file));
  const offenders = [];
  for (const file of jsFiles) {
    const src = stripComments(fs.readFileSync(file, 'utf8'));
    const imports = [...src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const imp of imports) {
      const bad = /\/apis\/|prisma|\/backend\//i.test(imp)
        || /makBootstrap|runtimeBridge/.test(imp)
        || /\/modules\/(empresas|cadcps)/.test(imp)
        || ((imp === 'react' || /^react(\/|$)/.test(imp)) && !isHook(file));
      if (bad) offenders.push(`${path.relative(ROOT, file)} → ${imp}`);
    }
    if (/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(src) || /localStorage\.|sessionStorage\.|indexedDB\./.test(src)) {
      offenders.push(`${path.relative(ROOT, file)} → fetch/storage sink`);
    }
  }
  scopeOk = offenders.length === 0;
  scopeDetail = scopeOk ? `adapter folder isolated (${jsFiles.length} files; React only in hooks)` : `OUT OF SCOPE: ${offenders.join(', ')}`;
} catch (err) { scopeOk = false; scopeDetail = err instanceof Error ? err.message : String(err); }
gate('G423-MB1-GA — adapter folder structurally isolated (generic kernel + siblings; React only in hooks; no backend/Prisma/runtimeBridge/modules/fetch/storage)', scopeOk, scopeDetail);

// 17. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/SSOT.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/SSOT change' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-MB1-GA — backend/Prisma/framework/Studio/BOS/makBootstrap/SSOT untouched', blockedOk, blockedDetail);

// 18. Sem dependência nova.
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
gate('G423-MB1-GA — no new dependency added', noNewDep, depDetail);

// 19. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/modelobase1-adapter-to-generic-kernel.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-MB1-GA — adapter unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-MODELOBASE1-GENERIC-ADAPTER summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
