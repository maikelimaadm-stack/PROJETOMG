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

const ROUTE_DIR = '../../preview/dev/route';
const MOUNT_FILES = ['registerRuntimeV2DevPreviewRoute.js', 'RuntimeV2DevPreviewRouteMount.jsx'];
function mountSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR);
  return MOUNT_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}
function mountCodeOnly() {
  return mountSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/** dev env with the route flag on. */
const devOn = { DEV: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' };

describe('Runtime v2 Dev Preview Route Mount (post-Foundation C)', () => {
  it('rota não monta por padrão', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({}), false);
    assert.equal(getRuntimeV2DevPreviewRouteMountPlan({ env: {} }).shouldMount, false);
  });

  it('rota monta somente com a flag (em dev)', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute(devOn), true);
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ DEV: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'false' }), false);
  });

  it('rota é bloqueada em produção (sem override)', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), false);
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ NODE_ENV: 'production', [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' }), false);
  });

  it('override de produção explícito permite montar', () => {
    assert.equal(shouldMountRuntimeV2DevPreviewRoute({ PROD: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true', [RUNTIME_V2_DEV_PREVIEW_ROUTE_ALLOW_PROD_FLAG]: 'true' }), true);
  });

  it('exige ambiente de desenvolvimento (isRuntimeV2DevEnvironment)', () => {
    assert.equal(isRuntimeV2DevEnvironment({ DEV: true }), true);
    assert.equal(isRuntimeV2DevEnvironment({}), true); // node --test defaults to development
    assert.equal(isRuntimeV2DevEnvironment({ PROD: true }), false);
  });

  it('path é exatamente /__dev/runtime-v2/previews', () => {
    assert.equal(RUNTIME_V2_DEV_PREVIEW_ROUTE_PATH, '/__dev/runtime-v2/previews');
    assert.equal(getRuntimeV2DevPreviewRouteMountPlan({ env: devOn }).path, '/__dev/runtime-v2/previews');
  });

  it('mount plan é determinístico', () => {
    assert.deepEqual(getRuntimeV2DevPreviewRouteMountPlan({ env: devOn }), getRuntimeV2DevPreviewRouteMountPlan({ env: devOn }));
  });

  it('rota não aparece no menu principal (inMainMenu false) e não é pública', () => {
    const plan = getRuntimeV2DevPreviewRouteMountPlan({ env: devOn });
    assert.equal(plan.inMainMenu, false);
    assert.equal(plan.publicRoute, false);
  });

  it('mount plan reporta razão previsível', () => {
    assert.equal(getRuntimeV2DevPreviewRouteMountPlan({ env: devOn }).reason, 'mountable');
    assert.equal(getRuntimeV2DevPreviewRouteMountPlan({ env: { PROD: true, [RUNTIME_V2_DEV_PREVIEW_ROUTE_FLAG]: 'true' } }).reason, 'not a development environment');
    assert.equal(getRuntimeV2DevPreviewRouteMountPlan({ env: { DEV: true } }).reason, 'route flag off or production-blocked');
  });

  it('mount wrapper renderiza fallback (null) quando não deve montar', () => {
    const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR, 'RuntimeV2DevPreviewRouteMount.jsx'), 'utf8');
    assert.equal(/shouldMountRuntimeV2DevPreviewRoute/.test(src), true);
    assert.equal(/return null/.test(src), true);
  });

  it('hub continua controlado por flag própria (mount não força hub)', () => {
    const code = mountCodeOnly();
    assert.equal(/RUNTIME_V2_DEV_PREVIEW_HUB_FLAG\s*[:=]\s*['"]true['"]/.test(code), false);
  });

  it('dataset continua controlado por flag própria (mount não força dataset)', () => {
    const code = mountCodeOnly();
    assert.equal(/CONTROLLED_DEV_DATASET_FLAG\s*[:=]\s*['"]true['"]/.test(code), false);
  });

  it('não chama backend/fetch', () => {
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(mountCodeOnly()), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = mountSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(mountCodeOnly()), false);
  });

  it('não executa action/workflow/connector', () => {
    assert.equal(/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(mountCodeOnly()), false);
  });

  it('não usa dados reais (nenhum import de src/modules) nem App.jsx', () => {
    const code = mountCodeOnly();
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
    assert.equal(/from\s+['"][^'"]*App(\.jsx)?['"]/i.test(code), false);
  });

  it('mount não registra em router/menu ativo (sem createBrowserRouter/<Routes>/menu)', () => {
    const code = mountCodeOnly();
    assert.equal(/createBrowserRouter|<Routes|useRoutes|addMenuItem|navItems|menu\.push|registerRoute/i.test(code), false);
  });

  it('sem biblioteca nova (imports relativos) e sem CSS global', () => {
    const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), ROUTE_DIR);
    for (const f of MOUNT_FILES) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `unexpected non-relative import "${imp}" in ${f}`);
      assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(src), false);
    }
  });

  it('helpers de mount exportados pelo runtime barrel; .jsx NÃO exportado; App.jsx NÃO alterado', () => {
    const indexSrc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../index.js'), 'utf8');
    assert.equal(/shouldMountRuntimeV2DevPreviewRoute/.test(indexSrc), true);
    assert.equal(/from\s+['"][^'"]*RuntimeV2DevPreviewRouteMount\.jsx['"]/.test(indexSrc), false);
  });
});
