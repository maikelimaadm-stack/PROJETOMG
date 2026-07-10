import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRuntimeV2DevPreviewHubModel } from '../../preview/dev/hub/createRuntimeV2DevPreviewHubModel.js';
import {
  isRuntimeV2DevPreviewHubEnabled,
  detectEnvLabel,
  RUNTIME_V2_DEV_PREVIEW_HUB_FLAG,
  RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD_FLAG,
} from '../../preview/dev/hub/devPreviewHubConfig.js';
import { RuntimeV2DevPreviewHubError } from '../../preview/dev/hub/errors.js';

const HUB_DIR = '../../preview/dev/hub';
const JSX_FILES = ['RuntimeV2DevPreviewHub.jsx', 'RuntimeV2DevPreviewHubPanel.jsx', 'RuntimeV2DevPreviewModuleCard.jsx'];
const ALL_FILES = ['createRuntimeV2DevPreviewHubModel.js', 'devPreviewHubConfig.js', 'errors.js', ...JSX_FILES];

function hubSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), HUB_DIR);
  return ALL_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}
function hubCodeOnly() {
  return hubSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}
function jsxSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), HUB_DIR);
  return JSX_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}

let model;

describe('Runtime v2 Dev Preview Hub (post-Foundation C)', () => {
  before(async () => {
    model = await createRuntimeV2DevPreviewHubModel({ env: { [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true' } });
  });

  it('hub default desligado', () => {
    assert.equal(isRuntimeV2DevPreviewHubEnabled({}), false);
  });

  it('hub habilita somente com a flag (em dev)', () => {
    assert.equal(isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true' }), true);
    assert.equal(isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'false' }), false);
  });

  it('produção falha fechada (salvo override explícito)', () => {
    assert.equal(isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true', PROD: true }), false);
    assert.equal(isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true', NODE_ENV: 'production' }), false);
    assert.equal(isRuntimeV2DevPreviewHubEnabled({ [RUNTIME_V2_DEV_PREVIEW_HUB_FLAG]: 'true', PROD: true, [RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD_FLAG]: 'true' }), true);
    assert.equal(detectEnvLabel({ PROD: true }), 'production');
    assert.equal(detectEnvLabel({}), 'development');
  });

  it('hub model é determinístico', async () => {
    const a = await createRuntimeV2DevPreviewHubModel({ env: {} });
    const b = await createRuntimeV2DevPreviewHubModel({ env: {} });
    assert.deepEqual(a, b);
  });

  it('hub model lista Empresas', () => {
    assert.ok(model.modules.find((m) => m.moduleId === 'empresas'));
  });

  it('hub model lista cadcps (segundo módulo)', () => {
    const cadcps = model.modules.find((m) => m.moduleId === 'cadcps');
    assert.ok(cadcps);
    assert.equal(cadcps.source, 'generic-module-pipeline');
  });

  it('hub model não contém dados reais (mocked)', () => {
    assert.equal(model.status.mocked, true);
    const empresas = model.modules.find((m) => m.moduleId === 'empresas');
    assert.equal(empresas.metadata.source, 'mock-fixture');
  });

  it('hub model mascara dados sensíveis', () => {
    const empresas = model.modules.find((m) => m.moduleId === 'empresas');
    assert.equal(empresas.metadata.apiKey, '[REDACTED]');
  });

  it('hub model bloqueia prototype pollution nas options', async () => {
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => createRuntimeV2DevPreviewHubModel(polluted),
      (err) => err instanceof RuntimeV2DevPreviewHubError && err.code === 'MAK-L3-DEV-HUB-001',
    );
  });

  it('hub model é objeto plano serializável (não React element)', () => {
    assert.equal(model.$$typeof, undefined);
    assert.equal(model.kind, 'runtime-v2-dev-preview-hub');
    assert.doesNotThrow(() => JSON.stringify(model));
  });

  it('hub visual recebe hub model (componente aceita prop hubModel)', () => {
    assert.equal(/hubModel/.test(jsxSource()), true);
  });

  it('hub visual renderiza status (data-testid dev-hub-status)', () => {
    assert.equal(/dev-hub-status/.test(jsxSource()), true);
  });

  it('hub visual renderiza card Empresas e card cadcps (map de modules)', () => {
    assert.equal(/RuntimeV2DevPreviewModuleCard/.test(jsxSource()), true);
    assert.equal(/modules\.map/.test(jsxSource()), true);
  });

  it('cada card renderiza tabela, formulário e diagnostics', () => {
    const card = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), HUB_DIR, 'RuntimeV2DevPreviewModuleCard.jsx'), 'utf8');
    assert.equal(/dev-hub-table-/.test(card), true);
    assert.equal(/dev-hub-form-/.test(card), true);
    assert.equal(/dev-hub-diagnostics-/.test(card), true);
  });

  it('hub model carrega table/form summaries por módulo', () => {
    for (const m of model.modules) {
      assert.equal(typeof m.table.columnCount, 'number');
      assert.equal(typeof m.form.fieldCount, 'number');
      assert.ok(Array.isArray(m.diagnostics.warnings));
      assert.ok(Array.isArray(m.differences));
    }
  });

  it('actions/workflows aparecem apenas como metadados', () => {
    for (const m of model.modules) {
      for (const a of m.actions) {
        assert.equal(typeof a.label, 'string');
        assert.equal(typeof a.execute, 'undefined');
      }
      for (const w of m.workflows) {
        assert.equal(typeof w.start, 'undefined');
      }
    }
  });

  it('não executa action/workflow/connector (sem onClick/dispatch/start/execute no código)', () => {
    const code = hubCodeOnly();
    assert.equal(/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(|connectorEngine/.test(code), false);
  });

  it('não chama backend/fetch', () => {
    const code = hubCodeOnly();
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(code), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = hubSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(hubCodeOnly()), false);
  });

  it('não altera telas reais (sem import de src/modules) nem App.jsx', () => {
    const code = hubSource();
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
    assert.equal(/App\.jsx/i.test(code), false);
  });

  it('não adiciona item no menu principal nem rota (sem router/menu no código)', () => {
    const code = hubCodeOnly();
    assert.equal(/createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code), false);
  });

  it('sem biblioteca nova (imports relativos) e sem CSS global', () => {
    const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), HUB_DIR);
    for (const f of ALL_FILES) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `unexpected non-relative import "${imp}" in ${f}`);
      assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(src), false);
    }
  });

  it('hub é exportável sem montagem automática (sem createRoot/ReactDOM/render/DOM)', () => {
    const code = hubCodeOnly();
    assert.equal(/createRoot|ReactDOM|\.render\s*\(|document\.|window\./i.test(code), false);
  });

  it('componentes hub NÃO são exportados pelo runtime barrel (só helpers puros)', () => {
    const indexSrc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../index.js'), 'utf8');
    assert.equal(/from\s+['"][^'"]*RuntimeV2DevPreviewHub\.jsx['"]/.test(indexSrc), false);
    assert.equal(/createRuntimeV2DevPreviewHubModel/.test(indexSrc), true);
    assert.equal(/isRuntimeV2DevPreviewHubEnabled/.test(indexSrc), true);
  });

  it('hub model retorna cópia segura (mutar não afeta nova build)', async () => {
    const a = await createRuntimeV2DevPreviewHubModel({ env: {} });
    a.modules.push({ moduleId: 'fake' });
    a.modules[0].metadata = { tampered: true };
    const b = await createRuntimeV2DevPreviewHubModel({ env: {} });
    assert.equal(b.modules.length, 2);
    assert.notDeepEqual(b.modules[0].metadata, { tampered: true });
  });

  it('genericidade: Empresas usa pipeline específico, cadcps usa pipeline genérico', () => {
    const empresas = model.modules.find((m) => m.moduleId === 'empresas');
    const cadcps = model.modules.find((m) => m.moduleId === 'cadcps');
    assert.equal(empresas.source, 'empresas-specific-pipeline');
    assert.equal(cadcps.source, 'generic-module-pipeline');
  });

  it('cadcps mostra campo denied nos diagnostics via M09 (deniedFields)', () => {
    const cadcps = model.modules.find((m) => m.moduleId === 'cadcps');
    assert.equal(cadcps.diagnostics.deniedFields.includes('ativo'), true);
  });

  it('empresas mostra campo denied nos diagnostics (inscricao_estadual)', () => {
    const empresas = model.modules.find((m) => m.moduleId === 'empresas');
    assert.equal(empresas.diagnostics.deniedFields.includes('inscricao_estadual'), true);
  });

  it('status do hub reporta contagem de módulos e ambiente', () => {
    assert.equal(model.status.moduleCount, 2);
    assert.equal(model.status.devOnly, true);
    assert.ok(['development', 'production'].includes(model.environment));
  });

  it('limitations documentam dev-only / mocked / passivo', () => {
    assert.ok(model.limitations.some((l) => /dev-only/i.test(l)));
    assert.ok(model.limitations.some((l) => /mocked/i.test(l)));
  });
});
