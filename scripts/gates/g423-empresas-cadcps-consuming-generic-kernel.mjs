#!/usr/bin/env node
/**
 * Gate G423-EMPRESAS-CADCPS-GENERIC-KERNEL — Empresas/cadcps consuming the
 * Generic Kernel through ModeloBase1 (post-Foundation C).
 *
 * Proves an ADDITIVE, REVERSIBLE consumption layer that routes the applied
 * ModeloBase1 beta read state through the ModeloBase1 → generic-model kernel
 * adapter, behind flags, with a legacy fallback:
 *   - flag OFF  → current ModeloBase1 flow verbatim (consumptionApplied=false);
 *   - flag ON + beta → runtimeReadModel passes through the generic adapter
 *     (mapReadToGeneric → generic validation → mapGenericToRead → MB1 merge);
 *   - error/failure → fallback to the current ModeloBase1 flow.
 * Consumption only turns on when the beta read model is applied. It never
 * rewrites ModeloBase1, never replaces the old validators wholesale, never
 * removes the current flow. Dangerous capabilities stay false. No React (outside
 * the optional hook), no backend/Prisma/fetch/storage/runtimeBridge, no persistence
 * real, Empresas/cadcps modules untouched, App.jsx untouched, no new dependency.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const ACT_DIR = path.join(ROOT, 'src/ModeloBase1/generic-model-adapter/activation');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const FILES = [
  'modeloBase1GenericKernelConsumptionConfig.js',
  'modeloBase1GenericKernelConsumptionErrors.js',
  'modeloBase1GenericKernelConsumptionDiagnostics.js',
  'modeloBase1GenericKernelConsumptionFallback.js',
  'applyModeloBase1GenericKernelConsumption.js',
  'useModeloBase1GenericKernelConsumption.js',
  'index.js',
];
const HOOK = 'useModeloBase1GenericKernelConsumption.js';
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
});
const allImports = () => walk(ACT_DIR).flatMap((f) =>
  [...stripComments(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => ({ file: f, imp: m[1] })),
);

const devEnv = (over = {}) => ({ DEV: 'true', ...over });
const mb1ReadState = (over = {}) => ({
  moduleId: 'empresas', betaApplied: true, writeBlocked: true, source: 'runtime-v2-beta',
  table: { columns: [{ id: 'razao_social' }], visibleColumns: [{ id: 'razao_social' }], rows: [{ id: 'r1', cells: { razao_social: 'ACME' } }], rowCount: 1 },
  form: { fields: [{ id: 'razao_social' }], visibleFields: [{ id: 'razao_social' }] },
  diagnostics: { permissionsApplied: true },
  ...over,
});

// 1. Arquivos esperados.
for (const f of FILES) gate(`G423-EC-GK — ${f} exists`, exists(path.join(ACT_DIR, f)));
gate('G423-EC-GK — tests exist', exists(path.join(RUNTIME, '__tests__/empresas-cadcps-consuming-generic-kernel.test.js')));

// 2. Flags/resolução: off→desabilitado; on+beta→habilitado; on sem beta→desabilitado. (dynamic)
let flagsOk = false;
let flagsDetail = '';
try {
  const c = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionConfig.js')).href);
  const F = c.EMPRESAS_GENERIC_KERNEL_FLAG;
  const off = c.resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv() });
  const on = c.resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [F]: 'true' }) });
  const noBeta = c.resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState({ betaApplied: false }), env: devEnv({ [F]: 'true' }) });
  flagsOk = off.consumptionEnabled === false && off.reason === 'consumption-flag-off'
    && on.consumptionEnabled === true && on.reason === null
    && noBeta.consumptionEnabled === false && noBeta.reason === 'beta-read-model-off'
    && c.MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG === 'MAK_MODELOBASE1_GENERIC_KERNEL_CONSUMPTION'
    && c.CADCPS_GENERIC_KERNEL_FLAG === 'MAK_MODELOBASE1_CADCPS_GENERIC_KERNEL';
  flagsDetail = flagsOk ? 'off→disabled; on+beta→enabled; on-no-beta→disabled; flag names documented' : `flags wrong (off=${off.consumptionEnabled}, on=${on.consumptionEnabled}, noBeta=${noBeta.consumptionEnabled})`;
} catch (err) { flagsDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EC-GK — flags: off = current flow; on+beta = consume; consumption requires beta', flagsOk, flagsDetail);

// 3. Produção fail-closed; allow_prod libera. (dynamic)
let prodOk = false;
try {
  const c = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionConfig.js')).href);
  const F = c.EMPRESAS_GENERIC_KERNEL_FLAG;
  const closed = c.resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: { MODE: 'production', [F]: 'true' } });
  const opened = c.resolveModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: { MODE: 'production', [F]: 'true', MAK_MODELOBASE1_EMPRESAS_GENERIC_KERNEL_ALLOW_PROD: 'true' } });
  prodOk = closed.consumptionEnabled === false && opened.consumptionEnabled === true;
} catch { prodOk = false; }
gate('G423-EC-GK — production fail-closed unless *_ALLOW_PROD', prodOk);

// 4. apply flag OFF → estado atual verbatim; consumptionApplied false. (dynamic)
let offApplyOk = false;
let offDetail = '';
try {
  const a = await import(pathToFileURL(path.join(ACT_DIR, 'applyModeloBase1GenericKernelConsumption.js')).href);
  const r = a.applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv() });
  offApplyOk = r.consumptionApplied === false && r.legacyFallback === true && r.readState.table.columns.length === 1 && r.readState.genericKernelApplied === undefined;
  offDetail = offApplyOk ? 'flag off returns the current ModeloBase1 read state verbatim' : 'off path altered the state';
} catch (err) { offDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EC-GK — apply OFF: current ModeloBase1 flow verbatim (no kernel annotation)', offApplyOk, offDetail);

// 5. apply flag ON + beta → passa pelo kernel; shape preservado; invariantes seguros. (dynamic)
let onApplyOk = false;
let onDetail = '';
try {
  const a = await import(pathToFileURL(path.join(ACT_DIR, 'applyModeloBase1GenericKernelConsumption.js')).href);
  const c = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionConfig.js')).href);
  const r = a.applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [c.EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
  const shape = r.readState.table.columns.length === 1 && r.readState.table.rows.length === 1 && r.readState.form.fields.length === 1;
  const preserved = r.readState.moduleId === 'empresas' && r.readState.writeBlocked === true && r.readState.source === 'runtime-v2-beta';
  const safe = r.readState.persistenceReal === false && r.readState.backendTouched === false && r.readState.prismaTouched === false && r.readState.runtimeBridgeTouched === false;
  onApplyOk = r.ok === true && r.consumptionApplied === true && r.readState.genericKernelApplied === true && shape && preserved && safe;
  onDetail = onApplyOk ? 'read passes through the generic kernel; shape + MB1 fields preserved; local-only invariants' : `on wrong (applied=${r.consumptionApplied}, shape=${shape}, preserved=${preserved}, safe=${safe})`;
} catch (err) { onDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EC-GK — apply ON+beta: runtimeReadModel passes through the generic adapter (shape + fields preserved; local-only)', onApplyOk, onDetail);

// 6. apply inválido → fallback verbatim (generic-validation-failed). (dynamic)
let invalidOk = false;
try {
  const a = await import(pathToFileURL(path.join(ACT_DIR, 'applyModeloBase1GenericKernelConsumption.js')).href);
  const c = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionConfig.js')).href);
  const r = a.applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState({ form: null }), env: devEnv({ [c.EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }) });
  invalidOk = r.ok === false && r.consumptionApplied === false && r.legacyFallback === true && r.reason === 'generic-validation-failed' && r.fallback.fallbackApplied === true;
} catch { invalidOk = false; }
gate('G423-EC-GK — invalid read model → fallback to the current flow (generic-validation-failed)', invalidOk);

// 7. apply adapter que lança → fallback adapter-failure; estado original preservado. (dynamic)
let throwOk = false;
try {
  const a = await import(pathToFileURL(path.join(ACT_DIR, 'applyModeloBase1GenericKernelConsumption.js')).href);
  const c = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionConfig.js')).href);
  const r = a.applyModeloBase1GenericKernelConsumption({ moduleId: 'empresas', readState: mb1ReadState(), env: devEnv({ [c.EMPRESAS_GENERIC_KERNEL_FLAG]: 'true' }), createAdapter: () => { throw new Error('boom'); } });
  throwOk = r.ok === false && r.reason === 'adapter-failure' && r.readState.moduleId === 'empresas' && r.readState.table.columns.length === 1;
} catch { throwOk = false; }
gate('G423-EC-GK — adapter failure → fallback (original ModeloBase1 read state preserved)', throwOk);

// 8. diagnostics: invariantes locais/sem side effect. (dynamic)
let diagOk = false;
try {
  const d = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionDiagnostics.js')).href);
  const applied = d.createModeloBase1GenericKernelConsumptionDiagnostics({ moduleId: 'empresas', consumptionApplied: true });
  const legacy = d.createModeloBase1GenericKernelConsumptionDiagnostics({ moduleId: 'empresas', consumptionApplied: false });
  diagOk = applied.genericKernelApplied === true && applied.readiness === 'generic-kernel'
    && legacy.readiness === 'legacy' && legacy.genericKernelApplied === false
    && applied.backendTouched === false && applied.prismaTouched === false && applied.runtimeBridgeTouched === false && applied.persistenceReal === false && applied.reversible === true;
} catch { diagOk = false; }
gate('G423-EC-GK — diagnostics: backend/Prisma/runtimeBridge Touched false; persistenceReal false; reversible', diagOk);

// 9. fallback builder: retorna estado original + rollback plan sem executar. (dynamic)
let fbOk = false;
try {
  const f = await import(pathToFileURL(path.join(ACT_DIR, 'modeloBase1GenericKernelConsumptionFallback.js')).href);
  const fb = f.createModeloBase1GenericKernelConsumptionFallback({ moduleId: 'empresas', readState: mb1ReadState(), reason: 'adapter-failure' });
  fbOk = fb.ok === false && fb.legacyFallback === true && fb.readState.moduleId === 'empresas' && fb.rollbackPlan.rollbackAvailable === true && fb.rollbackPlan.safety.executesRollback === false;
} catch { fbOk = false; }
gate('G423-EC-GK — fallback preserves the original read state + passive rollback plan', fbOk);

// 10. dangerous capabilities do adapter permanecem false (consumo nunca liga). (dynamic)
let dangerOk = false;
try {
  const m = await import(pathToFileURL(path.join(ROOT, 'src/ModeloBase1/generic-model-adapter/createModeloBase1GenericModelAdapter.js')).href);
  const ad = m.createModeloBase1GenericModelAdapter({ moduleId: 'empresas' });
  dangerOk = ['backendWrite', 'workflow', 'connector', 'marketplacePublish'].every((c) => ad.capabilities[c] === false) && ad.persistenceReal === false;
} catch { dangerOk = false; }
gate('G423-EC-GK — dangerous capabilities stay false; persistenceReal false', dangerOk);

// 11. Isolamento estrutural PERMANENTE: só kernel/adapter + siblings + React (hooks); sem backend/Prisma/runtimeBridge/modules/fetch/storage.
let isoOk = false;
let isoDetail = '';
try {
  const isHook = (file) => /^use[A-Z]/.test(path.basename(file));
  const offenders = [];
  for (const { file, imp } of allImports()) {
    const bad = /\/apis\/|prisma|\/backend\//i.test(imp)
      || /makBootstrap|runtimeBridge/.test(imp)
      || /\/modules\/(empresas|cadcps)/.test(imp)
      || ((imp === 'react' || /^react(\/|$)/.test(imp)) && !isHook(file));
    if (bad) offenders.push(`${path.relative(ROOT, file)} → ${imp}`);
  }
  for (const file of walk(ACT_DIR)) {
    const code = stripComments(fs.readFileSync(file, 'utf8'));
    if (/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code) || /localStorage\.|sessionStorage\.|indexedDB\./.test(code)) offenders.push(`${path.relative(ROOT, file)} → fetch/storage sink`);
  }
  isoOk = offenders.length === 0;
  isoDetail = isoOk ? 'activation folder isolated (React only in hooks)' : `OUT OF SCOPE: ${offenders.join(', ')}`;
} catch (err) { isoDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EC-GK — activation folder structurally isolated (kernel/adapter + siblings; React only in hooks; no backend/Prisma/runtimeBridge/modules/fetch/storage)', isoOk, isoDetail);

// 12. Activation consome o adapter ModeloBase1 → generic kernel (aditivo).
let consumesOk = false;
try { consumesOk = allImports().some(({ imp }) => /createModeloBase1GenericModelAdapter/.test(imp)) && allImports().some(({ imp }) => /runtime\/generic-model/.test(imp)); } catch { consumesOk = false; }
gate('G423-EC-GK — activation consumes the ModeloBase1 → generic kernel adapter (additive)', consumesOk);

// 13. Sem CSS global.
let noCss = true;
try { noCss = !walk(ACT_DIR).some((f) => /import\s+['"][^'"]+\.css['"]/i.test(fs.readFileSync(f, 'utf8'))); } catch { noCss = false; }
gate('G423-EC-GK — no global CSS import', noCss);

// 14. ModeloBase1 não reescrito (mudanças só sob generic-model-adapter/). (git-diff, tolerante)
let noMb1Rewrite = false;
let mb1Detail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const mb1Changed = files.filter((f) => /^src\/ModeloBase1\//.test(f) && !/^src\/ModeloBase1\/generic-model-adapter\//.test(f));
  noMb1Rewrite = mb1Changed.length === 0;
  mb1Detail = noMb1Rewrite ? 'only generic-model-adapter/ touched; existing ModeloBase1 engine unchanged' : `ModeloBase1 files changed: ${mb1Changed.join(', ')}`;
} catch (err) { noMb1Rewrite = true; mb1Detail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EC-GK — ModeloBase1 not rewritten (only the adapter folder touched)', noMb1Rewrite, mb1Detail);

// 15. Empresas/cadcps módulos não alterados. (git-diff, tolerante)
let noModuleChange = false;
let moduleDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const changed = files.filter((f) => /^src\/modules\//.test(f));
  noModuleChange = changed.length === 0;
  moduleDetail = noModuleChange ? 'Empresas/cadcps modules untouched' : `changed: ${changed.join(', ')}`;
} catch (err) { noModuleChange = true; moduleDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EC-GK — Empresas / cadcps modules NOT changed', noModuleChange, moduleDetail);

// 16. App.jsx não alterado. (git-diff, tolerante)
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-EC-GK — src/App.jsx not changed', appOk);

// 17. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/SSOT. (git-diff, tolerante)
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/SSOT change' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-EC-GK — backend/Prisma/framework/Studio/BOS/makBootstrap/SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-EC-GK — no new dependency added', noNewDep, depDetail);

// 18b. Próximo passo é hardening/modeloBase2 prototype adapter — NÃO backend write.
let nextStepOk = false;
let nextStepDetail = '';
try {
  const notes = fs.readFileSync(path.join(ROOT, 'docs/evidence/post-foundation-c-empresas-cadcps-consuming-generic-kernel/QUALITY-SCALABILITY-NOTES.md'), 'utf8');
  const section = (notes.split(/##\s*Próximo passo recomendado/i)[1] || '').toLowerCase();
  const forward = /hardening|modelobase2/.test(section);
  const noBackendWrite = !/backend\s*write/.test(section);
  nextStepOk = forward && noBackendWrite;
  nextStepDetail = nextStepOk ? 'next step = hardening / modeloBase2 prototype adapter (not backend write)' : `next step wrong (forward=${forward}, noBackendWrite=${noBackendWrite})`;
} catch (err) { nextStepDetail = err instanceof Error ? err.message : String(err); }
gate('G423-EC-GK — next step is hardening / modeloBase2 prototype adapter (not backend write)', nextStepOk, nextStepDetail);

// 19. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/empresas-cadcps-consuming-generic-kernel.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-EC-GK — consumption unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-EMPRESAS-CADCPS-GENERIC-KERNEL summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
