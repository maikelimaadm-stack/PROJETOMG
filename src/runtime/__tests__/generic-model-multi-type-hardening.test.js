import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createGenericModelTypeRegistry,
  validateGenericModelTypeDefinition,
  GENERIC_MODEL_TYPE_DEFINITIONS,
  createGenericModelCapabilityMatrix,
  getGenericModelCapabilities,
  validateGenericModelCapabilities,
  validateGenericModelAdapterConformance,
  createGenericModelAdapterConformanceReport,
  createGenericModelMultiTypeConformanceSuite,
  createGenericModelMultiTypeDiagnostics,
} from '../../runtime/generic-model/index.js';
// Adapters are IMPORTED ONLY IN THIS CONFORMANCE TEST (the generic runtime never imports them).
import { createModeloBase1GenericModelAdapter } from '../../ModeloBase1/generic-model-adapter/createModeloBase1GenericModelAdapter.js';
import { createModeloBase2PrototypeAdapter } from '../../ModeloBase2/prototype-adapter/createModeloBase2PrototypeAdapter.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GM_DIR = path.join(HERE, '../../runtime/generic-model');
const SUBDIRS = ['model-types', 'capabilities', 'conformance', 'diagnostics'];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return walk(full);
  return e.isFile() && e.name.endsWith('.js') ? [full] : [];
});
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
// The multi-type sources (the new layers only).
const multiTypeFiles = () => SUBDIRS.flatMap((d) => walk(path.join(GM_DIR, d)));
const multiTypeSource = () => multiTypeFiles().map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const multiTypeImports = () => [...codeOnly(multiTypeSource()).matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const REACT_EL = { $$typeof: Symbol.for('react.element') };

const mb1 = () => createModeloBase1GenericModelAdapter({ moduleId: 'empresas' });
const mb2 = () => createModeloBase2PrototypeAdapter({ moduleId: 'combustivel-lancamento' });
const suiteOf = (adapters) => createGenericModelMultiTypeConformanceSuite({ adapters });

describe('Generic Model Multi-Type Hardening (post-Foundation C)', () => {
  // 1 / 2 / 3 / 4
  it('registry cria cadastro/operacional + tipos futuros; dangerous false por padrão', () => {
    const reg = createGenericModelTypeRegistry();
    assert.ok(reg.has('cadastro'));
    assert.ok(reg.has('operacional'));
    for (const t of ['movimentacao', 'financeiro', 'relatorio', 'dashboard', 'workflow', 'custom']) assert.ok(reg.has(t), `has ${t}`);
    assert.equal(reg.dangerousCapabilitiesDefaultFalse, true);
    assert.equal(reg.get('cadastro').family, 'modeloBase1');
    assert.equal(reg.get('operacional').family, 'modeloBase2');
  });

  // 5 / 6
  it('type definition cadastro/operacional validam', () => {
    assert.equal(validateGenericModelTypeDefinition({ definition: GENERIC_MODEL_TYPE_DEFINITIONS.cadastro }).valid, true);
    assert.equal(validateGenericModelTypeDefinition({ definition: GENERIC_MODEL_TYPE_DEFINITIONS.operacional }).valid, true);
  });

  // 7 / 8 / 9
  it('type definition com function/pollution/backend target falha', () => {
    const base = GENERIC_MODEL_TYPE_DEFINITIONS.cadastro;
    assert.equal(validateGenericModelTypeDefinition({ definition: { ...base, fn: () => {} } }).valid, false);
    assert.equal(validateGenericModelTypeDefinition({ definition: JSON.parse('{"modelType":"custom","requiredContracts":["runtimeContract"],"dangerousCapabilities":[],"defaultSafety":{"localOnly":true},"persistencePolicy":"none","sideEffectPolicy":"none","expectedReadShape":{},"expectedWriteShape":{},"__proto__":{"x":1}}') }).valid, false);
    assert.equal(validateGenericModelTypeDefinition({ definition: { ...base, backendUrl: '/api/write' } }).valid, false);
  });

  // 10 / 11 / 12
  it('capability matrix: defaults cadastro/operacional; relatorio/dashboard read-only', () => {
    const m = createGenericModelCapabilityMatrix();
    assert.equal(m.matrix.cadastro.read, true);
    assert.equal(m.matrix.cadastro.localWrite, true);
    assert.equal(m.matrix.cadastro.eventAppend, false);
    assert.equal(m.matrix.operacional.eventAppend, true);
    assert.equal(m.matrix.relatorio.localWrite, false);
    assert.equal(m.matrix.dashboard.localWrite, false);
    assert.equal(getGenericModelCapabilities(m, 'operacional').eventAppend, true);
  });

  // 13 / 14 / 15 / 16
  it('capability validation bloqueia backendWrite/connector/marketplacePublish/persistenceReal sem allow', () => {
    assert.equal(validateGenericModelCapabilities({ capabilities: { backendWrite: true } }).valid, false);
    assert.equal(validateGenericModelCapabilities({ capabilities: { connector: true } }).valid, false);
    assert.equal(validateGenericModelCapabilities({ capabilities: { marketplacePublish: true } }).valid, false);
    assert.equal(validateGenericModelCapabilities({ capabilities: { read: true }, persistenceReal: true }).valid, false);
    // explicit allow lifts the dangerous block (but never persistenceReal)
    assert.equal(validateGenericModelCapabilities({ capabilities: { backendWrite: true }, explicitAllowDangerous: true }).valid, true);
  });

  // 17 / 18
  it('MB1 passa conformance cadastro; MB2 passa conformance operacional', () => {
    const r1 = validateGenericModelAdapterConformance({ adapter: mb1(), expectedModelType: 'cadastro', expectedModelFamily: 'modeloBase1' });
    const r2 = validateGenericModelAdapterConformance({ adapter: mb2(), expectedModelType: 'operacional', expectedModelFamily: 'modeloBase2' });
    assert.equal(r1.valid, true);
    assert.equal(r1.safeToConsume, true);
    assert.equal(r2.valid, true);
    assert.equal(r2.safeToConsume, true);
  });

  // 19 / 20 / 21 / 22
  it('MB1 exige table/form (cadastro); MB2 exige entries/timeline/event; eventAppend por tipo', () => {
    const reg = createGenericModelTypeRegistry();
    assert.deepEqual(reg.get('cadastro').expectedReadShape.requires, ['table', 'form']);
    assert.deepEqual(reg.get('operacional').expectedReadShape.requires, ['entries', 'timeline']);
    const m = createGenericModelCapabilityMatrix();
    assert.equal(m.matrix.cadastro.eventAppend, false); // aceito
    assert.equal(m.matrix.operacional.eventAppend, true); // aceito
    // MB1 supports has no eventAppend → conformance does not require eventContract
    assert.equal(validateGenericModelAdapterConformance({ adapter: mb1(), expectedModelType: 'cadastro' }).valid, true);
  });

  // 23 / 24 / 25
  it('multi-type suite valida MB1 + MB2 juntos; diferenças permitidas; invariantes comuns', () => {
    const s = suiteOf([
      { adapter: mb1(), expectedModelType: 'cadastro', expectedModelFamily: 'modeloBase1' },
      { adapter: mb2(), expectedModelType: 'operacional', expectedModelFamily: 'modeloBase2' },
    ]);
    assert.equal(s.ok, true);
    assert.deepEqual(s.modelTypes, ['cadastro', 'operacional']);
    assert.equal(s.allowedDifferences.cadastro.eventAppend, false);
    assert.equal(s.allowedDifferences.operacional.eventAppend, true);
    assert.equal(s.allowedDifferences.operacional.sent, false);
    assert.equal(s.sharedInvariants.dangerousCapabilitiesFalse, true);
    assert.equal(s.sharedInvariants.persistenceRealFalse, true);
    assert.equal(s.sharedInvariants.fallbackAvailable, true);
    assert.equal(s.sharedInvariants.diagnosticsAvailable, true);
  });

  // 26 / 27 / 28 / 29 / 30 / 31
  it('reports mantêm backend/prisma/runtimeBridge Touched false; dangerous false; persistenceReal false; sent false operacional', () => {
    const s = suiteOf([
      { adapter: mb1(), expectedModelType: 'cadastro' },
      { adapter: mb2(), expectedModelType: 'operacional' },
    ]);
    for (const r of s.reports) {
      assert.equal(r.invariants.backendTouched, false);
      assert.equal(r.invariants.prismaTouched, false);
      assert.equal(r.invariants.runtimeBridgeTouched, false);
      assert.equal(r.invariants.persistenceReal, false);
    }
    assert.equal(mb2().sent, false);
    assert.equal(mb2().capabilities.backendWrite, false);
  });

  // 32
  it('multi-type diagnostics retorna readiness ready', () => {
    const reg = createGenericModelTypeRegistry();
    const matrix = createGenericModelCapabilityMatrix();
    const s = suiteOf([
      { adapter: mb1(), expectedModelType: 'cadastro' },
      { adapter: mb2(), expectedModelType: 'operacional' },
    ]);
    const d = createGenericModelMultiTypeDiagnostics({ registry: reg, capabilityMatrix: matrix, suite: s });
    assert.equal(d.readiness, 'ready');
    assert.equal(d.dangerousCapabilityStatus, 'all-false');
    assert.equal(d.backendTouched, false);
    assert.equal(d.persistenceReal, false);
  });

  // 33 / 34 / 35 / 36
  it('conformance falha: sem modelType; dangerous cap; operacional sem eventContract; cadastro sem readContract', () => {
    assert.equal(validateGenericModelAdapterConformance({ adapter: { ...mb1(), modelType: undefined } }).valid, false);
    assert.equal(validateGenericModelAdapterConformance({ adapter: { ...mb2(), capabilities: { ...mb2().capabilities, backendWrite: true } }, expectedModelType: 'operacional' }).valid, false);
    assert.equal(validateGenericModelAdapterConformance({ adapter: { ...mb2(), eventContract: undefined }, expectedModelType: 'operacional' }).valid, false);
    assert.equal(validateGenericModelAdapterConformance({ adapter: { ...mb1(), readContract: undefined, runtimeContract: undefined, mapReadToGeneric: undefined }, expectedModelType: 'cadastro' }).valid, false);
  });

  // 37 / 38
  it('retornos são cópias seguras; mutar retorno não altera estado interno', () => {
    const reg = createGenericModelTypeRegistry();
    const def = reg.get('cadastro');
    def.requiredContracts.push('INJECTED');
    assert.ok(!reg.get('cadastro').requiredContracts.includes('INJECTED'));
    const m = createGenericModelCapabilityMatrix();
    m.matrix.cadastro.backendWrite = true;
    assert.equal(createGenericModelCapabilityMatrix().matrix.cadastro.backendWrite, false);
  });

  // report is structured/serializable
  it('conformance report é estruturado e serializável', () => {
    const rep = createGenericModelAdapterConformanceReport({ adapter: mb1(), expectedModelType: 'cadastro' });
    assert.equal(rep.kind, 'generic-model-adapter-conformance-report');
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(rep)));
    assert.equal(rep.invariants.persistenceReal, false);
  });

  // 39 — no React (multi-type layers)
  it('generic multi-type não importa React', () => {
    assert.ok(multiTypeImports().every((p) => p !== 'react' && !/^react(\/|$)/.test(p)));
  });

  // 40 / 41 — generic multi-type não importa MB1/MB2 (isolamento; adapters só no teste)
  it('generic multi-type não importa ModeloBase1/ModeloBase2 (adapters injetados)', () => {
    assert.ok(multiTypeImports().every((p) => !/ModeloBase1|ModeloBase2/.test(p)));
  });

  // 42 / 43 — no backend/API/Prisma; no runtimeBridge/makBootstrap
  it('generic multi-type não importa backend/API/Prisma nem runtimeBridge/makBootstrap', () => {
    assert.ok(multiTypeImports().every((p) => !/\/apis\/|prisma|\/backend\//i.test(p)));
    assert.ok(multiTypeImports().every((p) => !/makBootstrap|runtimeBridge/.test(p)));
  });

  // 44 / 45 — no fetch/XHR; no storage API
  it('generic multi-type não usa fetch/XHR nem storage obrigatório', () => {
    const code = codeOnly(multiTypeSource());
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(code));
    assert.ok(!/localStorage\.|sessionStorage\.|indexedDB\./.test(code));
  });

  // adapter with unsafe payload target in descriptor is caught (defense in depth)
  it('conformance detecta forbidden target introduzido no descriptor do adapter', () => {
    const bad = { ...mb2(), backendUrl: '/api/write' };
    const r = validateGenericModelAdapterConformance({ adapter: bad, expectedModelType: 'operacional' });
    assert.equal(r.valid, false);
    assert.ok(r.blockers.includes('conformance:noForbiddenTargets'));
  });

  // capability matrix dangerousAllFalse
  it('capability matrix declara dangerousAllFalse=true', () => {
    assert.equal(createGenericModelCapabilityMatrix().dangerousAllFalse, true);
  });

  // suite next step
  it('suite/diagnostics apontam próximo passo = ModeloBase2 Operational Runtime Foundation', () => {
    const s = suiteOf([{ adapter: mb1(), expectedModelType: 'cadastro' }, { adapter: mb2(), expectedModelType: 'operacional' }]);
    assert.ok(s.nextSteps.some((x) => /ModeloBase2 Operational Runtime Foundation/.test(x)));
    assert.ok(!s.nextSteps.some((x) => /backend\s*write/i.test(x)));
  });

  // safety marker payloads via type definition (function/handler/react/pollution)
  it('type definition com handler/React element falha', () => {
    const base = GENERIC_MODEL_TYPE_DEFINITIONS.operacional;
    assert.equal(validateGenericModelTypeDefinition({ definition: { ...base, onClick: () => {} } }).valid, false);
    assert.equal(validateGenericModelTypeDefinition({ definition: { ...base, el: REACT_EL } }).valid, false);
  });
});
