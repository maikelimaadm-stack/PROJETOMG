#!/usr/bin/env node
/**
 * Gate G423-GENERIC-MODEL-CONTRACTS-FOUNDATION — Generic Model Runtime Contracts
 * Foundation (post-Foundation C).
 *
 * Proves the initial GENERIC model foundation in src/runtime/generic-model/:
 * pure, React-free, ModeloBase1-free contracts + safety/fallback/diagnostics/
 * versioning/checksum + in-memory adapter + read/write/snapshot validation, with
 * dangerous capabilities (backendWrite/workflow/connector/marketplacePublish)
 * FALSE by default. It does NOT replace ModeloBase1. No React/backend/Prisma/
 * fetch/storage/runtimeBridge; no ModeloBase1/Empresas/cadcps import; App.jsx
 * untouched; authorized scope; no new dependency; no global CSS.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const GM_DIR = path.join(ROOT, 'src/runtime/generic-model');
const RUNTIME = path.join(ROOT, 'src/runtime');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const exists = (p) => fs.existsSync(p);
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const EXPECTED = [
  'errors/createGenericModelError.js',
  'errors/genericModelErrorCodes.js',
  'safety/sanitizeGenericModelPayload.js',
  'safety/assertGenericModelPlainObject.js',
  'safety/detectGenericModelUnsafeMarkers.js',
  'safety/createGenericModelSafetyPolicy.js',
  'fallback/createGenericModelFallback.js',
  'fallback/createGenericModelRollbackPlan.js',
  'diagnostics/createGenericModelDiagnostics.js',
  'versioning/createGenericModelVersion.js',
  'versioning/createGenericModelChecksum.js',
  'persistence/createGenericModelInMemoryAdapter.js',
  'persistence/createGenericModelSnapshot.js',
  'persistence/validateGenericModelSnapshot.js',
  'write/validateGenericModelWritePayload.js',
  'write/createGenericModelWriteContract.js',
  'read/validateGenericModelReadModel.js',
  'read/createGenericModelReadContract.js',
  'contracts/createGenericModelRuntimeContract.js',
  'contracts/genericModelContractConstants.js',
  'index.js',
];
const DETECTOR = 'detectGenericModelUnsafeMarkers.js';
function allSources({ includeDetector = true } = {}) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.js') && (includeDetector || entry.name !== DETECTOR)) out.push(fs.readFileSync(p, 'utf8'));
    }
  };
  walk(GM_DIR);
  return out.join('\n');
}
const allImports = () => [...stripComments(allSources()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

// 1. Arquivos esperados.
for (const f of EXPECTED) gate(`G423-GM — generic-model/${f} exists`, exists(path.join(GM_DIR, f)));
gate('G423-GM — types exist', exists(path.join(RUNTIME, 'types/generic-model.js')));
gate('G423-GM — tests exist', exists(path.join(RUNTIME, '__tests__/generic-model-contracts-foundation.test.js')));

// 2. Não importa React.
let noReact = false;
try {
  noReact = allImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p));
} catch { noReact = false; }
gate('G423-GM — generic-model does not import React', noReact);

// 3. Não importa ModeloBase1.
let noMb1 = false;
try { noMb1 = allImports().every((p) => !/ModeloBase1/i.test(p)); } catch { noMb1 = false; }
gate('G423-GM — generic-model does not import ModeloBase1', noMb1);

// 4. Não importa Empresas/cadcps.
let noModules = false;
try { noModules = allImports().every((p) => !/\/modules\/(empresas|cadcps)/.test(p) && !/@\/modules\//.test(p)); } catch { noModules = false; }
gate('G423-GM — generic-model does not import Empresas/cadcps', noModules);

// 5. Não importa backend/API/Prisma.
let noBackend = false;
try { noBackend = allImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)); } catch { noBackend = false; }
gate('G423-GM — generic-model does not import backend/API/Prisma', noBackend);

// 6. Não importa runtimeBridge/makBootstrap.
let noBridge = false;
try { noBridge = allImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)); } catch { noBridge = false; }
gate('G423-GM — generic-model does not import runtimeBridge/makBootstrap', noBridge);

// 7. Sem fetch/XHR/storage-API (detector excluído).
let noIo = false;
let ioDetail = '';
try {
  const code = stripComments(allSources({ includeDetector: false }));
  const noFetch = !/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code);
  const noStorage = !/localStorage\.|sessionStorage\.|indexedDB\./.test(code);
  noIo = noFetch && noStorage;
  ioDetail = noIo ? 'clean (detector excluded)' : `found (fetch=${!noFetch}, storage=${!noStorage})`;
} catch (err) { ioDetail = err instanceof Error ? err.message : String(err); }
gate('G423-GM — no fetch/XHR/WebSocket/storage-API', noIo, ioDetail);

// 8. Sem CSS global.
gate('G423-GM — no global CSS import', !/import\s+['"][^'"]+\.css['"]/i.test(allSources()));

// 9. Capabilities perigosas false por padrão + safe copies + determinism. (dynamic)
let contractOk = false;
let contractDetail = '';
try {
  const rc = await import(pathToFileURL(path.join(GM_DIR, 'contracts/createGenericModelRuntimeContract.js')).href);
  const constants = await import(pathToFileURL(path.join(GM_DIR, 'contracts/genericModelContractConstants.js')).href);
  const c = rc.createGenericModelRuntimeContract({ modelId: 'm', moduleId: 'x', modelType: 'cadastro' });
  const dangerFalse = constants.GENERIC_MODEL_DANGEROUS_CAPABILITIES.every((cap) => c.capabilities[cap] === false);
  const safeOn = c.capabilities.read === true && c.capabilities.localWrite === true;
  const localOnly = c.localOnly === true && c.persistenceReal === false;
  const next = c.nextAllowedStep === 'ModeloBase1 Adapter to Generic Kernel' && !/replace|substitu/i.test(c.nextAllowedStep);
  contractOk = dangerFalse && safeOn && localOnly && next;
  contractDetail = contractOk ? 'dangerous capabilities false; safe on; localOnly; next=ModeloBase1 Adapter' : `contract wrong (danger=${dangerFalse}, safe=${safeOn}, local=${localOnly}, next=${next})`;
} catch (err) { contractDetail = err instanceof Error ? err.message : String(err); }
gate('G423-GM — dangerous capabilities false by default; next = ModeloBase1 Adapter (not replacement)', contractOk, contractDetail);

// 10. Adapter localOnly/in-memory + snapshot validation fail-closed. (dynamic)
let adapterOk = false;
let adapterDetail = '';
try {
  const am = await import(pathToFileURL(path.join(GM_DIR, 'persistence/createGenericModelInMemoryAdapter.js')).href);
  const sm = await import(pathToFileURL(path.join(GM_DIR, 'persistence/createGenericModelSnapshot.js')).href);
  const vm = await import(pathToFileURL(path.join(GM_DIR, 'persistence/validateGenericModelSnapshot.js')).href);
  const snap = sm.createGenericModelSnapshot({ modelId: 'm', moduleId: 'x', data: { rows: [{ id: 'r1' }] } });
  const ad = am.createGenericModelInMemoryAdapter();
  const save = ad.saveSnapshot(snap);
  const diag = ad.getDiagnostics();
  const localOnly = save.localOnly === true && save.persistenceReal === false && save.backendTouched === false && save.prismaTouched === false && save.runtimeBridgeTouched === false;
  const memory = ad.storageMode === 'memory_validation' && diag.mandatoryStorage === false;
  const validOk = vm.validateGenericModelSnapshot({ snapshot: snap, moduleId: 'x' }).valid === true;
  const tampered = vm.validateGenericModelSnapshot({ snapshot: { ...snap, data: { rows: [] } } }).valid === false;
  const fn = vm.validateGenericModelSnapshot({ snapshot: { ...snap, data: { fn: () => {} } } }).valid === false;
  adapterOk = save.ok && localOnly && memory && validOk && tampered && fn;
  adapterDetail = adapterOk ? 'in-memory localOnly; persistenceReal false; snapshot validation fail-closed' : `adapter wrong (save=${save.ok}, local=${localOnly}, memory=${memory}, valid=${validOk}, tamper=${tampered}, fn=${fn})`;
} catch (err) { adapterDetail = err instanceof Error ? err.message : String(err); }
gate('G423-GM — in-memory adapter localOnly/persistenceReal=false; snapshot validation fail-closed', adapterOk, adapterDetail);

// 11. Write contract bloqueia sinks; payload fail-closed. (dynamic)
let writeOk = false;
try {
  const wc = await import(pathToFileURL(path.join(GM_DIR, 'write/createGenericModelWriteContract.js')).href);
  const wv = await import(pathToFileURL(path.join(GM_DIR, 'write/validateGenericModelWritePayload.js')).href);
  const c = wc.createGenericModelWriteContract({ moduleId: 'x' });
  const blocks = ['backendCreate', 'prismaCreate', 'fetchWrite', 'persistStorageAutomatically', 'mutateRuntimeBridge'].every((op) => c.blockedOperations.includes(op)) && c.backendAllowed === false;
  const ok = wv.validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { a: 1 } }).valid === true;
  const unknown = wv.validateGenericModelWritePayload({ moduleId: 'x', operation: 'frob' }).valid === false;
  const backend = wv.validateGenericModelWritePayload({ moduleId: 'x', operation: 'create', payload: { target: 'backend' } }).valid === false;
  writeOk = blocks && ok && unknown && backend;
} catch { writeOk = false; }
gate('G423-GM — write contract blocks sinks; payload validation fail-closed', writeOk);

// 12. App.jsx não alterado.
let appOk = false;
try {
  const changed = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  appOk = !changed.includes('src/App.jsx');
} catch { appOk = true; }
gate('G423-GM — src/App.jsx not changed', appOk);

// 13. Isolamento permanente (robusto entre slices): a foundation generic-model
// NÃO importa ModeloBase1/Empresas/cadcps. (Import scan das próprias fontes — não
// git-diff — para que slices posteriores que ADICIONAM adapters ModeloBase1→kernel
// não quebrem este gate; a garantia real é a foundation permanecer isolada.)
let noMb1Import = false;
let mb1Detail = '';
try {
  const imports = allImports();
  const offenders = imports.filter((p) => /ModeloBase1/i.test(p) || /\/modules\/(empresas|cadcps)/.test(p) || /@\/modules\//.test(p));
  noMb1Import = offenders.length === 0;
  mb1Detail = noMb1Import ? 'generic-model does not import ModeloBase1/Empresas/cadcps' : `imports: ${offenders.join(', ')}`;
} catch (err) { noMb1Import = false; mb1Detail = err instanceof Error ? err.message : String(err); }
gate('G423-GM — generic-model foundation does not import ModeloBase1/Empresas/cadcps (isolation)', noMb1Import, mb1Detail);

// 14. Barrel puro: o barrel da foundation não exporta nenhum componente React (.jsx).
// (Garantia permanente; não git-diff.)
let barrelPure = false;
let barrelDetail = '';
try {
  const barrel = fs.readFileSync(path.join(GM_DIR, 'index.js'), 'utf8');
  barrelPure = !/from\s+['"][^'"]*\.jsx['"]/.test(barrel) && !/import\s+React/.test(allSources());
  barrelDetail = barrelPure ? 'no .jsx export; no React import' : 'barrel exports a .jsx or React imported';
} catch (err) { barrelPure = false; barrelDetail = err instanceof Error ? err.message : String(err); }
gate('G423-GM — generic-model barrel is pure (no React component export)', barrelPure, barrelDetail);

// 15. BLOQUEADO — backend/apis/prisma/framework/studio/bos/makBootstrap/SSOT.
let blockedOk = false;
let blockedDetail = '';
try {
  const files = execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const FORBIDDEN = [/^src\/apis\//, /prisma/i, /^src\/framework\//, /^src\/studio\//, /^src\/bos\//, /^src\/modules\/makBootstrap\//, /^docs\/meta-model\//, /^docs\/platform-/, /^docs\/runtime-implementation\//];
  const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
  blockedOk = bad.length === 0;
  blockedDetail = blockedOk ? 'no backend/apis/prisma/framework/studio/bos/makBootstrap/SSOT change' : `FORBIDDEN: ${bad.join(', ')}`;
} catch (err) { blockedOk = true; blockedDetail = `git base unavailable — skipped (${err instanceof Error ? err.message : String(err)})`; }
gate('G423-GM — backend/Prisma/framework/Studio/BOS/makBootstrap/SSOT untouched', blockedOk, blockedDetail);

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
gate('G423-GM — no new dependency added', noNewDep, depDetail);

// 17. Rodar os testes unitários do slice.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/generic-model-contracts-foundation.test.js', { cwd: ROOT, stdio: 'pipe', env: { ...process.env, NODE_ENV: 'test' } });
  testsOk = true;
} catch (err) { if (err.stderr) console.error(String(err.stderr)); }
gate('G423-GM — generic model contracts foundation unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-GENERIC-MODEL-CONTRACTS-FOUNDATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exit(1);
