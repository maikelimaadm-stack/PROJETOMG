/**
 * SLICE 48 — TYPECHECK ENVIRONMENT HYGIENE GOVERNANCE
 *
 * A P1-02A separa os contextos de typecheck e, para isso, precisa registrar quatro
 * scripts em `package.json` — que pertence ao domínio governado pelo Studio. Sua
 * presença no diff impede o curto-circuito `non_studio_branch` da Slice 46, o núcleo
 * cronológico assume, e sem uma fatia que assuma a propriedade do diff todos os
 * caminhos viram `unknown_scope`. Foi o que derrubou 68 testes no primeiro CI da PR #504.
 *
 * Esta fatia dá à branch a propriedade que faltava. Ela NÃO relaxa nada: unknown,
 * forbidden, mixed e o núcleo continuam fail-closed, e isso é provado aqui.
 *
 * Headless, determinística, em memória: sem rede, sem banco, sem dependência nova.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { STUDIO_SLICE_CATALOG } from '../../../scripts/gates/lib/studioScopeGovernanceRegistry.mjs';
import {
  evaluateStudioBranchScope,
  evaluateStudioBranchConsumerScope,
  resolveActiveStudioSlice,
  classifyStudioScopePath,
} from '../../../scripts/gates/lib/studioScopeGovernanceGuard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const SLICE = 'typecheck-environment-hygiene-governance';
const ORDINAL = 48;
const TEST_REL = `src/runtime/__tests__/${SLICE}.test.js`;
const GATE_REL = `scripts/gates/g423-${SLICE}.mjs`;
const EV_REL = `docs/evidence/post-foundation-c-${SLICE}/`;

/** Os dez artefatos que a P1-02A produz fora do território governado. */
const OWN_NON_GOVERNED = Object.freeze([
  'jsconfig.typecheck.json',
  'scripts/run-typecheck-governance.mjs',
  'scripts/run-governance-cycles.mjs',
  'scripts/tests/typecheck-scope-governance.test.mjs',
  'AGENTS.md',
  'docs/ai/skills/dev-workflow.md',
  'docs/engineering/CURRENT-STATE.md',
  'docs/engineering/TECH-DEBT.md',
  'docs/engineering/ENGINEERING-JOURNAL.md',
  'docs/engineering/P1-02A-TYPECHECK-ENVIRONMENT-HYGIENE-REPORT.md',
]);

/**
 * Os quatro consumidores históricos que afirmam a cardinalidade EXATA do catálogo e
 * quebraram ao crescer para 48. Nenhum outro precisou mudar.
 */
const CROSS_CORRECTED = Object.freeze([
  'src/runtime/__tests__/studio-scope-governance-non-studio-branch-applicability.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-branch-applicability.mjs',
  'src/runtime/__tests__/studio-scope-governance-non-studio-runtime-compatibility.test.js',
  'scripts/gates/g423-studio-scope-governance-non-studio-runtime-compatibility.mjs',
]);

