import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createControlledDevDataset, ControlledDevDataset } from '../../preview/dev/data/createControlledDevDataset.js';
import { createControlledModuleDataset } from '../../preview/dev/data/controlledDevDataset.js';
import {
  isControlledDevDatasetEnabled,
  CONTROLLED_DEV_DATASET_FLAG,
  CONTROLLED_DEV_DATASET_ALLOW_PROD_FLAG,
  MAX_RECORDS_PER_MODULE,
} from '../../preview/dev/data/controlledDatasetConfig.js';
import { ControlledDevDatasetError } from '../../preview/dev/data/errors.js';
import { createRuntimeV2DevPreviewHubModel } from '../../preview/dev/hub/createRuntimeV2DevPreviewHubModel.js';

const DATA_DIR = '../../preview/dev/data';
const DATA_FILES = ['controlledDevDataset.js', 'createControlledDevDataset.js', 'createEmpresasControlledDataset.js', 'createCadcpsControlledDataset.js', 'controlledDatasetConfig.js', 'errors.js'];
function dataSource() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), DATA_DIR);
  return DATA_FILES.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
}
function dataCodeOnly() {
  return dataSource().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const enabled = () => createControlledDevDataset({ enabled: true });

describe('Runtime v2 Controlled Dev Dataset (post-Foundation C)', () => {
  it('dataset default desligado', () => {
    assert.equal(isControlledDevDatasetEnabled({}), false);
    const ds = createControlledDevDataset({});
    assert.equal(ds.isEnabled(), false);
    assert.deepEqual(ds.getModules(), []);
    assert.deepEqual(ds.getRecords('empresas'), []);
  });

  it('dataset habilita somente com a flag (em dev)', () => {
    assert.equal(isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'true' }), true);
    assert.equal(isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'false' }), false);
  });

  it('produção falha fechada (salvo override explícito)', () => {
    assert.equal(isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'true', PROD: true }), false);
    assert.equal(isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'true', NODE_ENV: 'production' }), false);
    assert.equal(isControlledDevDatasetEnabled({ [CONTROLLED_DEV_DATASET_FLAG]: 'true', PROD: true, [CONTROLLED_DEV_DATASET_ALLOW_PROD_FLAG]: 'true' }), true);
  });

  it('createControlledDevDataset cria model determinístico', () => {
    const a = enabled();
    const b = enabled();
    assert.deepEqual(a.getRecords('empresas'), b.getRecords('empresas'));
    assert.deepEqual(a.getDiagnostics(), b.getDiagnostics());
    assert.ok(a instanceof ControlledDevDataset);
  });

  it('lista módulos empresas e cadcps', () => {
    assert.deepEqual(enabled().getModules().sort(), ['cadcps', 'empresas']);
  });

  it('Empresas retorna registros simulados', () => {
    const recs = enabled().getRecords('empresas');
    assert.equal(recs.length, 3);
    assert.equal(recs[0].values.razao_social, 'FAZENDA MODELO ALFA');
  });

  it('cadcps retorna registros simulados', () => {
    const recs = enabled().getRecords('cadcps');
    assert.equal(recs.length, 3);
    assert.equal(recs[0].values.nome, 'CAMPO EXEMPLO');
  });

  it('não contém dados reais (marcado como mock)', () => {
    const diag = enabled().getDiagnostics();
    assert.equal(diag.enabled, true);
    const recs = enabled().getRecords('empresas');
    // clearly fictitious example names
    assert.ok(recs.every((r) => typeof r.id === 'string' && r.id.startsWith('emp-')));
  });

  it('dados sensíveis são mascarados', () => {
    const rec = enabled().getRecordById('empresas', 'emp-1');
    assert.equal(rec.values.apiKey, '[REDACTED]');
  });

  it('prototype pollution é bloqueado', () => {
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    assert.throws(
      () => createControlledDevDataset(polluted),
      (err) => err instanceof ControlledDevDatasetError && err.code === 'MAK-L3-DEV-DATASET-001',
    );
  });

  it('getRecords retorna cópia segura', () => {
    const ds = enabled();
    const a = ds.getRecords('empresas');
    a.push({ id: 'fake' });
    a[0].values.razao_social = 'TAMPERED';
    const b = ds.getRecords('empresas');
    assert.equal(b.length, 3);
    assert.equal(b[0].values.razao_social, 'FAZENDA MODELO ALFA');
  });

  it('mutar retorno não altera estado interno (diagnostics)', () => {
    const ds = enabled();
    const d = ds.getDiagnostics();
    d.warnings.push('tampered');
    assert.notEqual(ds.getDiagnostics().warnings.length, d.warnings.length);
  });

  it('getRecordById funciona', () => {
    assert.equal(enabled().getRecordById('empresas', 'emp-3').id, 'emp-3');
    assert.equal(enabled().getRecordById('empresas', 'nope'), null);
  });

  it('getTableRows funciona', () => {
    const rows = enabled().getTableRows('empresas');
    assert.equal(rows.length, 3);
    assert.ok('razao_social' in rows[0].cells);
  });

  it('getFormValues funciona', () => {
    const values = enabled().getFormValues('cadcps', 'cps-1');
    assert.equal(values.nome, 'CAMPO EXEMPLO');
    assert.equal(enabled().getFormValues('cadcps', 'nope'), null);
  });

  it('registros válidos são marcados', () => {
    const rec = enabled().getRecordById('empresas', 'emp-1');
    assert.equal(rec.valid, true);
    assert.deepEqual(rec.missingRequired, []);
  });

  it('registros inválidos são marcados (campo obrigatório vazio)', () => {
    const rec = enabled().getRecordById('empresas', 'emp-2');
    assert.equal(rec.valid, false);
    assert.deepEqual(rec.missingRequired, ['razao_social']);
    const cps = enabled().getRecordById('cadcps', 'cps-2');
    assert.equal(cps.valid, false);
    assert.deepEqual(cps.missingRequired, ['nome', 'tipo']);
  });

  it('campos negados são marcados e ocultados', () => {
    const rec = enabled().getRecordById('empresas', 'emp-3');
    assert.deepEqual(rec.deniedFields, ['inscricao_estadual']);
    assert.equal(rec.values.inscricao_estadual, '[DENIED]');
  });

  it('campos obrigatórios vazios aparecem em diagnostics', () => {
    const diag = enabled().getDiagnostics();
    assert.ok(diag.warnings.some((w) => /emp-2.*missing required.*razao_social/.test(w)));
  });

  it('limite de registros por módulo é respeitado', () => {
    const tooMany = Array.from({ length: MAX_RECORDS_PER_MODULE + 1 }, (_, i) => ({ id: `r-${i}`, values: { nome: `N${i}` } }));
    assert.throws(
      () => createControlledModuleDataset({ moduleId: 'x', columns: ['nome'], requiredFields: [], records: tooMany }),
      (err) => err instanceof ControlledDevDatasetError && err.code === 'MAK-L3-DEV-DATASET-002',
    );
  });

  it('limite de profundidade é respeitado', () => {
    let deep = { leaf: true };
    for (let i = 0; i < 12; i += 1) deep = { nested: deep };
    assert.throws(
      () => createControlledModuleDataset({ moduleId: 'x', columns: [], requiredFields: [], records: [{ id: 'r1', values: { deep } }] }),
      (err) => err instanceof ControlledDevDatasetError && err.code === 'MAK-L3-DEV-DATASET-001',
    );
  });

  it('não chama backend/fetch', () => {
    const code = dataCodeOnly();
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|from\s+['"].*backend.*['"]/i.test(code), false);
  });

  it('não consulta Prisma/MMM direto (D-RI-13)', () => {
    const code = dataSource();
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(code), false);
    assert.equal(/PrismaClient/.test(code), false);
  });

  it('não usa localStorage/sessionStorage/IndexedDB', () => {
    assert.equal(/localStorage|sessionStorage|indexedDB/i.test(dataCodeOnly()), false);
  });

  it('não executa action/workflow/connector (sem dispatch/start/execute/connector)', () => {
    assert.equal(/connectorEngine|dispatch\s*\(|\.start\s*\(|\.execute\s*\(/.test(dataCodeOnly()), false);
  });

  it('integração com hub é opt-in — hub continua funcionando com dataset desligado', async () => {
    const hub = await createRuntimeV2DevPreviewHubModel({ env: {} });
    assert.equal(hub.flags.datasetIntegrated, false);
    for (const m of hub.modules) assert.equal(m.dataset, undefined);
    // disabled dataset instance passed → still no integration
    const hub2 = await createRuntimeV2DevPreviewHubModel({ env: {}, dataset: createControlledDevDataset({ enabled: false }) });
    assert.equal(hub2.flags.datasetIntegrated, false);
  });

  it('hub inclui dataset summary com dataset ligado', async () => {
    const hub = await createRuntimeV2DevPreviewHubModel({ env: {}, dataset: enabled() });
    assert.equal(hub.flags.datasetIntegrated, true);
    const empresas = hub.modules.find((m) => m.moduleId === 'empresas');
    assert.ok(empresas.dataset);
    assert.equal(empresas.dataset.recordCount, 3);
    assert.equal(empresas.dataset.validCount, 2);
    assert.equal(empresas.dataset.invalidCount, 1);
    assert.equal(empresas.dataset.deniedFieldCount, 1);
    assert.ok(empresas.dataset.sampleRowPreview);
  });

  it('não altera telas reais (sem import de src/modules) nem App.jsx', () => {
    const code = dataSource();
    assert.equal(/from\s+['"].*\/modules\/.*['"]/i.test(code), false);
    assert.equal(/App\.jsx/i.test(code), false);
  });

  it('não adiciona menu/rota (sem router/menu no código)', () => {
    assert.equal(/createBrowserRouter|<Route|addMenuItem|navItems|menu\.push|registerRoute/i.test(dataCodeOnly()), false);
  });

  it('sem biblioteca nova (imports relativos) e sem CSS global', () => {
    const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), DATA_DIR);
    for (const f of DATA_FILES) {
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((mm) => mm[1]);
      for (const imp of imports) assert.equal(imp.startsWith('.'), true, `unexpected non-relative import "${imp}" in ${f}`);
      assert.equal(/import\s+['"][^'"]+\.css['"]/i.test(src), false);
    }
  });

  it('dataset é objeto plano — records serializáveis, sem React element', () => {
    const recs = enabled().getRecords('empresas');
    assert.doesNotThrow(() => JSON.stringify(recs));
    assert.equal(recs[0].$$typeof, undefined);
  });

  it('exports públicos no runtime barrel (helpers puros)', () => {
    const indexSrc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../index.js'), 'utf8');
    assert.equal(/createControlledDevDataset/.test(indexSrc), true);
    assert.equal(/isControlledDevDatasetEnabled/.test(indexSrc), true);
  });
});
