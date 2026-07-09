import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasDevPreviewFixture } from '../../preview/dev/createEmpresasDevPreviewFixture.js';
import {
  isEmpresasDevPreviewHarnessEnabled,
  EMPRESAS_DEV_PREVIEW_HARNESS_FLAG,
  EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD_FLAG,
} from '../../preview/dev/devPreviewHarnessConfig.js';
import { createEmpresasDevPreviewModel } from '../../preview/dev/devPreviewConfig.js';

const DEV_DIR = '../../preview/dev';
const HARNESS_JSX = 'EmpresasDevPreviewHarness.jsx';
const HARNESS_FILES = ['createEmpresasDevPreviewFixture.js', 'devPreviewHarnessConfig.js', 'EmpresasDevPreviewHarness.jsx'];

function harnessSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), DEV_DIR);
  return HARNESS_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}
function harnessCodeOnly() {
  return harnessSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}
function jsxSource() {
  return fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), DEV_DIR, HARNESS_JSX), 'utf8');
}

describe('Empresas Dev-Only Preview Harness (post-Foundation C)', () => {
  it('harness default desligado', () => {
    assert.equal(isEmpresasDevPreviewHarnessEnabled({}), false);
  });

  it('harness habilita somente com a flag (em dev)', () => {
    assert.equal(isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'true' }), true);
    assert.equal(isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'false' }), false);
  });

  it('produção falha fechada (salvo override explícito)', () => {
    assert.equal(isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'true', PROD: true }), false);
    assert.equal(isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'true', NODE_ENV: 'production' }), false);
    assert.equal(isEmpresasDevPreviewHarnessEnabled({ [EMPRESAS_DEV_PREVIEW_HARNESS_FLAG]: 'true', PROD: true, [EMPRESAS_DEV_PREVIEW_HARNESS_ALLOW_PROD_FLAG]: 'true' }), true);
  });

  it('fixture é determinística', () => {
    assert.deepEqual(createEmpresasDevPreviewFixture(), createEmpresasDevPreviewFixture());
  });

  it('fixture não contém dados reais (marcada como mock)', () => {
    const fx = createEmpresasDevPreviewFixture();
    assert.equal(fx.meta.source, 'mock-fixture');
    assert.equal(fx.meta.mocked, true);
    // structural only — field/column entries carry ids/labels/metadata, never company records
    assert.equal(fx.isPreviewModel, true);
  });

  it('fixture mascara dados sensíveis', () => {
    const fx = createEmpresasDevPreviewFixture();
    assert.equal(fx.meta.apiKey, '[REDACTED]');
    assert.equal(fx.meta.region, 'BR');
  });

  it('fixture é um preview model válido (aceito pelo dev preview)', () => {
    const fx = createEmpresasDevPreviewFixture();
    const view = createEmpresasDevPreviewModel(fx);
    assert.equal(view.valid, true);
  });

  it('harness usa EmpresasDevPreview', () => {
    assert.equal(/from\s+['"]\.\/EmpresasDevPreview\.jsx['"]/.test(jsxSource()), true);
  });

  it('harness renderiza tabela com a fixture (colunas estruturais)', () => {
    const view = createEmpresasDevPreviewModel(createEmpresasDevPreviewFixture());
    assert.deepEqual(view.table.columns.map((c) => c.id), ['codempresa', 'cpf_cnpj', 'inscricao_estadual', 'razao_social', 'status']);
  });

  it('harness renderiza formulário com a fixture (campos estruturais)', () => {
    const view = createEmpresasDevPreviewModel(createEmpresasDevPreviewFixture());
    assert.ok(view.form.fields.find((f) => f.id === 'razao_social'));
  });

  it('harness renderiza diagnostics', () => {
    const view = createEmpresasDevPreviewModel(createEmpresasDevPreviewFixture());
    assert.equal(view.diagnostics.deniedFields.includes('inscricao_estadual'), true);
    assert.ok(view.diagnostics.warnings.length > 0);
  });

  it('harness renderiza differences', () => {
    const view = createEmpresasDevPreviewModel(createEmpresasDevPreviewFixture());
    assert.equal(view.differences.some((d) => d.path === 'form'), true);
  });

  it('actions aparecem apenas como metadados', () => {
    const view = createEmpresasDevPreviewModel(createEmpresasDevPreviewFixture());
    for (const a of view.actions) {
      assert.equal(typeof a.label, 'string');
      assert.equal(typeof a.execute, 'undefined');
    }
  });

  it('workflows aparecem apenas como metadados', () => {
    const view = createEmpresasDevPreviewModel(createEmpresasDevPreviewFixture());
    for (const w of view.workflows) {
      assert.equal(typeof w.label, 'string');
      assert.equal(typeof w.start, 'undefined');
    }
  });

  it('connectors aparecem apenas como metadados (sem execução no código)', () => {
    const code = harnessCodeOnly();
    assert.equal(/connectorEngine|\.execute\s*\(/.test(code), false);
  });

  it('não executa action/workflow/connector (sem onClick/dispatch/start/execute)', () => {
    const code = harnessCodeOnly();
    assert.equal(/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(/.test(code), false);
  });

  it('não chama backend/fetch', () => {
    const code = harnessCodeOnly();
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(code), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = harnessSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    const code = harnessCodeOnly();
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(code), false);
  });

  it('não altera a tela real Empresas (sem import de src/modules) nem App.jsx', () => {
    const code = harnessSource();
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
    assert.equal(/App\.jsx/i.test(code), false);
  });

  it('não adiciona item no menu principal nem rota (sem router/menu)', () => {
    const code = harnessCodeOnly();
    assert.equal(/createBrowserRouter|<Route|useRoutes|registerRoute|addMenuItem|navItems|menu\.push|path:\s*['"]\//i.test(code), false);
  });

  it('sem biblioteca nova e sem CSS global (imports relativos, sem .css)', () => {
    const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), DEV_DIR);
    for (const f of HARNESS_FILES) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) {
        assert.equal(imp.startsWith('.'), true, `unexpected non-relative import "${imp}" in ${f}`);
      }
      assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(src), false);
    }
  });

  it('harness é exportável sem montagem automática (sem createRoot/render/ReactDOM)', () => {
    const code = harnessCodeOnly();
    assert.equal(/createRoot|ReactDOM|\.render\s*\(|document\.|window\./i.test(code), false);
    // exports a component, does not self-mount
    assert.equal(/export\s+(function|default)/.test(jsxSource()), true);
  });

  it('componentes harness não são exportados pelo runtime barrel (só helpers puros)', () => {
    const indexSrc = fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../index.js'),
      'utf8',
    );
    assert.equal(/from\s+['"][^'"]*EmpresasDevPreviewHarness\.jsx['"]/.test(indexSrc), false); // no export of the .jsx

    assert.equal(/createEmpresasDevPreviewFixture/.test(indexSrc), true);
    assert.equal(/isEmpresasDevPreviewHarnessEnabled/.test(indexSrc), true);
  });
});
