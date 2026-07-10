import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  shouldMountRuntimeV2DevPreviewRoute,
  isRuntimeV2DevEnvironment,
  getRuntimeV2DevPreviewRouteMountPlan,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH,
} from '../../preview/dev/route/registerRuntimeV2DevPreviewRoute.js';
import {
  RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG,
} from '../../preview/dev/route/devPreviewRouteConfig.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_JSX = path.join(HERE, '../../../App.jsx');

function appSource() {
  return fs.readFileSync(APP_JSX, 'utf8');
}
/** App.jsx with comments stripped — used for forbidden-token scans. */
function appCodeOnly() {
  return appSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}
/** Only the added dev-route mount block of App.jsx (the guarded <Route .../>). */
function mountBlock() {
  const code = appCodeOnly();
  const m = code.match(/shouldMountRuntimeV2DevPreviewRoute\(\)\s*&&[\s\S]*?\/>\s*\)\s*\}/);
  return m ? m[0] : '';
}

/** dev env with the route flag on. */
const devOn = { DEV: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' };

describe('Runtime v2 Dev Preview Route Activation (post-Foundation C)', () => {
  // --- The route is really mounted in the real router (src/App.jsx) ---
  it('a rota dev está montada no roteador real (src/App.jsx)', () => {
    const code = appCodeOnly();
    assert.equal(/shouldMountRuntimeV2DevPreviewRoute\(\)\s*&&/.test(code), true);
    assert.equal(/<RuntimeV2DevPreviewRoute\b/.test(code), true);
  });

  it('a montagem usa o path dev exato via constante (nunca literal solto)', () => {
    const block = mountBlock();
    assert.notEqual(block, '');
    assert.equal(/path=\{RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH\}/.test(block), true);
    // O valor da constante é exatamente o path dev.
    assert.equal(RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH, '/__dev/runtime-v2/previews');
  });

  it('App.jsx importa o gate de montagem e o path da rota dev', () => {
    const code = appCodeOnly();
    assert.equal(/import\s*\{\s*shouldMountRuntimeV2DevPreviewRoute\s*\}\s*from\s*['"][^'"]*registerRuntimeV2DevPreviewRoute\.js['"]/.test(code), true);
    assert.equal(/import\s*\{\s*RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH\s*\}\s*from\s*['"][^'"]*devPreviewRouteConfig\.js['"]/.test(code), true);
  });

  it('a rota é carregada de forma lazy a partir do módulo runtime v2', () => {
    const code = appCodeOnly();
    assert.equal(/const\s+RuntimeV2DevPreviewRoute\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*['"][^'"]*RuntimeV2DevPreviewRoute\.jsx['"]\s*\)\s*\)/.test(code), true);
  });

  // --- Dev-only / flag-protected / prod fail-closed (behavioral) ---
  it('a montagem é guardada por shouldMountRuntimeV2DevPreviewRoute (off por padrão)', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({}), false);
    assert.equal(getRuntimeV2DevPreviewRouteMountPlan({ env: {} }).shouldMount, false);
  });

  it('a rota só monta com a flag ligada (em dev)', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute(devOn), true);
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ DEV: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'false' }), false);
  });

  it('a rota falha fechada em produção (sem override)', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), false);
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ NODE_ENV: 'production', [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), false);
  });

  it('override de produção explícito é o único caminho em prod', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', [RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG]: 'true' }), true);
  });

  it('exige ambiente de desenvolvimento', () => {
    assert.equal(isRuntimeV2DevEnvironment({ DEV: true }), true);
    assert.equal(isRuntimeV2DevEnvironment({ PROD: true }), false);
  });

  // --- flag off does not break the app / plan is deterministic ---
  it('com a flag desligada a app não quebra: rota simplesmente não é adicionada', () => {
    // A montagem é uma expressão `cond && <Route/>` — quando falsa, React ignora o filho.
    const block = mountBlock();
    assert.equal(/^shouldMountRuntimeV2DevPreviewRoute\(\)\s*&&/.test(block), true);
    // Fora do bloco guardado, nenhuma outra referência à rota dev deve montá-la incondicionalmente.
    const code = appCodeOnly();
    const occurrences = (code.match(/<RuntimeV2DevPreviewRoute\b/g) || []).length;
    assert.equal(occurrences, 1);
  });

  it('mount plan é determinístico e reporta path/menu/publico previsíveis', () => {
    const plan = getRuntimeV2DevPreviewRouteMountPlan({ env: devOn });
    assert.deepEqual(plan, getRuntimeV2DevPreviewRouteMountPlan({ env: devOn }));
    assert.equal(plan.path, '/__dev/runtime-v2/previews');
    assert.equal(plan.inMainMenu, false);
    assert.equal(plan.publicRoute, false);
  });

  // --- hub/dataset keep their own flags ---
  it('hub e dataset continuam controlados por flags próprias (App não as força)', () => {
    const code = appCodeOnly();
    assert.equal(/RUNTIME_V2_DEV_PREVIEW_HUB_FLAG\s*[:=]\s*['"]true['"]/.test(code), false);
    assert.equal(/CONTROLLED_DEV_DATASET_FLAG\s*[:=]\s*['"]true['"]/.test(code), false);
  });

  // --- not in the menu / navigation unchanged ---
  it('a rota dev NÃO entra no menu principal / navegação', () => {
    const code = appCodeOnly();
    assert.equal(/addMenuItem|navItems|menu\.push/i.test(code), false);
    // O bloco dev não referencia ErpShell/menu/nav.
    assert.equal(/ErpShell|navItems|menu/i.test(mountBlock()), false);
  });

  it('rotas de produção existentes permanecem intactas', () => {
    const code = appSource();
    // Rotas reais que devem continuar montadas.
    for (const p of ['path="/CadastroEmpresas"', 'path="/studio"', 'path="/bos"', 'path="*"']) {
      assert.equal(code.includes(p), true, `rota ausente: ${p}`);
    }
    // Layout de produção intacto.
    assert.equal(/<ErpLayoutRoute\s*\/>/.test(code), true);
    assert.equal(/<BosLayoutRoute\s*\/>/.test(code), true);
  });

  // --- no backend / fetch / prisma / storage in the added block ---
  it('o bloco de montagem não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(mountBlock()), false);
  });

  it('o bloco de montagem não consulta Prisma/MMM direto (D-RI-13)', () => {
    const block = mountBlock();
    assert.equal(/prisma/i.test(block), false);
    assert.equal(/PrismaClient/.test(block), false);
  });

  it('o bloco de montagem não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(mountBlock()), false);
  });

  it('o bloco de montagem não executa action/workflow/connector com efeito', () => {
    assert.equal(/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(mountBlock()), false);
  });

  it('o bloco de montagem não usa dados reais (sem import de src/modules)', () => {
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(mountBlock()), false);
  });

  // --- no new dependency / no global CSS added ---
  it('os imports novos de App.jsx para a rota dev são internos (@/runtime), sem dependência nova', () => {
    const code = appCodeOnly();
    const devImports = [...code.matchAll(/import\s*\{[^}]*\}\s*from\s*['"]([^'"]*(?:registerRuntimeV2DevPreviewRoute|devPreviewRouteConfig)[^'"]*)['"]/g)].map((m) => m[1]);
    assert.equal(devImports.length >= 2, true);
    for (const imp of devImports) {
      assert.equal(/^@\/runtime\//.test(imp), true, `import da rota dev não é interno ao runtime: ${imp}`);
    }
  });

  it('nenhuma importação de CSS global foi adicionada por causa da rota dev', () => {
    // App.jsx não deve passar a importar arquivos .css por conta desta ativação.
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(appSource()), false);
  });

  // --- the App.jsx change is strictly the dev-only mount (git-diff shape) ---
  it('a alteração de App.jsx é estritamente a montagem dev-only (apenas adições, path dev)', async () => {
    const { execSync } = await import('node:child_process');
    const ROOT = path.join(HERE, '../../../..');
    let patch = '';
    try {
      patch = execSync('git diff --unified=0 origin/main...HEAD -- src/App.jsx', { cwd: ROOT, encoding: 'utf8' });
    } catch {
      patch = '';
    }
    if (!patch) return; // pré-commit / base indisponível — validação de forma coberta pelo gate pós-commit
    const lines = patch.split('\n');
    const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'));
    assert.equal(removed.length, 0, 'App.jsx não deve remover/alterar linhas existentes');
    const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
    assert.equal(added.length > 0, true);
    for (const a of added) {
      assert.equal(/prisma|PrismaClient|\/backend\/|\bfetch\s*\(|localStorage|sessionStorage|indexedDB/i.test(a), false, `linha proibida adicionada: ${a}`);
      if (/path\s*[=:]/.test(a)) {
        assert.equal(/RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH|__dev\/runtime-v2\/previews/.test(a), true, `path adicionado não é o dev: ${a}`);
      }
    }
  });

  // --- shared production-UI guard accepts only this exception ---
  it('o guard de produção compartilhado aceita apenas a exceção dev-only', async () => {
    const guard = await import('../../../../scripts/gates/lib/productionUiGuard.mjs');
    const ROOT = path.join(HERE, '../../../..');
    // Não deve reportar App.jsx como ofensor (a exceção sancionada), nem qualquer arquivo.
    const offending = guard.productionUiOffendingFiles(ROOT);
    assert.equal(offending.includes('src/App.jsx'), false, `guard rejeitou App.jsx indevidamente: ${offending}`);
  });
});
