import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateGenericModuleDescriptor, normalizeGenericModuleDescriptor } from '../../shadow/generic/genericModuleDescriptor.js';
import { GenericModuleShadowError } from '../../shadow/generic/errors.js';
import { createGenericModuleShadowPilot } from '../../shadow/generic/genericModuleShadowPilot.js';
import { createGenericModuleTableFormShadow } from '../../shadow/generic/genericModuleTableFormShadow.js';
import { createCadcpsShadowPilot, createCadcpsTableFormShadow } from '../../shadow/pilots/secondModuleShadowPilot.js';
import { createCadcpsDescriptor } from '../../shadow/pilots/createSecondModuleDescriptor.js';
import { createSecondModuleDevPreviewFixture } from '../../preview/dev/createSecondModuleDevPreviewFixture.js';
import { createEmpresasDevPreviewModel } from '../../preview/dev/devPreviewConfig.js';

const GENERIC_DIR = '../../shadow/generic';
const GENERIC_FILES = ['genericModuleDescriptor.js', 'genericModuleShadowPilot.js', 'genericModuleTableFormShadow.js', 'errors.js'];
const SECOND_FILES = [
  '../pilots/createSecondModuleDescriptor.js',
  '../pilots/secondModuleShadowPilot.js',
  '../../preview/dev/createSecondModuleDevPreviewFixture.js',
];

