import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRuntimeV2DevPreviewRouteModel } from '../../preview/dev/route/createRuntimeV2DevPreviewRouteModel.js';
import {
  isRuntimeV2DevPreviewRouteEnabled,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG,
  RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG,
} from '../../preview/dev/route/devPreviewRouteConfig.js';
import { RuntimeV2DevPreviewRouteError } from '../../preview/dev/route/errors.js';
import { RUNTIME_V2_DEV_PREVIEW_HUB_FLAG } from '../../preview/dev/hub/devPreviewHubConfig.js';
import { CONTROLLED_DEV_DATASET_FLAG } from '../../preview/dev/data/controlledDatasetConfig.js';

const ROUTE_DIR = '../../preview/dev/route';
const JSX_FILES = ['RuntimeV2DevPreviewRoute.jsx', 'RuntimeV2DevPreviewRoutePage.jsx'];
const ALL_FILES = ['createRuntimeV2DevPreviewRouteModel.js', 'devPreviewRouteConfig.js', 'errors.js', ...JSX_FILES];

function routeSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR);
  return ALL_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}
function routeCodeOnly() {
  return routeSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}
function jsxSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR);
  return JSX_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}

/** env with all three flags on (dev). */
const allOn = { [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true', [CONTROLLED_DEV_DATASET_FLAG]: 'true' };

describe('Runtime v2 Dev Preview Route (post-Foundation C)', () => {
  it('rota default desligada', () => {
    assert.equal(isRuntimeV2DevPreviewRouteEnabled({}), false);
  });

  it('rota habilita somente com a flag (em dev)', () => {
    assert.equal(isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), true);
    assert.equal(isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'false' }), false);
  });

  it('produção falha fechada', () => {
    assert.equal(isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', PROD: true }), false);
    assert.equal(isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', NODE_ENV: 'production' }), false);
  });

  it('override de produção é explícito e testado', () => {
    assert.equal(isRuntimeV2DevPreviewRouteEnabled({ [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', PROD: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG]: 'true' }), true);
  });

  it('route model é determinístico', async () => {
    const a = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    const b = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.deepEqual(a, b);
  });

  it('route model aponta o path /__dev/runtime-v2/previews', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: {} });
    assert.equal(m.routePath, '/__dev/runtime-v2/previews');
    assert.equal(RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH, '/__dev/runtime-v2/previews');
  });

  it('route model inclui hub status', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.equal(m.hubEnabled, true);
    assert.ok(m.hubModel);
    assert.equal(m.hubModel.kind, 'runtime-v2-dev-preview-hub');
  });

  it('route model inclui dataset status', async () => {
    const on = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.equal(on.datasetEnabled, true);
    assert.equal(on.hubModel.flags.datasetIntegrated, true);
    const off = await createRuntimeV2DevPreviewRouteModel({ env: { [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true' } });
    assert.equal(off.datasetEnabled, false);
    assert.equal(off.hubModel.flags.datasetIntegrated, false);
  });

  it('route model não contém dados reais (mocked)', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.equal(m.status.mocked, true);
    const empresas = m.hubModel.modules.find((x) => x.moduleId === 'empresas');
    assert.equal(empresas.metadata.source, 'mock-fixture');
  });

  it('route model mascara dados sensíveis', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    const empresas = m.hubModel.modules.find((x) => x.moduleId === 'empresas');
    assert.equal(empresas.metadata.apiKey, '[REDACTED]');
    // dataset summary also masks (denied field hidden)
    assert.equal(empresas.dataset.recordCount, 3);
  });

  it('route model bloqueia prototype pollution nas options', async () => {
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => createRuntimeV2DevPreviewRouteModel(polluted),
      (err) => err instanceof RuntimeV2DevPreviewRouteError && err.code === 'MAK-L3-DEV-ROUTE-001',
    );
  });

  it('route model é objeto plano serializável (não React element)', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.equal(m.$$typeof, undefined);
    assert.doesNotThrow(() => JSON.stringify(m));
  });

  it('route component renderiza fallback seguro quando off (data-testid fallback)', () => {
    const route = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR, 'RuntimeV2DevPreviewRoute.jsx'), 'utf8');
    assert.equal(/runtime-v2-dev-preview-route-fallback/.test(route), true);
    assert.equal(/isRuntimeV2DevPreviewRouteEnabled/.test(route), true);
  });

  it('route component renderiza aviso dev-only quando on', () => {
    const page = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR, 'RuntimeV2DevPreviewRoutePage.jsx'), 'utf8');
    assert.equal(/dev-route-banner/.test(page), true);
    assert.equal(/status\?\.banner/.test(page), true);
  });

  it('route component renderiza o Hub quando flags permitidas', () => {
    const page = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR, 'RuntimeV2DevPreviewRoutePage.jsx'), 'utf8');
    assert.equal(/RuntimeV2DevPreviewHub/.test(page), true);
    assert.equal(/hubModel/.test(page), true);
  });

  it('banner é o aviso dev-only correto', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.equal(m.status.banner, 'DEV-ONLY — runtime v2 preview using controlled mock data');
  });

  it('route model lista Empresas e cadcps via hub', async () => {
    const m = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    const ids = m.hubModel.modules.map((x) => x.moduleId).sort();
    assert.deepEqual(ids, ['cadcps', 'empresas']);
  });

  it('dataset summary aparece só quando dataset ligado', async () => {
    const on = await createRuntimeV2DevPreviewRouteModel({ env: allOn });
    assert.ok(on.hubModel.modules.find((x) => x.moduleId === 'empresas').dataset);
    const off = await createRuntimeV2DevPreviewRouteModel({ env: { [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true' } });
    assert.equal(off.hubModel.modules.find((x) => x.moduleId === 'empresas').dataset, undefined);
  });

  it('route component não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(routeCodeOnly()), false);
  });

  it('route component não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = routeSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('route component não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(routeCodeOnly()), false);
  });

  it('route component não executa action/workflow/connector', () => {
    assert.equal(/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(routeCodeOnly()), false);
  });

  it('src/App.jsx NÃO é importado/alterado pelos arquivos da rota', () => {
    const code = routeCodeOnly(); // comment-stripped: JSDoc may mention App.jsx to explain it is NOT wired there
    assert.equal(/from\s+['"][^'"]*App(\.jsx)?['"]/i.test(code), false);
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
  });

  it('rota não é adicionada ao menu principal / não vira rota pública (sem router registration)', () => {
    const code = routeCodeOnly();
    // The route DECLARES its path as a constant/descriptor but never registers into a live router/menu.
    assert.equal(/createBrowserRouter|<Routes|useRoutes|addMenuItem|navItems|menu\.push|registerRoute/i.test(code), false);
  });

  it('sem biblioteca nova (imports relativos) e sem CSS global', () => {
    const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR);
    for (const f of ALL_FILES) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `unexpected non-relative import "${imp}" in ${f}`);
      assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(src), false);
    }
  });

  it('componentes de rota NÃO exportados pelo runtime barrel (só helpers puros)', () => {
    const indexSrc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../index.js'), 'utf8');
    assert.equal(/from\s+['"][^'"]*RuntimeV2DevPreviewRoute\.jsx['"]/.test(indexSrc), false);
    assert.equal(/createRuntimeV2DevPreviewRouteModel/.test(indexSrc), true);
    assert.equal(/isRuntimeV2DevPreviewRouteEnabled/.test(indexSrc), true);
  });

  it('productionBlocked reflete produção sem flag', async () => {
    const prod = await createRuntimeV2DevPreviewRouteModel({ env: { PROD: true } });
    assert.equal(prod.productionBlocked, true);
    assert.equal(prod.enabled, false);
    assert.equal(prod.hubModel, null);
  });
});