const entry = () => STUDIO_SLICE_CATALOG.find((s) => s.sliceId === SLICE);
const consumer = (paths, caller = SLICE) =>
  evaluateStudioBranchConsumerScope(paths, { callerSliceId: caller });
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const changedOnThisBranch = () => {
  try {
    return execSync('git diff --name-only origin/main...HEAD', { cwd: ROOT, encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch { return null; }
};

// ===========================================================================
// A — CATÁLOGO
// ===========================================================================

test('A001 o catálogo tem exatamente 48 entradas', () => {
  assert.equal(STUDIO_SLICE_CATALOG.length, 49);
});

test('A002 os ordinais são contíguos de 1 a 48', () => {
  STUDIO_SLICE_CATALOG.forEach((s, i) => assert.equal(s.sliceOrdinal, i + 1));
});

test('A003 todo sliceId é único', () => {
  const ids = STUDIO_SLICE_CATALOG.map((s) => s.sliceId);
  assert.equal(new Set(ids).size, ids.length);
});

test('A004 esta fatia é a de ordinal 48', () => {
  const e = entry();
  assert.ok(e, 'entrada 48 ausente');
  assert.equal(e.sliceOrdinal, ORDINAL);
  assert.equal(STUDIO_SLICE_CATALOG[47].sliceId, SLICE);
});

test('A005 o status é merged', () => {
  assert.equal(entry().status, 'merged');
});

test('A006 as entradas 1..47 conservam a forma de dez chaves', () => {
  const KEYS = ['sliceId', 'sliceOrdinal', 'title', 'primaryArtifactPatterns',
    'branchMarkerPatterns', 'crossSliceAuthorizedPatterns', 'sharedGovernancePatterns',
    'explicitlyAuthorizedForbiddenPatterns', 'historicalBranchConsumerCompatibility', 'status'];
  for (const s of STUDIO_SLICE_CATALOG) {
    assert.deepEqual(Object.keys(s).sort(), [...KEYS].sort(), s.sliceId);
  }
});

test('A007 o catálogo está congelado', () => {
  assert.equal(Object.isFrozen(STUDIO_SLICE_CATALOG), true);
  for (const s of STUDIO_SLICE_CATALOG) assert.equal(Object.isFrozen(s), true);
});

// ===========================================================================
// B — OWNERSHIP
// ===========================================================================

test('B001 o marker é único e é apenas a pasta de evidência desta fatia', () => {
  const m = entry().branchMarkerPatterns;
  assert.equal(m.length, 1);
  assert.equal(m[0].test(`${EV_REL}README.md`), true);
  assert.equal(m[0].test('docs/evidence/post-foundation-c-studio-scope-governance-non-studio-runtime-compatibility/README.md'), false);
});

test('B002 nenhuma outra fatia reivindica este marker', () => {
  for (const s of STUDIO_SLICE_CATALOG) {
    if (s.sliceId === SLICE) continue;
    for (const m of s.branchMarkerPatterns) {
      assert.equal(m.test(`${EV_REL}README.md`), false, `${s.sliceId} reivindica o marker desta fatia`);
    }
  }
});

test('B003 os três artefatos canônicos são próprios', () => {
  const p = entry().primaryArtifactPatterns;
  assert.ok(p.some((r) => r.test(TEST_REL)));
  assert.ok(p.some((r) => r.test(GATE_REL)));
  assert.ok(p.some((r) => r.test(`${EV_REL}README.md`)));
});

test('B004 cada artefato próprio não-governado casa exatamente um padrão', () => {
  const p = entry().primaryArtifactPatterns;
  for (const f of OWN_NON_GOVERNED) {
    assert.equal(p.filter((r) => r.test(f)).length, 1, f);
  }
});

test('B005 todo padrão primário de arquivo é ancorado, sem curinga', () => {
  for (const r of entry().primaryArtifactPatterns) {
    assert.ok(r.source.startsWith('^'), r.source);
    assert.ok(!r.source.includes('.*'), `curinga: ${r.source}`);
    assert.ok(!r.source.includes('.+'), `curinga: ${r.source}`);
    // A única exceção legítima à âncora final é o diretório de evidência desta fatia.
    if (!r.source.endsWith('$')) {
      assert.ok(r.source.includes('docs\\/evidence\\/post-foundation-c-typecheck-environment-hygiene-governance'),
        `padrão sem âncora final que não é a evidência desta fatia: ${r.source}`);
    }
  }
});

test('B006 nenhum artefato próprio admite caminho de produto, backend ou Prisma', () => {
  const PROIBIDOS = ['backend/src/server.js', 'src/App.jsx', 'src/main.jsx',
    'prisma/schema.prisma', 'src/modules/x.js', 'src/framework/x.js', 'src/shared/ui/x.jsx',
    '.github/workflows/foundation-governance.yml', 'package-lock.json'];
  for (const r of entry().primaryArtifactPatterns) {
    for (const f of PROIBIDOS) assert.equal(r.test(f), false, `${r.source} admite ${f}`);
  }
});

test('B007 governança compartilhada é exatamente registry + package.json', () => {
  const sh = entry().sharedGovernancePatterns;
  assert.equal(sh.length, 2);
  assert.ok(sh.some((r) => r.test('scripts/gates/lib/studioScopeGovernanceRegistry.mjs')));
  assert.ok(sh.some((r) => r.test('package.json')));
});

test('B008 package-lock NÃO é autorizado — não muda nesta fatia', () => {
  const e = entry();
  const todos = [...e.sharedGovernancePatterns, ...e.crossSliceAuthorizedPatterns,
    ...e.primaryArtifactPatterns];
  assert.ok(!todos.some((r) => r.test('package-lock.json')), 'autorização vazia');
});

test('B009 o guard NÃO é autorizado — não é alterado por esta fatia', () => {
  const e = entry();
  const todos = [...e.sharedGovernancePatterns, ...e.crossSliceAuthorizedPatterns,
    ...e.primaryArtifactPatterns];
  for (const g of ['scripts/gates/lib/studioScopeGovernanceGuard.mjs',
    'scripts/gates/lib/productionUiGuard.mjs']) {
    assert.ok(!todos.some((r) => r.test(g)), `${g} não deve ser autorizado`);
  }
});

test('B010 cross-slice authorizations: uma por consumidor de cardinalidade quebrado', () => {
  const pats = entry().crossSliceAuthorizedPatterns;
  assert.equal(pats.length, CROSS_CORRECTED.length);
  assert.equal(CROSS_CORRECTED.length, 4);
  for (const f of CROSS_CORRECTED) assert.equal(pats.filter((r) => r.test(f)).length, 1, f);
  for (const r of pats) assert.equal(CROSS_CORRECTED.filter((f) => r.test(f)).length, 1, r.source);
});

test('B010b toda autorização cruzada é ancorada, sem curinga', () => {
  for (const r of entry().crossSliceAuthorizedPatterns) {
    assert.ok(r.source.startsWith('^') && r.source.endsWith('$'), r.source);
    assert.ok(!r.source.includes('.*') && !r.source.includes('.+'), r.source);
  }
});

test('B010c os quatro corrigidos acompanharam o catálogo', () => {
  // Correção P1-02B: a versão anterior congelava o literal 48 e envelhecia no instante
  // em que o catálogo crescesse — a mesma armadilha que A012 já corrigira na fatia 47.
  // Agora a asserção é RELATIVA ao catálogo vigente: cada arquivo corrigido precisa
  // afirmar a cardinalidade real, seja ela qual for.
  const n = STUDIO_SLICE_CATALOG.length;
  for (const f of CROSS_CORRECTED) {
    const src = read(f);
    const afirmacoes = [...src.matchAll(/STUDIO_SLICE_CATALOG\.length(?:,| ===) (\d+)/g)]
      .map((m) => Number(m[1]));
    assert.ok(afirmacoes.length > 0, `${f} não afirma a cardinalidade do catálogo`);
    assert.deepEqual([...new Set(afirmacoes)], [n],
      `${f} afirma ${JSON.stringify(afirmacoes)}, catálogo vigente é ${n}`);
  }
});

test('B011 zero autorização explícita de caminho proibido', () => {
  assert.deepEqual(entry().explicitlyAuthorizedForbiddenPatterns, []);
});

test('B012 esta fatia não declara compatibilidade histórica', () => {
  assert.equal(entry().historicalBranchConsumerCompatibility, false);
});

// ===========================================================================
// C — A BRANCH ATUAL
// ===========================================================================

test('C001 esta branch resolve exatamente a Slice 48, ou uma fatia posterior', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const a = resolveActiveStudioSlice(f);
  // A resolução precisa ser SEMPRE inequívoca — isto nunca é dispensado.
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.candidates.length, 1, JSON.stringify(a.candidates));
  // ESCOPO DE BRANCH PRÓPRIA (P1-02B): quando a fatia ativa é ESTRITAMENTE POSTERIOR, esta
  // branch não é a desta fatia. A inaplicabilidade é afirmada, nunca pulada; e a branch
  // da fatia posterior ainda precisa estar integralmente autorizada.
  if (a.sliceOrdinal > ORDINAL) {
    const r = consumer(f);
    assert.equal(r.certifiedAgainstActiveSlice, false);
    assert.deepEqual(r.blockers, [], JSON.stringify(r.blockers));
    assert.equal(r.safe, true);
    return;
  }
  assert.deepEqual(a.candidates, [SLICE]);
});

test('C002 esta branch é sound: safe, sem unknown, forbidden ou violação cronológica', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const r = consumer(f);
  assert.deepEqual(r.unknown, []);
  assert.deepEqual(r.forbidden, []);
  assert.deepEqual(r.chronologicalViolation, []);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});

