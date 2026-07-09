import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createControlledPreview, ControlledPreview, createPreviewModel } from '../../preview/controlledPreview.js';
import { ControlledPreviewError } from '../../preview/errors.js';
import { createEmpresasTableFormShadow } from '../../shadow/pilots/empresasTableFormShadow.js';
import { createObservabilityEngine } from '../../infra/observability/observabilityEngine.js';

const PREVIEW_SRC = '../../preview/controlledPreview.js';
const MODEL_SRC = '../../preview/previewModel.js';

/** Builds a real runtime v2 table/form projection (default Empresas descriptor). */
async function buildProjection(options) {
  const shadow = createEmpresasTableFormShadow({ enabled: true, ...options });
  return shadow.createRuntimeV2TableFormProjection();
}

/** Minimal M09-shaped permission engine that denies a given permission code. */
function denyingPermissionEngine(deniedCode) {
  return { can: async (_action, resource) => resource !== deniedCode };
}

describe('Empresas Controlled Preview Sandbox (post-Foundation C)', () => {
  it('cria o Controlled Preview', () => {
    const preview = createControlledPreview();
    assert.ok(preview instanceof ControlledPreview);
  });

  it('vem DESLIGADO por padrão (opt-in)', () => {
    const preview = createControlledPreview();
    assert.equal(preview.isEnabled(), false);
  });

  it('ligado gera preview model', async () => {
    const preview = createControlledPreview({ enabled: true });
    const report = await preview.run();
    assert.equal(report.skipped, false);
    assert.equal(report.ok, true);
    assert.equal(report.previewModel.isPreviewModel, true);
  });

  it('desligado retorna skipped (efeito zero)', async () => {
    const preview = createControlledPreview({ enabled: false });
    const report = await preview.run();
    assert.equal(report.skipped, true);
    assert.equal(preview.getDiagnostics().runCount, 0);
    assert.equal(preview.getDiagnostics().records.length, 0);
  });

  it('preview model contém tabela', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    assert.ok(model.table);
    assert.ok(Array.isArray(model.table.columns));
    assert.ok(model.table.headerLabels);
    assert.ok(model.table.cellMetadata);
  });

  it('preview model contém formulário', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    assert.ok(model.form);
    assert.ok(Array.isArray(model.form.fields));
    assert.ok(Array.isArray(model.form.sections));
  });

  it('columns são determinísticas', async () => {
    const projection = await buildProjection();
    const a = createPreviewModel(projection);
    const b = createPreviewModel(projection);
    assert.deepEqual(a.table, b.table);
    assert.deepEqual(a.table.columns.map((c) => c.id), ['codempresa', 'cpf_cnpj', 'inscricao_estadual', 'razao_social', 'status']);
  });

  it('fields são determinísticos', async () => {
    const projection = await buildProjection();
    const a = createPreviewModel(projection);
    const b = createPreviewModel(projection);
    assert.deepEqual(a.form.fields, b.form.fields);
  });

  it('labels são preservadas', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    assert.equal(model.table.headerLabels.razao_social, 'Razão Social');
    assert.equal(model.form.fields.find((f) => f.id === 'razao_social').label, 'Nome/Razão Social');
  });

  it('validações são preservadas', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    const razao = model.form.fields.find((f) => f.id === 'razao_social');
    assert.deepEqual(razao.validation.rules, ['required', 'uppercase']);
    assert.equal(razao.required, true);
  });

  it('permissões são preservadas', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    const fiscal = model.form.fields.find((f) => f.id === 'inscricao_estadual');
    assert.equal(fiscal.permission, 'empresas.view_fiscal');
  });

  it('actions aparecem apenas como metadados', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    assert.equal(Array.isArray(model.table.rowActions), true);
    assert.deepEqual(model.form.formActions[0], { id: 'empresa.save', kind: 'action', ref: 'empresa_save' });
    assert.equal(typeof model.form.formActions[0].execute, 'undefined');
  });

  it('workflows aparecem apenas como metadados', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    assert.deepEqual(model.form.formWorkflows[0], { id: 'empresa.approval', ref: 'empresa_approval' });
    assert.equal(typeof model.form.formWorkflows[0].start, 'undefined');
  });

  it('connectors não são executados (sem uso de connector no código)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PREVIEW_SRC), 'utf8') + fs.readFileSync(path.join(dir, MODEL_SRC), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/connectorEngine|\.execute\s*\(/.test(codeOnly), false);
  });

  it('preview model NÃO é React element', async () => {
    const projection = await buildProjection();
    const model = createPreviewModel(projection);
    assert.equal(model.$$typeof, undefined); // React elements carry a $$typeof symbol
    assert.equal(model.kind, 'preview-model');
    assert.doesNotThrow(() => JSON.stringify(model)); // fully serializable plain object
  });

  it('preview model NÃO usa DOM real', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PREVIEW_SRC), 'utf8') + fs.readFileSync(path.join(dir, MODEL_SRC), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/document\.|window\.|createElement|appendChild/i.test(codeOnly), false);
  });

  it('não altera src/App.jsx nem importa a UI de produção', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PREVIEW_SRC), 'utf8') + fs.readFileSync(path.join(dir, MODEL_SRC), 'utf8');
    assert.equal(/App\.jsx/i.test(source), false);
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(source), false);
  });

  it('não altera UI de produção (sem import de react/react-dom)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PREVIEW_SRC), 'utf8') + fs.readFileSync(path.join(dir, MODEL_SRC), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(/from\s+['"]react-dom['"]/i.test(source), false);
  });

  it('não chama backend direto (sem fetch/XHR/WebSocket/storage)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PREVIEW_SRC), 'utf8') + fs.readFileSync(path.join(dir, MODEL_SRC), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/from\s+['"].*backend.*['"]/i.test(codeOnly), false);
    assert.equal(/\bfetch\s*\(/.test(codeOnly), false);
    assert.equal(/XMLHttpRequest|WebSocket|BroadcastChannel/.test(codeOnly), false);
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, PREVIEW_SRC), 'utf8') + fs.readFileSync(path.join(dir, MODEL_SRC), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
  });

  it('dados sensíveis são mascarados', async () => {
    const projection = await buildProjection();
    projection.meta = { token: 'abc', region: 'br' };
    const model = createPreviewModel(projection);
    assert.equal(model.meta.token, '[REDACTED]');
    assert.equal(model.meta.region, 'br');
  });

  it('prototype pollution é bloqueado em input', async () => {
    const preview = createControlledPreview({ enabled: true });
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => preview.run(polluted),
      (err) => err instanceof ControlledPreviewError && err.code === 'MAK-L3-PREVIEW-001',
    );
  });

  it('diagnostics retorna cópia segura', async () => {
    const preview = createControlledPreview({ enabled: true });
    await preview.run();
    const diag = preview.getDiagnostics();
    assert.equal(diag.moduleId, 'empresas');
    assert.equal(diag.runCount, 1);
    assert.equal(diag.records.length, 1);
  });

  it('mutar diagnostics NÃO altera o estado interno', async () => {
    const preview = createControlledPreview({ enabled: true });
    await preview.run();
    const diag = preview.getDiagnostics();
    diag.records.push({ id: 'fake', ok: true, detail: {}, timestamp: 0 });
    diag.records[0].detail = { tampered: true };
    assert.equal(preview.getDiagnostics().records.length, 1);
    assert.notDeepEqual(preview.getDiagnostics().records[0].detail, { tampered: true });
  });

  it('falha da projeção é capturada, não propagada', async () => {
    // A throwing permission engine makes the underlying table/form shadow fail; the preview captures it.
    const preview = createControlledPreview({ enabled: true, permissionEngine: { can: async () => { throw new Error('perm down'); } } });
    const report = await preview.run();
    assert.equal(report.ok, false);
    assert.equal(report.error.message, 'perm down');
    assert.equal(preview.getDiagnostics().failureCount, 1);
  });

  it('preview model surfaces denied fields nos diagnostics quando M09 nega', async () => {
    const preview = createControlledPreview({ enabled: true, permissionEngine: denyingPermissionEngine('empresas.view_fiscal') });
    const report = await preview.run();
    assert.equal(report.ok, true);
    assert.equal(report.previewModel.diagnostics.deniedFields.includes('inscricao_estadual'), true);
  });

  it('integra com Observability (métrica de warnings)', async () => {
    const observability = createObservabilityEngine();
    const preview = createControlledPreview({ enabled: true, observability });
    await preview.run();
    const snap = observability.snapshot();
    assert.equal(snap.metrics.some((m) => m.name === 'preview.empresas.warnings'), true);
  });

  it('feature flag desligada tem efeito zero (nenhum preview model)', async () => {
    const preview = createControlledPreview({ enabled: false });
    const report = await preview.run({ meta: { token: 'x' } });
    assert.equal(report.skipped, true);
    assert.equal(report.previewModel, undefined);
    assert.equal(preview.getDiagnostics().records.length, 0);
  });
});
