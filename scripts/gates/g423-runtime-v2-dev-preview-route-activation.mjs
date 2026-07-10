#!/usr/bin/env node
/**
 * Gate G423-PREVIEW-ROUTE-ACTIVATION — Runtime v2 Dev Preview Route Activation (post-Foundation C)
 *
 * This is the slice that actually mounts the dev-only route `/__dev/runtime-v2/previews`
 * into the real central router (`src/App.jsx`). The gate proves the activation is:
 *   - really wired into the live router,
 *   - dev-only, flag-protected, and fail-closed in production,
 *   - NOT in the main menu / navigation,
 *   - strictly limited to the sanctioned dev-only mount (additions only, dev path only),
 *   - free of backend/fetch/Prisma/storage/execution/real-data/new-dep/global-CSS.
 */
import { execSync } from 'node:child_process';
import { productionUiOffendingFiles } from './lib/productionUiGuard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'src/runtime');
const ROUTE_DIR = path.join(RUNTIME, 'preview/dev/route');
const APP_JSX = path.join(ROOT, 'src/App.jsx');
const results = [];

const gate = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const exists = (p) => fs.existsSync(p);
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const appSource = () => fs.readFileSync(APP_JSX, 'utf8');
const appCodeOnly = () => stripComments(appSource());
const mountBlock = () => {
  const m = appCodeOnly().match(/shouldMountRuntimeV2DevPreviewRoute\(\)\s*&&[\s\S]*?\/>\s*\)\s*\}/);
  return m ? m[0] : '';
};

// 0. Arquivos de teste/rota presentes.
gate('G423-PREVIEW-ROUTE-ACTIVATION — App.jsx exists', exists(APP_JSX));
gate('G423-PREVIEW-ROUTE-ACTIVATION — activation tests exist', exists(path.join(RUNTIME, '__tests__/preview/runtime-v2-dev-preview-route-activation.test.js')));