function newSource() {
  const base = path.dirname(fileURLToPath(import.meta.url));
  const g = GENERIC_FILES.map((f) => fs.readFileSync(path.join(base, GENERIC_DIR, f), 'utf8'));
  const s = SECOND_FILES.map((f) => fs.readFileSync(path.join(base, GENERIC_DIR, f), 'utf8'));
  return [...g, ...s].join('\n');
}
function newCodeOnly() {
  return newSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('Second Module Shadow / Generic Module Runtime (post-Foundation C)', () => {
  it('GenericModuleDescriptor valida um descriptor válido', () => {
    assert.equal(validateGenericModuleDescriptor(createCadcpsDescriptor()), true);
  });

  it('GenericModuleDescriptor rejeita um descriptor inválido', () => {
    assert.throws(() => validateGenericModuleDescriptor({}), (e) => e instanceof GenericModuleShadowError && e.code === 'MAK-L3-GENERIC-SHADOW-001');
    assert.throws(() => validateGenericModuleDescriptor({ moduleId: 'x' }), (e) => e instanceof GenericModuleShadowError);
    // descriptor with a function must be rejected (no behavior allowed)
    assert.throws(() => validateGenericModuleDescriptor({ moduleId: 'x', fields: [], run: () => {} }), (e) => e instanceof GenericModuleShadowError);
  });

  it('bloqueia prototype pollution no descriptor', () => {
    const polluted = JSON.parse('{"moduleId":"x","fields":[],"__proto__":{"polluted":true}}');
    assert.throws(() => validateGenericModuleDescriptor(polluted), (e) => e instanceof GenericModuleShadowError && e.code === 'MAK-L3-GENERIC-SHADOW-001');
  });

  it('mascara dados sensíveis no descriptor normalizado', () => {
    const d = normalizeGenericModuleDescriptor({ moduleId: 'x', fields: [], meta: { token: 'abc', region: 'br' } });
    assert.equal(d.meta.token, '[REDACTED]');
    assert.equal(d.meta.region, 'br');
  });

  it('GenericModuleShadowPilot default desligado', () => {
    const pilot = createGenericModuleShadowPilot({ descriptor: createCadcpsDescriptor(), enabled: false });
    assert.equal(pilot.isEnabled(), false);
  });

  it('GenericModuleShadowPilot ligado executa pass diagnóstico', async () => {
    const pilot = createCadcpsShadowPilot({ enabled: true });
    const report = await pilot.run();
    assert.equal(report.skipped, false);
    assert.equal(report.ok, true);
    assert.equal(report.moduleId, 'cadcps');
    assert.ok(report.comparison);
  });

  it('falha do shadow é capturada, não propagada', async () => {
    const brokenShadowMode = { compareWithLegacy: () => { throw new Error('shadow broke'); }, runShadowPass: async () => ({}) };
    const pilot = createCadcpsShadowPilot({ enabled: true, shadowMode: brokenShadowMode });
    const report = await pilot.run();
    assert.equal(report.ok, false);
    assert.equal(report.error.message, 'shadow broke');
    assert.equal(pilot.getDiagnostics().failureCount, 1);
  });

  it('GenericModuleTableFormShadow default desligado', () => {
    const shadow = createGenericModuleTableFormShadow({ descriptor: createCadcpsDescriptor(), enabled: false });
    assert.equal(shadow.isEnabled(), false);
  });

  it('GenericModuleTableFormShadow ligado gera projeção table/form', async () => {
    const shadow = createCadcpsTableFormShadow({ enabled: true });
    const report = await shadow.run();
    assert.equal(report.ok, true);
    assert.ok(report.runtimeProjection.table);
    assert.ok(report.runtimeProjection.form);
  });

  it('projeção de tabela contém columns determinísticas', async () => {
    const shadow = createCadcpsTableFormShadow({ enabled: true });
    const a = await shadow.createRuntimeV2TableFormProjection();
    const b = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(a.table, b.table);
    assert.deepEqual(a.table.columns.map((c) => c.id), ['ativo', 'codigo', 'nome', 'obrigatorio', 'telas', 'tipo']);
  });

  it('projeção de formulário contém fields determinísticos', async () => {
    const shadow = createCadcpsTableFormShadow({ enabled: true });
    const a = await shadow.createRuntimeV2TableFormProjection();
    const b = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(a.form, b.form);
    assert.equal(a.form.fields.find((f) => f.id === 'nome').type, 'string'); // text -> string canonicalization
  });

  it('permissões são preservadas/aplicadas como metadata', async () => {
    const gated = createCadcpsTableFormShadow({ enabled: true, permissionEngine: { can: async (_a, r) => r !== 'cadcps.manage' } });
    const proj = await gated.createRuntimeV2TableFormProjection();
    const ativo = proj.form.fields.find((f) => f.id === 'ativo');
    assert.equal(ativo.permission, 'cadcps.manage');
    assert.equal(ativo.denied, true);
    assert.equal(proj.form.visibleFields.includes('ativo'), false);
  });

  it('validações são preservadas como metadata', async () => {
    const shadow = createCadcpsTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(proj.form.fields.find((f) => f.id === 'nome').validation.rules, ['required', 'uppercase']);
  });

  it('actions aparecem apenas como metadados', async () => {
    const shadow = createCadcpsTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(proj.form.actions[0], { id: 'cps.save', kind: 'action', ref: 'cps_save' });
    assert.equal(typeof proj.form.actions[0].execute, 'undefined');
  });

  it('workflows aparecem apenas como metadados', async () => {
    const shadow = createCadcpsTableFormShadow({ enabled: true });
    const proj = await shadow.createRuntimeV2TableFormProjection();
    assert.deepEqual(proj.form.workflows[0], { id: 'cps.publish', ref: 'cps_publish' });
    assert.equal(typeof proj.form.workflows[0].start, 'undefined');
  });

  it('connectors não são executados (sem uso de connector/execute no código novo)', () => {
    assert.equal(/connectorEngine|\.execute\s*\(/.test(newCodeOnly()), false);
  });

  it('não executa salvar/editar/excluir nem action/workflow/connector (sem dispatch/save/start)', () => {
    assert.equal(/dispatch\s*\(|\.start\s*\(|\.save\s*\(|onClick|onSubmit/.test(newCodeOnly()), false);
  });

  it('não chama backend/fetch', () => {
    const code = newCodeOnly();
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(code), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = newSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(newCodeOnly()), false);
  });

  it('segundo módulo (cadcps) roda pela base genérica e produz preview model válido', async () => {
    const fixture = await createSecondModuleDevPreviewFixture();
    const view = createEmpresasDevPreviewModel(fixture);
    assert.equal(view.valid, true);
    assert.equal(fixture.moduleId, 'cadcps');
    assert.equal(view.diagnostics.deniedFields.includes('ativo'), true);
  });

  it('segundo módulo não altera UI real (sem import de src/modules)', () => {
    const code = newSource();
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
  });

  it('não altera src/App.jsx (sem referência nos arquivos novos)', () => {
    assert.equal(/App\.jsx/i.test(newSource()), false);
  });

  it('não altera menu principal / rota (sem router/menu nos arquivos novos)', () => {
    assert.equal(/createBrowserRouter|<Route|addMenuItem|navItems|menu\.push|registerRoute/i.test(newCodeOnly()), false);
  });

  it('a base genérica serve para mais de um módulo (Empresas + cadcps)', async () => {
    // Same generic engine, two different descriptors → two different module ids.
    const cadcps = createGenericModuleTableFormShadow({ descriptor: createCadcpsDescriptor(), enabled: true });
    const other = createGenericModuleTableFormShadow({ descriptor: { moduleId: 'setores', entityName: 'Setor', fields: [{ id: 'nome', type: 'text', required: true }], table: { columns: [{ id: 'nome', label: 'Nome' }] }, form: {} }, enabled: true });
    const a = await cadcps.run();
    const b = await other.run();
    assert.equal(a.moduleId, 'cadcps');
    assert.equal(b.moduleId, 'setores');
    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
  });
});
