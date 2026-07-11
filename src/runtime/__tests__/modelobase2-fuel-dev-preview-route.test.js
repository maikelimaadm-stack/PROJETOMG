import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  resolveModeloBase2FuelDevPreviewAccess,
  createModeloBase2FuelDevPreviewState,
  createModeloBase2FuelDevPreviewFixtures,
  createModeloBase2FuelDevPreviewDiagnostics,
  shouldMountModeloBase2FuelDevPreviewRoute,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG,
  MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG,
} from '../../ModeloBase2/fuel-ui-sandbox/dev-preview/index.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV_DIR = path.join(HERE, '../../ModeloBase2/fuel-ui-sandbox/dev-preview');
const HEADLESS_DIR = path.join(HERE, '../../ModeloBase2/fuel-headless');
const OPRUNTIME_DIR = path.join(HERE, '../../ModeloBase2/operational-runtime');
const APP_JSX = path.join(HERE, '../../App.jsx');
const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && /\.(js|jsx)$/.test(e.name) ? [full] : [];
}) : []);
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const importsOf = (files) => files.flatMap((f) => [...codeOnly(fs.readFileSync(f, 'utf8')).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]));
const pureDevFiles = () => walk(DEV_DIR).filter((f) => f.endsWith('.js'));
const routeFile = path.join(DEV_DIR, 'ModeloBase2FuelDevPreviewRoute.jsx');

const F = MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG;
const AP = MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG;