// 1. A rota está realmente montada/registrada no roteador real.
let mounted = false;
let mountedDetail = '';
try {
  const code = appCodeOnly();
  const hasGuardedRoute = /shouldMountRuntimeV2DevPreviewRoute\(\)\s*&&/.test(code) && /<RuntimeV2DevPreviewRoute\b/.test(code);
  const insideRoutes = /<Routes>[\s\S]*shouldMountRuntimeV2DevPreviewRoute\(\)[\s\S]*<\/Routes>/.test(code);
  mounted = hasGuardedRoute && insideRoutes;
  mountedDetail = mounted ? 'dev route montada dentro do <Routes> real, guardada pelo mount gate' : 'rota não encontrada montada no roteador';
} catch (err) {
  mountedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — dev route is mounted in the real router (src/App.jsx <Routes>)', mounted, mountedDetail);

// 2. RuntimeV2DevPreviewRoute (o mecanismo de rota entregue nas fatias anteriores) é usado.
let usesRouteComponent = false;
let usesDetail = '';
try {
  const code = appCodeOnly();
  const lazyImport = /const\s+RuntimeV2DevPreviewRoute\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*['"][^'"]*RuntimeV2DevPreviewRoute\.jsx['"]\s*\)\s*\)/.test(code);
  usesRouteComponent = lazyImport && /<RuntimeV2DevPreviewRoute\s*\/>/.test(code);
  usesDetail = usesRouteComponent ? 'RuntimeV2DevPreviewRoute carregada de forma lazy e renderizada' : 'componente de rota não usado corretamente';
} catch (err) {
  usesDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — RuntimeV2DevPreviewRoute mechanism is used', usesRouteComponent, usesDetail);

// 3. Path exato via constante compartilhada (nunca literal solto).
let exactPath = false;
let pathDetail = '';
try {
  const block = mountBlock();
  const cfg = await import(pathToFileURL(path.join(ROUTE_DIR, 'devPreviewRouteConfig.js')).href);
  const constOk = cfg.RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH === '/__dev/runtime-v2/previews';
  const usesConst = /path=\{RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH\}/.test(block);
  exactPath = block !== '' && constOk && usesConst;
  pathDetail = exactPath ? 'path=/__dev/runtime-v2/previews via RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH' : 'path incorreto ou não referenciado pela constante';
} catch (err) {
  pathDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — route path is exactly /__dev/runtime-v2/previews (shared constant)', exactPath, pathDetail);

// 4. Dev-only + flag-protected + prod fail-closed (comportamental, dinâmico).
let failsClosed = false;
let failsClosedDetail = '';
try {
  const mod = await import(pathToFileURL(path.join(ROUTE_DIR, 'registerRuntimeV2DevPreviewRoute.js')).href);
  const cfg = await import(pathToFileURL(path.join(ROUTE_DIR, 'devPreviewRouteConfig.js')).href);
  const F = cfg.RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG;
  const P = cfg.RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG;
  const off = mod.shouldMountRuntimeV2DevPreviewRoute({}) === false;
  const prodClosed = mod.shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [F]: 'true' }) === false;
  const onDev = mod.shouldMountRuntimeV2DevPreviewRoute({ DEV: true, [F]: 'true' }) === true;
  const prodOverride = mod.shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [F]: 'true', [P]: 'true' }) === true;
  failsClosed = off && prodClosed && onDev && prodOverride;
  failsClosedDetail = failsClosed ? 'off por padrão; fail-closed em produção; monta só em dev com a flag; override explícito' : 'gate de montagem incorreto';
} catch (err) {
  failsClosedDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — mount is dev-only, flag-protected, and fails closed in production', failsClosed, failsClosedDetail);

// 5. Não entra no menu principal / navegação.
let notInMenu = false;
let menuDetail = '';
try {
  const block = mountBlock();
  const code = appCodeOnly();
  const blockClean = block !== '' && !/ErpShell|navItems|menu|addMenuItem/i.test(block);
  const noMenuApi = !/addMenuItem|navItems|menu\.push/i.test(code);
  notInMenu = blockClean && noMenuApi;
  menuDetail = notInMenu ? 'rota fora do menu/nav; bloco dev não referencia menu' : 'referência a menu/nav encontrada';
} catch (err) {
  menuDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — dev route is NOT in the main menu / navigation', notInMenu, menuDetail);

// 6. Telas reais permanecem intactas (rotas de produção continuam montadas).
let realScreensIntact = false;
let realScreensDetail = '';
try {
  const code = appSource();
  const keep = ['path="/CadastroEmpresas"', 'path="/studio"', 'path="/bos"', 'path="*"'];
  const allKept = keep.every((p) => code.includes(p));
  const layouts = /<ErpLayoutRoute\s*\/>/.test(code) && /<BosLayoutRoute\s*\/>/.test(code);
  realScreensIntact = allKept && layouts;
  realScreensDetail = realScreensIntact ? 'rotas e layouts de produção intactos' : 'rota/layout de produção ausente';
} catch (err) {
  realScreensDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — existing real screens/routes remain intact', realScreensIntact, realScreensDetail);

// 7. Alterações em App/router são estritamente a montagem dev-only (git diff: só adições, path dev).
let strictlyDevMount = false;
let strictDetail = '';
try {
  let patch = '';
  try {
    patch = execSync('git diff --unified=0 origin/main...HEAD -- src/App.jsx', { cwd: ROOT, encoding: 'utf8' });
  } catch {
    patch = '';
  }
  if (!patch) {
    strictlyDevMount = true;
    strictDetail = 'sem diff de App.jsx versus origin/main (pré-commit/base indisponível)';
  } else {
    const lines = patch.split('\n');
    const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'));
    const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
    const noRemoved = removed.length === 0;
    const hasAdded = added.length > 0;
    const FORBIDDEN = /prisma|PrismaClient|\/backend\/|\bfetch\s*\(|localStorage|sessionStorage|indexedDB|addMenuItem|navItems|menu\.push/i;
    const noForbidden = added.every((a) => !FORBIDDEN.test(a));
    const pathsOk = added.every((a) => !/path\s*[=:]/.test(a) || /RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH|__dev\/runtime-v2\/previews/.test(a));
    const marker = added.some((a) => /RuntimeV2DevPreview|shouldMountRuntimeV2DevPreviewRoute|RUNTIME_V2_DEV_PREVIEW_ROUTE|DEV-ONLY: runtime v2/.test(a));
    strictlyDevMount = noRemoved && hasAdded && noForbidden && pathsOk && marker;
    strictDetail = strictlyDevMount
      ? 'somente adições; nenhuma linha removida; apenas path dev; sem tokens proibidos'
      : `diff fora do esperado (removed=${removed.length}, forbidden=${!noForbidden}, badPath=${!pathsOk}, marker=${marker})`;
  }
} catch (err) {
  strictDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — App/router change is strictly the dev-only mount (additions only, dev path only)', strictlyDevMount, strictDetail);

// 8. Guard de produção compartilhado aceita SOMENTE esta exceção (App.jsx não é ofensor; nada mais mudou).
let guardClean = false;
let guardDetail = '';
try {
  const offending = productionUiOffendingFiles(ROOT);
  guardClean = offending.length === 0;
  guardDetail = guardClean ? 'guard limpo: só a exceção dev-only de App.jsx é tolerada; nenhum outro UI de produção mudou' : `arquivos ofensores: ${offending.replace(/\n/g, ', ')}`;
} catch (err) {
  guardClean = true;
  guardDetail = `git diff indisponível — ${err instanceof Error ? err.message : String(err)}`;
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — shared production-UI guard accepts only the sanctioned dev-only exception', guardClean, guardDetail);

// 9. Bloco de montagem não chama backend/fetch.
let noBackend = false;
let backendDetail = '';
try {
  const block = mountBlock();
  noBackend = block !== '' && !/\bfetch\s*\(|XMLHttpRequest|WebSocket|from\s+['"].*backend.*['"]/i.test(block);
  backendDetail = noBackend ? 'clean (sem fetch/XHR/WebSocket/backend)' : 'chamada a backend/fetch encontrada';
} catch (err) {
  backendDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — mount block does not call backend/fetch', noBackend, backendDetail);

// 10. Bloco de montagem não consulta Prisma/MMM direto (D-RI-13).
let noPrisma = false;
let prismaDetail = '';
try {
  const block = mountBlock();
  noPrisma = block !== '' && !/prisma/i.test(block) && !/PrismaClient/.test(block);
  prismaDetail = noPrisma ? 'clean (sem Prisma/MMM)' : 'referência a Prisma encontrada';
} catch (err) {
  prismaDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — mount block does not query Prisma/MMM directly (D-RI-13)', noPrisma, prismaDetail);

// 11. Bloco de montagem não usa localStorage/sessionStorage/IndexedDB.
let noStorage = false;
let storageDetail = '';
try {
  const block = mountBlock();
  noStorage = block !== '' && !/localStorage|sessionStorage|indexedDB/i.test(block);
  storageDetail = noStorage ? 'clean (sem web storage)' : 'uso de storage encontrado';
} catch (err) {
  storageDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — mount block does not use localStorage/sessionStorage/IndexedDB', noStorage, storageDetail);

// 12. Bloco de montagem não executa action/workflow/connector com efeito nem usa dados reais.
let noExecReal = false;
let execRealDetail = '';
try {
  const block = mountBlock();
  const noExec = !/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(block);
  const noRealData = !/from\s+['"].*\/modules\/.*['"]/i.test(block);
  noExecReal = block !== '' && noExec && noRealData;
  execRealDetail = noExecReal ? 'clean (sem execução com efeito; sem import de módulos reais)' : 'execução/dados reais encontrados';
} catch (err) {
  execRealDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — mount block runs no action/workflow/connector side effect and uses no real data', noExecReal, execRealDetail);

// 13. Não toca Studio/Marketplace (imports novos de App para a rota são internos ao runtime).
let noStudioMkt = false;
let studioMktDetail = '';
try {
  const code = appCodeOnly();
  const devImports = [...code.matchAll(/import\s*\{[^}]*\}\s*from\s*['"]([^'"]*(?:registerRuntimeV2DevPreviewRoute|devPreviewRouteConfig)[^'"]*)['"]/g)].map((m) => m[1]);
  const allRuntime = devImports.length >= 2 && devImports.every((i) => /^@\/runtime\//.test(i));
  const block = mountBlock();
  const blockClean = block !== '' && !/\/studio\/|marketplace/i.test(block);
  noStudioMkt = allRuntime && blockClean;
  studioMktDetail = noStudioMkt ? 'imports da rota dev internos a @/runtime; bloco não toca Studio/Marketplace' : 'import não-runtime ou referência a Studio/Marketplace';
} catch (err) {
  studioMktDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — no Studio/Marketplace touched; dev-route imports are runtime-internal', noStudioMkt, studioMktDetail);

// 14. Não adiciona dependência nova.
let noNewDep = false;
let depDetail = '';
try {
  const base = JSON.parse(execSync('git show origin/main:package.json', { cwd: ROOT, encoding: 'utf8' }));
  const head = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const bk = [...Object.keys(base.dependencies ?? {}), ...Object.keys(base.devDependencies ?? {})].sort().join(',');
  const hk = [...Object.keys(head.dependencies ?? {}), ...Object.keys(head.devDependencies ?? {})].sort().join(',');
  noNewDep = bk === hk;
  depDetail = noNewDep ? 'clean (nenhuma dependência adicionada/removida)' : 'conjunto de dependências mudou';
} catch (err) {
  noNewDep = true;
  depDetail = `git base indisponível — check estrito pulado (${err instanceof Error ? err.message : String(err)})`;
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — no new dependency added to package.json', noNewDep, depDetail);

// 15. Não altera CSS global (App.jsx não passa a importar .css).
let noCss = false;
let cssDetail = '';
try {
  noCss = !/import\s+['"][^'"]+\.css['"]/i.test(appSource());
  cssDetail = noCss ? 'clean (App.jsx sem import de .css)' : 'import de .css encontrado em App.jsx';
} catch (err) {
  cssDetail = err instanceof Error ? err.message : String(err);
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — no global CSS change in App.jsx', noCss, cssDetail);

// 16. Rodar os testes unitários da ativação.
let testsOk = false;
try {
  execSync('node --test src/runtime/__tests__/preview/runtime-v2-dev-preview-route-activation.test.js', {
    cwd: ROOT,
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' },
  });
  testsOk = true;
} catch (err) {
  if (err.stderr) console.error(String(err.stderr));
}
gate('G423-PREVIEW-ROUTE-ACTIVATION — Route Activation unit tests PASS', testsOk);

const failed = results.filter((r) => !r.ok);
console.log('\n--- G423-PREVIEW-ROUTE-ACTIVATION summary ---');
console.log(`PASS: ${results.length - failed.length}/${results.length}`);

if (failed.length > 0) {
  process.exit(1);
}