test('C003 o núcleo também aprova esta branch', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const core = evaluateStudioBranchScope(f, { callerSliceId: SLICE });
  assert.equal(core.safe, true, JSON.stringify(core.blockers));
});

// ===========================================================================
// D — ESCOPO DA BRANCH
// ===========================================================================

test('D001 esta branch não toca produto, backend, Prisma, migration ou workflow', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  // ESCOPO DE BRANCH PRÓPRIA (P1-02B). A fatia 49 possui o workflow e precisa editá-lo.
  // Numa branch de fatia ESTRITAMENTE POSTERIOR este check não tem sujeito — afirmado,
  // nunca pulado. As regras de backend, Prisma e produto continuam sendo verificadas
  // para TODA branch, inclusive a posterior, logo abaixo.
  const a = resolveActiveStudioSlice(f);
  const posterior = a.ok && a.sliceOrdinal > ORDINAL;
  if (posterior) {
    const r = consumer(f);
    assert.equal(r.certifiedAgainstActiveSlice, false);
    assert.deepEqual(r.blockers, [], JSON.stringify(r.blockers));
    assert.equal(r.safe, true);
    // O que NUNCA é dispensado, nem para uma fatia posterior:
    for (const p of f) {
      assert.equal(/^backend\//.test(p), false, p);
      assert.equal(/^prisma\//.test(p), false, p);
      assert.equal(/migrations?\//.test(p), false, p);
      assert.equal(p === 'package-lock.json', false, p);
      assert.equal(p === 'src/App.jsx', false, p);
      assert.equal(/^src\/(modules|framework)\//.test(p), false, p);
    }
    return;
  }
  for (const p of f) {
    assert.equal(/^backend\//.test(p), false, p);
    assert.equal(/^prisma\//.test(p), false, p);
    assert.equal(/migrations?\//.test(p), false, p);
    assert.equal(/^\.github\//.test(p), false, p);
    assert.equal(/^src\/(App\.jsx|main\.jsx|shared|framework|modules|bos|intelligence|apis|ModeloBase1|ModeloBase2)/.test(p), false, p);
    assert.equal(p === 'package-lock.json', false, p);
  }
});

test('D002 a única alteração em src/runtime desta branch é o teste desta fatia', () => {
  const f = changedOnThisBranch();
  if (f === null || f.length === 0) return;
  const runtime = f.filter((p) => p.startsWith('src/runtime/'));
  for (const p of runtime) {
    assert.ok(p.startsWith('src/runtime/__tests__/'), `produção de runtime alterada: ${p}`);
  }
});

test('D003 o guard e o productionUiGuard não estão no diff', () => {
  const f = changedOnThisBranch();
  if (f === null) return;
  assert.equal(f.includes('scripts/gates/lib/studioScopeGovernanceGuard.mjs'), false);
  assert.equal(f.includes('scripts/gates/lib/productionUiGuard.mjs'), false);
});

// ===========================================================================
// E — A P1-02A CONTINUA INTACTA
// ===========================================================================

test('E001 o config de produção existe e estende o base', () => {
  const cfg = JSON.parse(read('jsconfig.typecheck.json'));
  assert.equal(cfg.extends, './jsconfig.json');
});

test('E002 types: [] é preservado e não redeclarado', () => {
  const base = JSON.parse(read('jsconfig.json'));
  const prod = JSON.parse(read('jsconfig.typecheck.json'));
  assert.deepEqual(base.compilerOptions.types, []);
  assert.equal(prod.compilerOptions?.types, undefined);
});

test('E003 a única exclusão nova é a raiz de testes de runtime', () => {
  const base = new Set(JSON.parse(read('jsconfig.json')).exclude ?? []);
  const prod = JSON.parse(read('jsconfig.typecheck.json')).exclude ?? [];
  assert.deepEqual(prod.filter((e) => !base.has(e)), ['src/runtime/__tests__']);
});

test('E004 a baseline de typecheck existe e é única — entregue por P1-02B', () => {
  // Supersessão P1-02B. Esta asserção nasceu afirmando a AUSÊNCIA da baseline, porque
  // criá-la era escopo da fatia seguinte e não desta. A fatia seguinte chegou. A
  // asserção passou a ser falsa por SUCESSO, e por isso foi reescrita para exigir o
  // estado que a substituiu — nunca removida, nunca pulada. A evidência de P1-02A
  // permanece imutável; a supersessão é declarada aqui.
  const dir = path.join(ROOT, 'config');
  assert.ok(fs.existsSync(dir), 'config/ precisa existir');
  const b = fs.readdirSync(dir).filter((x) => /baseline/i.test(x) && /typecheck/i.test(x));
  assert.deepEqual(b, ['typecheck-production-baseline.json'],
    'esperada exatamente uma baseline de typecheck');
  const doc = JSON.parse(fs.readFileSync(path.join(dir, b[0]), 'utf8'));
  // Ela governa o escopo de PRODUÇÃO que ESTA fatia definiu, e nada além dele.
  assert.equal(doc.project, './jsconfig.typecheck.json');
  for (const e of doc.entries) {
    assert.ok(!e.path.startsWith('src/runtime/__tests__/'),
      `a baseline invadiu o escopo de testes: ${e.path}`);
  }
});

test('E005 os scripts desta fatia estão registrados na convenção do repositório', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts[`test:runtime:${SLICE}`], `node --test ${TEST_REL}`);
  assert.equal(pkg.scripts[`gate:g423-${SLICE}`], `node ${GATE_REL}`);
  assert.ok(pkg.scripts['test:runtime'].includes(TEST_REL), 'teste ausente de test:runtime');
});

test('E006 nenhuma dependência foi adicionada', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.devDependencies['@types/node'], '^22.13.5');
  assert.equal(pkg.dependencies?.['@types/node'], undefined);
});

// ===========================================================================
// F — FAIL-CLOSED: NADA FOI RELAXADO
// ===========================================================================

const BRANCH_BASE = Object.freeze([
  'package.json',
  'scripts/gates/lib/studioScopeGovernanceRegistry.mjs',
  TEST_REL,
  GATE_REL,
  `${EV_REL}README.md`,
  ...OWN_NON_GOVERNED,
]);

test('F001 o diff desta fatia, isolado, é seguro', () => {
  const r = consumer([...BRANCH_BASE]);
  assert.equal(r.activeSliceId, SLICE);
  assert.equal(r.safe, true, JSON.stringify(r.blockers));
});

for (const [id, intruso, esperado] of [
  ['F002', 'src/studio/unregistered-future-artifact.js', 'unknown'],
  ['F003', 'src/runtime/__tests__/unregistered-future.test.js', 'unknown'],
  ['F004', 'scripts/gates/unregistered-future-gate.mjs', 'unknown'],
  ['F005', 'backend/src/server.js', 'forbidden'],
  ['F006', 'src/App.jsx', 'forbidden'],
  ['F007', 'prisma/schema.prisma', 'forbidden'],
]) {
  test(`${id} diff misto continua fail-closed: + ${intruso}`, () => {
    const r = consumer([...BRANCH_BASE, intruso]);
    assert.equal(r.safe, false, `${intruso} passou`);
    if (esperado === 'forbidden') assert.ok(r.forbidden.includes(intruso), JSON.stringify(r.forbidden));
    else assert.ok(r.unknown.includes(intruso), JSON.stringify(r.unknown));
  });
}

test('F008 o núcleo reprova o mesmo diff misto', () => {
  const core = evaluateStudioBranchScope([...BRANCH_BASE, 'backend/src/server.js'], { callerSliceId: SLICE });
  assert.equal(core.safe, false);
  assert.ok(core.blockers.includes('forbidden_scope'), JSON.stringify(core.blockers));
});

test('F009 diff vazio continua sendo empty_branch_diff', () => {
  const r = consumer([]);
  assert.equal(r.reason, 'empty_branch_diff');
  assert.equal(r.activeSliceId, null);
  assert.equal(r.safe, true);
});

test('F010 backend, App.jsx e Prisma continuam forbidden_scope no classificador', () => {
  for (const p of ['backend/src/server.js', 'src/App.jsx', 'prisma/schema.prisma']) {
    assert.equal(classifyStudioScopePath(p), 'forbidden_scope', p);
  }
});

test('F011 uma branch que resolve duas fatias continua ambígua', () => {
  const r = resolveActiveStudioSlice([
    `${EV_REL}README.md`,
    'docs/evidence/post-foundation-c-studio-scope-governance-non-studio-runtime-compatibility/README.md',
  ]);
  assert.equal(r.ok, false);
  assert.equal(r.candidates.length, 2);
});

test('F012 o wrapper deixou de ser ponte permissiva — P1-02B removeu o blocker', () => {
  // Supersessão P1-02B. Esta asserção exigia que o bypass permanecesse EXPLÍCITO
  // enquanto existisse — a fatia 48 não podia removê-lo, mas também não podia
  // disfarçá-lo. P1-02B o removeu de fato. Exigir hoje a marca `BYPASS CONHECIDO`
  // seria exigir que o bypass voltasse.
  const src = read('scripts/run-typecheck-governance.mjs');
  // A história não some: o arquivo continua nomeando a fatia que fechou o blocker.
  assert.ok(src.includes('P1-02B'), 'falta declarar quem removeu o bypass');
  assert.ok(/FAIL-CLOSED/.test(src), 'o wrapper precisa declarar o regime vigente');
  // E o enforcement precisa estar ancorado numa baseline, não numa concessão.
  assert.ok(src.includes('compareToBaseline'), 'o wrapper não compara contra a baseline');
});

// ===========================================================================
// S — ARTEFATOS PRESENTES
// ===========================================================================

test('S001 teste, gate e evidência desta fatia existem', () => {
  assert.ok(fs.existsSync(path.join(ROOT, TEST_REL)));
  assert.ok(fs.existsSync(path.join(ROOT, GATE_REL)));
  const dir = path.join(ROOT, EV_REL);
  assert.ok(fs.existsSync(dir));
  assert.ok(fs.readdirSync(dir).length >= 2);
});