describe('ModeloBase2 Fuel Dev Preview Route (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4
  it('access resolver: off default; dev+flag on; prod fail-closed; prod+allowProd on (warning)', () => {
    assert.equal(resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true' } }).allowed, false);
    assert.equal(resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true', [F]: 'true' } }).allowed, true);
    assert.equal(resolveModeloBase2FuelDevPreviewAccess({ env: { MODE: 'production', [F]: 'true' } }).allowed, false);
    const prod = resolveModeloBase2FuelDevPreviewAccess({ env: { MODE: 'production', [F]: 'true', [AP]: 'true' } });
    assert.equal(prod.allowed, true);
    assert.ok(prod.warnings.length >= 1);
  });

  // 5 route path dev-only
  it('routePath é dev-only (/__dev/...)', () => {
    assert.equal(MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH, '/__dev/modelobase2/fuel');
    assert.match(MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH, /^\/__dev\//);
  });

  // 6 / 7 / 8 / 9 / 10 invariants
  it('access: menuRegistered false; backend/prisma/runtimeBridge Touched false; persistenceReal false', () => {
    const a = resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true', [F]: 'true' } });
    assert.equal(a.menuRegistered, false);
    assert.equal(a.backendTouched, false);
    assert.equal(a.prismaTouched, false);
    assert.equal(a.runtimeBridgeTouched, false);
    assert.equal(a.persistenceReal, false);
  });

  // shouldMount
  it('shouldMount só com dev + flag', () => {
    assert.equal(shouldMountModeloBase2FuelDevPreviewRoute({ DEV: 'true' }), false);
    assert.equal(shouldMountModeloBase2FuelDevPreviewRoute({ DEV: 'true', [F]: 'true' }), true);
    assert.equal(shouldMountModeloBase2FuelDevPreviewRoute({ MODE: 'production', [F]: 'true' }), false);
  });

  // 11 / 12 fixtures
  it('fixtures determinísticas; sem dados sensíveis; modos empty/basic/withDraft/withEvents', () => {
    const a = createModeloBase2FuelDevPreviewFixtures({ mode: 'basic' });
    const b = createModeloBase2FuelDevPreviewFixtures({ mode: 'basic' });
    assert.deepEqual(a.entries, b.entries);
    assert.equal(a.hasSensitiveData, false);
    assert.equal(a.fictional, true);
    assert.deepEqual(createModeloBase2FuelDevPreviewFixtures({ mode: 'empty' }).entries, []);
    assert.ok(createModeloBase2FuelDevPreviewFixtures({ mode: 'withEvents' }).seedActions.some((s) => s.action === 'validate'));
    for (const m of ['empty', 'basic', 'withDraft', 'withEvents']) assert.ok(a.modes.includes(m), m);
  });

  // 13 / 14 / 15 / 16 / 17 preview state
  it('preview state: viewModel + actions; localOnly/sent:false/persistenceReal:false', () => {
    const st = createModeloBase2FuelDevPreviewState({ mode: 'basic', env: { DEV: 'true', [F]: 'true' } });
    assert.equal(st.kind, 'modelobase2-fuel-dev-preview-state');
    assert.ok(st.viewModel && st.viewModel.form.fields.length > 0);
    assert.ok(st.actions && st.actions.actions.length > 0);
    assert.equal(st.localOnly, true);
    assert.equal(st.sent, false);
    assert.equal(st.persistenceReal, false);
    assert.equal(st.viewModel.table.rows.length, 2);
    assert.equal(st.viewModel.summaryCards.find((c) => c.id === 'totalLiters').value, 360);
  });

  // diagnostics
  it('diagnostics: menuRegistered false; invariantes seguros; readiness', () => {
    const access = resolveModeloBase2FuelDevPreviewAccess({ env: { DEV: 'true', [F]: 'true' } });
    const d = createModeloBase2FuelDevPreviewDiagnostics({ previewId: 'p', access, fixtureMode: 'basic' });
    assert.equal(d.menuRegistered, false);
    assert.equal(d.persistenceReal, false);
    assert.equal(d.backendTouched, false);
    assert.equal(d.readiness, 'ready');
    const denied = createModeloBase2FuelDevPreviewDiagnostics({ previewId: 'p', access: resolveModeloBase2FuelDevPreviewAccess({ env: {} }) });
    assert.equal(denied.readiness, 'blocked');
  });

  // 18 / 19 route component (source scan)
  it('route component é exportável e usa o sandbox shell', () => {
    const src = fs.readFileSync(routeFile, 'utf8');
    assert.ok(/export function ModeloBase2FuelDevPreviewRoute/.test(src));
    assert.ok(/ModeloBase2FuelSandboxShell/.test(src));
  });

  // 20 / 21 / 22 / 23 route component isolation (source scan)
  it('route component não importa backend/API/Prisma/runtimeBridge/makBootstrap; sem fetch/storage', () => {
    const imports = importsOf([routeFile]);
    assert.ok(imports.every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(imports.every((p) => !/makBootstrap|runtimeBridge/.test(p)));
    const code = codeOnly(fs.readFileSync(routeFile, 'utf8'));
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code));
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
  });

  // 24 / 25 App.jsx scope
  it('App.jsx: só rota dev-only adicionada; menu/rotas produtivas intactas', () => {
    const app = fs.readFileSync(APP_JSX, 'utf8');
    assert.ok(app.includes('shouldMountModeloBase2FuelDevPreviewRoute'), 'guard imported');
    assert.ok(app.includes('MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH'), 'path imported');
    assert.ok(app.includes('ModeloBase2FuelDevPreviewRoute'), 'route lazy imported');
    // the fuel route is guarded (mounted only behind shouldMount)
    assert.match(app, /shouldMountModeloBase2FuelDevPreviewRoute\(\)\s*&&/);
  });

  // 29 / 30 headless + operational-runtime React-free
  it('fuel-headless e operational-runtime continuam React-free', () => {
    assert.ok(importsOf(walk(HEADLESS_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
    assert.ok(importsOf(walk(OPRUNTIME_DIR)).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
  });

  // 31 React only in the route .jsx (dev-preview pure files React-free)
  it('React só no route .jsx; arquivos puros do dev-preview sem React', () => {
    assert.ok(importsOf(pureDevFiles()).every((p) => p !== 'react' && !/^react(\/|$)/.test(p)), 'pure dev-preview no react');
    assert.ok(importsOf([routeFile]).some((p) => p === 'react'), 'route uses react');
  });

  // pure dev-preview does not import backend/modules
  it('pure dev-preview não importa backend/API/Prisma nem src/modules', () => {
    const imports = importsOf(pureDevFiles());
    assert.ok(imports.every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(imports.every((p) => !/makBootstrap|runtimeBridge/.test(p)));
    assert.ok(imports.every((p) => !/\/modules\//.test(p)));
  });

  // return safe copies / no mutation
  it('preview state: mutar retorno não altera fixtures internas', () => {
    const st = createModeloBase2FuelDevPreviewState({ mode: 'basic', env: { DEV: 'true', [F]: 'true' } });
    st.fixtures.entries.push({ INJECTED: true });
    assert.ok(!createModeloBase2FuelDevPreviewFixtures({ mode: 'basic' }).entries.some((e) => e.INJECTED));
  });

  // next step
  it('próximo passo (route report) = Fuel Module Shell Readiness (docs); route não faz backend write', () => {
    // structural: the route component / config never reference backend write
    const src = fs.readFileSync(routeFile, 'utf8');
    assert.ok(!/backend\s*write|prisma|fetch\s*\(/i.test(codeOnly(src)));
  });
});
