import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmpresasTableFormShadow, EmpresasTableFormShadow } from '../../shadow/pilots/empresasTableFormShadow.js';
import { EmpresasShadowPilotError } from '../../shadow/pilots/errors.js';
import { createObservabilityEngine } from '../../infra/observability/observabilityEngine.js';

const SRC = '../../shadow/pilots/empresasTableFormShadow.js';
const PROJ_SRC = '../../shadow/pilots/tableFormProjection.js';

/** Minimal M09-shaped permission engine that denies a given permission code. */
function denyingPermissionEngine(deniedCode) {
  return { can: async (_action, resource) => resource !== deniedCode };
}

describe('Empresas Table/Form Shadow Projection (post-Foundation C)', () => {
  it('cria a projeção table/form', () => {
    const shadow = createEmpresasTableFormShadow();
    assert.ok(shadow instanceof EmpresasTableFormShadow);
  });

  it('vem DESLIGADO por padrão (opt-in)', () => {
    const shadow = createEmpresasTableFormShadow();
    assert.equal(shadow.isEnabled(), false);
  });

  it('ligado gera projeção table/form', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const report = await shadow.run();
    assert.equal(report.skipped, false);
    assert.equal(report.ok, true);
    assert.ok(report.runtimeProjection.table);
    assert.ok(report.runtimeProjection.form);
  });

  it('desligado retorna skipped (efeito zero)', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: false });
    const report = await shadow.run();
    assert.equal(report.skipped, true);
    assert.equal(shadow.getDiagnostics().runCount, 0);
    assert.equal(shadow.getDiagnostics().records.length, 0);
  });

  it('projeção de tabela contém columns determinísticas', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const a = await shadow.createRuntimeV2TableFormProjection();
    const b = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(a.table, b.table);
    assert.deepEqual(a.table.columns.map((c) => c.id), ['codempresa', 'cpf_cnpj', 'inscricao_estadual', 'razao_social', 'status']);
    assert.deepEqual(a.table.visibleColumns, ['codempresa', 'cpf_cnpj', 'razao_social', 'status']);
  });

  it('projeção de formulário contém fields determinísticos', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const a = await shadow.createRuntimeV2TableFormProjection();
    const b = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(a.form, b.form);
    assert.deepEqual([...a.form.fields.map((f) => f.id)].sort(), a.form.fields.map((f) => f.id));
    // v2 canonicalizes types
    assert.equal(a.form.fields.find((f) => f.id === 'telefone').type, 'phone');
    assert.equal(a.form.fields.find((f) => f.id === 'cpf_cnpj').type, 'document');
  });

  it('metadados de validação são preservados', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    const razao = proj.form.fields.find((f) => f.id === 'razao_social');
    assert.deepEqual(razao.validation.rules, ['required', 'uppercase']);
    assert.equal(razao.required, true);
  });

  it('metadados de permissão são preservados e aplicados (M09)', async () => {
    // Without a permission engine: permission metadata preserved, field permitted.
    const passive = createEmpresasTableFormShadow({ enabled: true });
    const p1 = await passive.createRuntimeV2TableFormProjection();
    const fiscal1 = p1.form.fields.find((f) => f.id === 'inscricao_estadual');
    assert.equal(fiscal1.permission, 'empresas.view_fiscal');
    assert.equal(fiscal1.permitted, true);

    // With a denying permission engine: field marked denied and filtered out of visibleFields.
    const gated = createEmpresasTableFormShadow({ enabled: true, permissionEngine: denyingPermissionEngine('empresas.view_fiscal') });
    const p2 = await gated.createRuntimeV2TableFormProjection();
    const fiscal2 = p2.form.fields.find((f) => f.id === 'inscricao_estadual');
    assert.equal(fiscal2.denied, true);
    assert.equal(p2.form.visibleFields.includes('inscricao_estadual'), false);
    assert.equal(p2.form.permissionsApplied, true);
  });

  it('actions aparecem apenas como metadados, sem execução', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.equal(Array.isArray(proj.table.actions), true);
    assert.deepEqual(proj.form.actions[0], { id: 'empresa.save', kind: 'action', ref: 'empresa_save' });
    // metadata only — no dispatch/execute function present on the action entries
    assert.equal(typeof proj.form.actions[0].execute, 'undefined');
  });

  it('workflows aparecem apenas como metadados, sem execução', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(proj.form.workflows[0], { id: 'empresa.approval', ref: 'empresa_approval' });
    assert.equal(typeof proj.form.workflows[0].start, 'undefined');
  });

  it('connectors não são executados (sem uso de connector no código)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, SRC), 'utf8')
      + fs.readFileSync(path.join(dir, PROJ_SRC), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/connectorEngine|\.execute\s*\(/.test(codeOnly), false);
  });

  it('render tree é intermediária, sem DOM/React real', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.equal(proj.renderTree.intermediate, true);
    assert.equal(proj.renderTree.type, 'view');
    // plain serializable object — no DOM node / React element
    assert.doesNotThrow(() => JSON.stringify(proj.renderTree));
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const src = fs.readFileSync(path.join(dir, SRC), 'utf8') + fs.readFileSync(path.join(dir, PROJ_SRC), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(src), false);
    assert.equal(/document\.|window\.|createElement/i.test(src), false);
  });

  it('comparação legado vs runtime v2 retorna differences controladas', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const report = await shadow.run();
    assert.equal(report.equivalent, false);
    assert.equal(report.comparison.differences.some((d) => d.path === 'form'), true);
    assert.deepEqual(report.comparison.onlyInLegacy, []);
    assert.deepEqual(report.comparison.onlyInV2, []);
  });

  it('getDiagnostics retorna cópia segura', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    await shadow.run();
    const diag = shadow.getDiagnostics();
    assert.equal(diag.moduleId, 'empresas');
    assert.equal(diag.runCount, 1);
    assert.equal(diag.records.length, 1);
  });

  it('mutar diagnostics NÃO altera o estado interno', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    await shadow.run();
    const diag = shadow.getDiagnostics();
    diag.records.push({ id: 'fake', ok: true, detail: {}, timestamp: 0 });
    diag.records[0].detail = { tampered: true };
    assert.equal(shadow.getDiagnostics().records.length, 1);
    assert.notDeepEqual(shadow.getDiagnostics().records[0].detail, { tampered: true });
  });

  it('dados sensíveis são mascarados', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true, descriptor: { meta: { token: 'abc', region: 'br' } } });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.equal(proj.meta.token, '[REDACTED]');
    assert.equal(proj.meta.region, 'br');
  });

  it('prototype pollution é bloqueado em input', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: true });
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => shadow.run(polluted),
      (err) => err instanceof EmpresasShadowPilotError && err.code === 'MAK-L3-SHADOW-PILOT-001',
    );
  });

  it('falha de Permission/Validation/Render é capturada, não propagada', async () => {
    const throwingPermission = { can: async () => { throw new Error('perm engine down'); } };
    const shadow = createEmpresasTableFormShadow({ enabled: true, permissionEngine: throwingPermission });
    const report = await shadow.run();
    assert.equal(report.ok, false);
    assert.equal(report.error.message, 'perm engine down');
    assert.equal(shadow.getDiagnostics().failureCount, 1);
  });

  it('não altera src/App.jsx nem importa a UI de produção do módulo', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, SRC), 'utf8') + fs.readFileSync(path.join(dir, PROJ_SRC), 'utf8');
    assert.equal(/App\.jsx/i.test(source), false);
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(source), false);
  });

  it('não altera UI de produção (sem import de react/react-dom)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, SRC), 'utf8') + fs.readFileSync(path.join(dir, PROJ_SRC), 'utf8');
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(/from\s+['"]react-dom['"]/i.test(source), false);
  });

  it('não chama backend direto (sem fetch/XHR/WebSocket/storage)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, SRC), 'utf8') + fs.readFileSync(path.join(dir, PROJ_SRC), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/from\s+['"].*backend.*['"]/i.test(codeOnly), false);
    assert.equal(/\bfetch\s*\(/.test(codeOnly), false);
    assert.equal(/XMLHttpRequest|WebSocket|BroadcastChannel/.test(codeOnly), false);
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(codeOnly), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, SRC), 'utf8') + fs.readFileSync(path.join(dir, PROJ_SRC), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
  });

  it('integra com RuntimeShadowMode (comparação estrutural) e Observability', async () => {
    const observability = createObservabilityEngine();
    const shadow = createEmpresasTableFormShadow({ enabled: true, observability });
    const report = await shadow.run();
    assert.ok(report.comparison);
    assert.equal(Array.isArray(report.comparison.differences), true);
    assert.equal(typeof report.comparison.equivalent, 'boolean');
    const snap = observability.snapshot();
    assert.equal(snap.metrics.some((m) => m.name === 'shadow.empresas_table_form.differences'), true);
  });

  it('feature flag desligada tem efeito zero (nenhuma projeção construída)', async () => {
    const shadow = createEmpresasTableFormShadow({ enabled: false });
    const report = await shadow.run({ descriptor: { meta: { token: 'x' } } });
    assert.equal(report.skipped, true);
    assert.equal(report.comparison, undefined);
    assert.equal(shadow.getDiagnostics().records.length, 0);
  });
});
