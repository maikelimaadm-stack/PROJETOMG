import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createEmpresasDevPreviewModel,
  isEmpresasDevPreviewEnabled,
  EMPRESAS_DEV_PREVIEW_FLAG,
  EMPRESAS_DEV_PREVIEW_ALLOW_PROD_FLAG,
} from '../../preview/dev/devPreviewConfig.js';
import { EmpresasDevPreviewError } from '../../preview/dev/errors.js';
import { createEmpresasTableFormShadow } from '../../shadow/pilots/empresasTableFormShadow.js';
import { createPreviewModel } from '../../preview/previewModel.js';

const DEV_DIR = '../../preview/dev';
const DEV_FILES = ['devPreviewConfig.js', 'EmpresasDevPreview.jsx', 'PreviewTable.jsx', 'PreviewForm.jsx', 'PreviewDiagnostics.jsx'];

/** Reads the concatenated source of every dev-preview file. */
function devSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), DEV_DIR);
  return DEV_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}
function devCodeOnly() {
  return devSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

let previewModel;

describe('Empresas Dev-Only Visual Preview (post-Foundation C)', () => {
  before(async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const projection = await shadow.createRuntimeV2TableFormProjection();
    previewModel = createPreviewModel(projection);
  });

  it('config default desligada', () => {
    assert.equal(isEmpresasDevPreviewEnabled({}), false);
  });

  it('dev preview habilita somente com a flag (em dev)', () => {
    assert.equal(isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'true' }), true);
    assert.equal(isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'false' }), false);
  });

  it('produção falha fechada (salvo override explícito)', () => {
    assert.equal(isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'true', PROD: true }), false);
    assert.equal(isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'true', NODE_ENV: 'production' }), false);
    assert.equal(isEmpresasDevPreviewEnabled({ [EMPRESAS_DEV_PREVIEW_FLAG]: 'true', PROD: true, [EMPRESAS_DEV_PREVIEW_ALLOW_PROD_FLAG]: 'true' }), true);
  });

  it('preview visual recebe preview model e gera view model', () => {
    const view = createEmpresasDevPreviewModel(previewModel, { env: { [EMPRESAS_DEV_PREVIEW_FLAG]: 'true' } });
    assert.equal(view.valid, true);
    assert.equal(view.header, 'Empresas — Runtime v2 Preview');
    assert.equal(view.status.devOnly, true);
  });

  it('renderiza estrutura de tabela (columns)', () => {
    const view = createEmpresasDevPreviewModel(previewModel);
    assert.ok(Array.isArray(view.table.columns));
    assert.deepEqual(view.table.columns.map((c) => c.id), ['codempresa', 'cpf_cnpj', 'inscricao_estadual', 'razao_social', 'status']);
    assert.equal(view.table.rows[0].kind, 'header');
  });

  it('renderiza estrutura de formulário (fields)', () => {
    const view = createEmpresasDevPreviewModel(previewModel);
    assert.ok(Array.isArray(view.form.fields));
    assert.ok(view.form.fields.find((f) => f.id === 'razao_social'));
  });

  it('renderiza diagnostics', () => {
    const view = createEmpresasDevPreviewModel(previewModel);
    assert.ok(view.diagnostics);
    assert.ok(Array.isArray(view.diagnostics.warnings));
    assert.ok(Array.isArray(view.diagnostics.deniedFields));
  });

  it('actions aparecem apenas como texto/metadados', () => {
    const view = createEmpresasDevPreviewModel(previewModel);
    assert.ok(Array.isArray(view.actions));
    for (const a of view.actions) {
      assert.equal(typeof a.label, 'string');
      assert.equal(typeof a.execute, 'undefined'); // no executable handle
    }
  });

  it('workflows aparecem apenas como texto/metadados', () => {
    const view = createEmpresasDevPreviewModel(previewModel);
    assert.ok(Array.isArray(view.workflows));
    for (const w of view.workflows) {
      assert.equal(typeof w.label, 'string');
      assert.equal(typeof w.start, 'undefined');
    }
  });

  it('connectors aparecem apenas como metadados (sem execução no código)', () => {
    const code = devCodeOnly();
    assert.equal(/connectorEngine|\.execute\s*\(/.test(code), false);
  });

  it('não executa action/workflow/connector (sem onClick/dispatch/start/execute)', () => {
    const code = devCodeOnly();
    assert.equal(/onClick|onSubmit|dispatch\s*\(|\.start\s*\(|\.execute\s*\(/.test(code), false);
  });

  it('não chama backend/fetch', () => {
    const code = devCodeOnly();
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(code), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = devSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('não altera src/App.jsx (sem referência)', () => {
    const code = devSource();
    assert.equal(/App\.jsx/i.test(code), false);
  });

  it('não altera a tela real Empresas (sem import de src/modules)', () => {
    const code = devSource();
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
  });

  it('não adiciona item em menu principal / rota (sem router/menu/nav)', () => {
    const code = devCodeOnly();
    assert.equal(/createBrowserRouter|<Route|useRoutes|addMenuItem|navItems|registerRoute|menu\.push/i.test(code), false);
  });

  it('dados sensíveis são mascarados', () => {
    const model = { ...previewModel, meta: { token: 'abc', region: 'br' } };
    const view = createEmpresasDevPreviewModel(model);
    assert.equal(view.metadata.token, '[REDACTED]');
    assert.equal(view.metadata.region, 'br');
  });

  it('prototype pollution é bloqueado no preview model', () => {
    const polluted = JSON.parse('{"table": {}, "form": {}, "__proto__": {"polluted": true}}');
    assert.throws(
      () => createEmpresasDevPreviewModel(polluted),
      (err) => err instanceof EmpresasDevPreviewError && err.code === 'MAK-L3-DEV-PREVIEW-001',
    );
  });

  it('preview model inválido gera fallback seguro (não lança)', () => {
    const view = createEmpresasDevPreviewModel({ not: 'a preview model' });
    assert.equal(view.valid, false);
    assert.deepEqual(view.table.columns, []);
    assert.deepEqual(view.form.fields, []);
    assert.ok(view.diagnostics.warnings.length > 0);
  });

  it('não escreve em localStorage/sessionStorage/IndexedDB', () => {
    const code = devCodeOnly();
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(code), false);
  });

  it('sem biblioteca nova (apenas imports relativos nos arquivos dev)', () => {
    const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), DEV_DIR);
    for (const f of DEV_FILES) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const imp of imports) {
        assert.equal(imp.startsWith('.'), true, `unexpected non-relative import "${imp}" in ${f}`);
      }
    }
  });

  it('sem CSS global novo (nenhum import de .css nos arquivos dev)', () => {
    const code = devSource();
    assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(code), false);
  });

  it('estrutura é determinística (mesmo preview model → mesmo view model)', () => {
    const a = createEmpresasDevPreviewModel(previewModel, { env: {} });
    const b = createEmpresasDevPreviewModel(previewModel, { env: {} });
    assert.deepEqual(a, b);
  });

  it('componentes dev não são exportados pelo runtime barrel (sem React no core)', () => {
    const indexSrc = fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../../index.js'),
      'utf8',
    );
    assert.equal(/EmpresasDevPreview\.jsx|PreviewTable\.jsx|PreviewForm\.jsx|PreviewDiagnostics\.jsx/.test(indexSrc), false);
    assert.equal(/createEmpresasDevPreviewModel/.test(indexSrc), true); // only the pure helper is exported
  });
});
